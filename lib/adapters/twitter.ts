/**
 * Twitter API v2 Adapter (API-first, optional)
 * Fetches codes from @SuperSnailUS timeline
 * Only runs when TWITTER_BEARER_TOKEN is set
 */

import { BaseAdapter, AdapterResult } from "./base";
import { Code, TRUST_WEIGHTS } from "@/lib/types/codes";

interface TwitterUser {
  id: string;
  username: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
}

interface TwitterResponse {
  data?: TwitterTweet[];
  includes?: {
    users?: TwitterUser[];
  };
  meta?: {
    result_count: number;
  };
}

export class TwitterAdapter extends BaseAdapter {
  private bearerToken: string;
  private username = "SuperSnailUS";
  private userId?: string;

  constructor() {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN || "";

    super("twitter", {
      enabled: !!bearerToken,
      timeout: 10000,
    });

    this.bearerToken = bearerToken;
  }

  async fetch(): Promise<AdapterResult> {
    if (!this.isEnabled()) {
      return {
        codes: [],
        meta: {
          status: "not_configured",
          lastFetch: new Date().toISOString(),
          itemCount: 0,
          error: "Twitter API credentials not configured",
        },
      };
    }

    try {
      // Lookup user ID first
      await this.lookupUserId();

      if (!this.userId) {
        return {
          codes: [],
          meta: this.createErrorMeta("Could not find Twitter user"),
        };
      }

      // Fetch recent tweets
      const tweets = await this.fetchUserTweets();
      const codes = this.parseTweets(tweets);

      return {
        codes,
        meta: this.createSuccessMeta(codes.length),
      };
    } catch (error) {
      console.error("[Twitter] Fetch error:", error);
      return {
        codes: [],
        meta: this.createErrorMeta(error instanceof Error ? error.message : "Unknown error"),
      };
    }
  }

  private async lookupUserId(): Promise<void> {
    if (this.userId) return;

    const response = await this.twitterRequest(
      `https://api.twitter.com/2/users/by/username/${this.username}`
    );

    if (response.data) {
      this.userId = response.data.id;
    }
  }

  private async fetchUserTweets(maxResults: number = 100): Promise<TwitterTweet[]> {
    if (!this.userId) return [];

    const url = new URL(`https://api.twitter.com/2/users/${this.userId}/tweets`);
    url.searchParams.set("max_results", String(Math.min(maxResults, 100)));
    url.searchParams.set("tweet.fields", "created_at");

    const response = await this.twitterRequest(url.toString());

    return response.data || [];
  }

  private async twitterRequest(url: string, retries: number = 2): Promise<any> {
    const userAgent = this.getUserAgent();
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.bearerToken}`,
        "User-Agent": userAgent,
      },
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Rate limited - exponential backoff
        const retryAfter = parseInt(response.headers.get("x-rate-limit-reset") || "60");
        const now = Math.floor(Date.now() / 1000);
        const waitTime = Math.min((retryAfter - now) * 1000, 60000); // Cap at 60s

        console.warn(`[Twitter] Rate limited, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));

        return this.twitterRequest(url, retries - 1);
      }
      throw new Error(`Twitter API error: ${response.status}`);
    }

    return response.json();
  }

  private parseTweets(tweets: TwitterTweet[]): Code[] {
    const codes: Code[] = [];

    for (const tweet of tweets) {
      // Look for tweets that likely contain codes
      const lowerText = tweet.text.toLowerCase();
      const isCodeTweet =
        lowerText.includes("code") ||
        lowerText.includes("gift") ||
        lowerText.includes("redeem") ||
        /\b[A-Z0-9]{6,12}\b/.test(tweet.text);

      if (!isCodeTweet) continue;

      const extractedCodes = this.extractCodes(tweet.text);

      for (const codeStr of extractedCodes) {
        codes.push({
          code: codeStr,
          source: "twitter",
          ts: tweet.created_at,
          tags: ["twitter", "official"],
          expires: null,
          region: "global",
          description: tweet.text.substring(0, 100),
          verified: true, // Twitter official account is high-trust
          trustWeight: TRUST_WEIGHTS.twitter,
          provenance: ["twitter"],
          url: `https://twitter.com/${this.username}/status/${tweet.id}`,
        });
      }
    }

    return codes;
  }
}
