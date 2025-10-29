import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds with background revalidate

interface Code {
  code: string;
  source: "snelp" | "reddit" | "sample";
  ts: string;
  tags?: string[];
  expires?: string | null;
  region?: string | null;
}

interface RedditPost {
  data: {
    children: Array<{
      data: {
        title: string;
        selftext: string;
        created_utc: number;
        url: string;
      };
    }>;
  };
}

function extractCodesFromText(text: string): string[] {
  // Conservative regex to match codes like: ABCD-1234-EFGH or ABCD1234EFGH
  const codeRegex = /(?:code|redeem|gift)\s*[:\-]?\s*([A-Z0-9]{4,}[-]?[A-Z0-9]{4,}[-]?[A-Z0-9]{4,})/gi;
  const matches: string[] = [];
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match[1]) {
      matches.push(match[1].toUpperCase());
    }
  }

  return matches;
}

async function fetchSnelpCodes(scope: string): Promise<Code[]> {
  const snelpUrl = process.env.NEXT_PUBLIC_SNELP_CODES_URL;
  if (!snelpUrl) return [];

  try {
    const response = await fetch(`${snelpUrl}?scope=${scope}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.codes || []).map((code: Code) => ({
      ...code,
      source: "snelp" as const,
    }));
  } catch (error) {
    console.error("Snelp codes fetch error:", error);
    return [];
  }
}

async function fetchRedditCodes(): Promise<Code[]> {
  try {
    const response = await fetch(
      "https://www.reddit.com/r/SuperSnailGame/search.json?q=code%20OR%20%22secret%20code%22&restrict_sr=1&sort=new&t=month",
      {
        headers: {
          "User-Agent": "slimyai-web/1.0",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) return [];

    const data: RedditPost = await response.json();
    const codes: Code[] = [];

    for (const post of data.data.children) {
      const text = `${post.data.title} ${post.data.selftext}`;
      const extractedCodes = extractCodesFromText(text);

      for (const code of extractedCodes) {
        codes.push({
          code,
          source: "reddit",
          ts: new Date(post.data.created_utc * 1000).toISOString(),
          tags: ["reddit"],
          expires: null,
          region: null,
        });
      }
    }

    return codes;
  } catch (error) {
    console.error("Reddit codes fetch error:", error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") || "active";

  try {
    // Fetch from both sources in parallel
    const [snelpCodes, redditCodes] = await Promise.all([
      fetchSnelpCodes(scope),
      fetchRedditCodes(),
    ]);

    // Merge and deduplicate
    const allCodes = [...snelpCodes, ...redditCodes];
    const codeMap = new Map<string, Code>();

    for (const code of allCodes) {
      const normalizedCode = code.code.replace(/[-\s]/g, "").toUpperCase();
      
      // Keep the first occurrence (prefer Snelp over Reddit)
      if (!codeMap.has(normalizedCode)) {
        codeMap.set(normalizedCode, code);
      }
    }

    // Convert back to array and sort by timestamp (newest first)
    let codes = Array.from(codeMap.values()).sort(
      (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
    );

    // Apply scope filter
    if (scope === "active") {
      const now = new Date();
      codes = codes.filter((code) => {
        if (!code.expires) return true;
        return new Date(code.expires) > now;
      });
    } else if (scope === "past7") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      codes = codes.filter((code) => new Date(code.ts) > weekAgo);
    }

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Codes aggregator error:", error);
    return NextResponse.json(
      {
        ok: false,
        code: "AGGREGATOR_ERROR",
        message: "Failed to aggregate codes",
      },
      { status: 500 }
    );
  }
}
