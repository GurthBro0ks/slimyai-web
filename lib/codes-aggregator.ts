/**
 * Codes Aggregator
 * Merges codes from multiple sources (Snelp, Reddit) with deduplication
 */

export interface Code {
  code: string;
  source: "snelp" | "reddit";
  ts: string;
  tags: string[];
  expires: string | null;
  region: string;
  description?: string;
}

export interface CodesResponse {
  codes: Code[];
  sources: {
    snelp: { count: number; lastFetch: string };
    reddit: { count: number; lastFetch: string };
  };
}

/**
 * Fetch codes from Snelp API
 */
async function fetchSnelpCodes(): Promise<Code[]> {
  const url = process.env.NEXT_PUBLIC_SNELP_CODES_URL;
  if (!url) {
    console.warn("NEXT_PUBLIC_SNELP_CODES_URL not configured");
    return [];
  }

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60s
    });

    if (!response.ok) {
      console.error(`Snelp API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Transform Snelp format to our format
    return (data.codes || []).map((code: any) => ({
      code: code.code || code.text,
      source: "snelp" as const,
      ts: code.timestamp || new Date().toISOString(),
      tags: code.active ? ["active"] : [],
      expires: code.expiresAt || null,
      region: code.region || "global",
      description: code.description,
    }));
  } catch (error) {
    console.error("Failed to fetch Snelp codes:", error);
    return [];
  }
}

/**
 * Fetch codes from Reddit r/SuperSnailGame
 */
async function fetchRedditCodes(): Promise<Code[]> {
  try {
    const response = await fetch(
      "https://www.reddit.com/r/SuperSnailGame/search.json?q=code&restrict_sr=1&sort=new&limit=50",
      {
        headers: {
          "User-Agent": "Slimy.ai/1.0",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.error(`Reddit API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const posts = data.data?.children || [];

    const codes: Code[] = [];
    const codePattern = /\b[A-Z0-9]{6,12}\b/g;

    for (const post of posts) {
      const title = post.data.title || "";
      const selftext = post.data.selftext || "";
      const text = `${title} ${selftext}`;

      // Extract potential codes
      const matches = text.match(codePattern);
      if (matches) {
        for (const match of matches) {
          // Filter out common false positives
          if (
            match.length >= 6 &&
            match.length <= 12 &&
            !/^[0-9]+$/.test(match) // Not all numbers
          ) {
            codes.push({
              code: match,
              source: "reddit" as const,
              ts: new Date(post.data.created_utc * 1000).toISOString(),
              tags: ["reddit"],
              expires: null,
              region: "global",
              description: title.substring(0, 100),
            });
          }
        }
      }
    }

    return codes;
  } catch (error) {
    console.error("Failed to fetch Reddit codes:", error);
    return [];
  }
}

/**
 * Deduplicate codes by code string
 */
function deduplicateCodes(codes: Code[]): Code[] {
  const seen = new Set<string>();
  const unique: Code[] = [];

  for (const code of codes) {
    const key = code.code.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(code);
    }
  }

  return unique;
}

/**
 * Filter codes by scope
 */
export function filterByScope(codes: Code[], scope: string): Code[] {
  const now = new Date();

  switch (scope) {
    case "active":
      return codes.filter((code) => {
        if (code.expires) {
          return new Date(code.expires) > now;
        }
        return code.tags.includes("active");
      });

    case "past7":
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return codes.filter((code) => new Date(code.ts) > sevenDaysAgo);

    case "all":
    default:
      return codes;
  }
}

/**
 * Aggregate codes from all sources
 */
export async function aggregateCodes(): Promise<CodesResponse> {
  const [snelpCodes, redditCodes] = await Promise.all([
    fetchSnelpCodes(),
    fetchRedditCodes(),
  ]);

  const allCodes = [...snelpCodes, ...redditCodes];
  const uniqueCodes = deduplicateCodes(allCodes);

  // Sort by timestamp (newest first)
  uniqueCodes.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  return {
    codes: uniqueCodes,
    sources: {
      snelp: {
        count: snelpCodes.length,
        lastFetch: new Date().toISOString(),
      },
      reddit: {
        count: redditCodes.length,
        lastFetch: new Date().toISOString(),
      },
    },
  };
}

/**
 * Search codes by query string
 */
export function searchCodes(codes: Code[], query: string): Code[] {
  if (!query.trim()) {
    return codes;
  }

  const lowerQuery = query.toLowerCase();

  return codes.filter((code) => {
    return (
      code.code.toLowerCase().includes(lowerQuery) ||
      code.description?.toLowerCase().includes(lowerQuery) ||
      code.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}
