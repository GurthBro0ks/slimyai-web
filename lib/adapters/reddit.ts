/**
 * Reddit API Adapter (API-first, no auth required for public endpoints)
 * Fetches codes from r/SuperSnailGame
 */

import { BaseAdapter, AdapterResult } from "./base";
import { Code, TRUST_WEIGHTS } from "@/lib/types/codes";

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    created_utc: number;
    url: string;
    author: string;
    permalink: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

export class RedditAdapter extends BaseAdapter {
  private subreddit = "SuperSnailGame";

  constructor() {
    super("reddit", {
      enabled: true, // Reddit API is public, always enabled
      timeout: 10000,
    });
  }

  async fetch(): Promise<AdapterResult> {
    try {
      const posts = await this.fetchPosts();
      const codes = this.parsePosts(posts);

      return {
        codes,
        meta: this.createSuccessMeta(codes.length),
      };
    } catch (error) {
      console.error("[Reddit] Fetch error:", error);
      return {
        codes: [],
        meta: this.createErrorMeta(error instanceof Error ? error.message : "Unknown error"),
      };
    }
  }

  private async fetchPosts(): Promise<RedditPost[]> {
    const searchQueries = ["code", "gift code", "redeem"];
    const allPosts: RedditPost[] = [];
    const userAgent = this.getUserAgent();

    for (const query of searchQueries) {
      const url = new URL(`https://www.reddit.com/r/${this.subreddit}/search.json`);
      url.searchParams.set("q", query);
      url.searchParams.set("restrict_sr", "1");
      url.searchParams.set("sort", "new");
      url.searchParams.set("limit", "25");
      url.searchParams.set("t", "week"); // Only past week

      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": userAgent,
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn("[Reddit] Rate limited, skipping further queries");
          break;
        }
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data: RedditResponse = await response.json();
      allPosts.push(...data.data.children);

      // Small delay between queries
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Deduplicate by post ID
    const seen = new Set<string>();
    return allPosts.filter(post => {
      if (seen.has(post.data.id)) return false;
      seen.add(post.data.id);
      return true;
    });
  }

  private parsePosts(posts: RedditPost[]): Code[] {
    const codes: Code[] = [];

    for (const post of posts) {
      const text = `${post.data.title} ${post.data.selftext}`;
      const extractedCodes = this.extractCodes(text);

      for (const codeStr of extractedCodes) {
        codes.push({
          code: codeStr,
          source: "reddit",
          ts: new Date(post.data.created_utc * 1000).toISOString(),
          tags: ["reddit"],
          expires: null,
          region: "global",
          description: post.data.title.substring(0, 100),
          verified: false, // Reddit needs confirmation
          trustWeight: TRUST_WEIGHTS.reddit,
          provenance: ["reddit"],
          url: `https://www.reddit.com${post.data.permalink}`,
        });
      }
    }

    return codes;
  }
}
