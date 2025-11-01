/**
 * Pocket Gamer Scraper Adapter (Firecrawl-based)
 * Scrapes codes from Pocket Gamer guides
 * Note: Would use Firecrawl API in production; placeholder for now
 */

import { BaseAdapter, AdapterResult } from "./base";
import { Code, TRUST_WEIGHTS } from "@/lib/types/codes";

export class PocketGamerAdapter extends BaseAdapter {
  private apiKey: string;
  private guideUrls = [
    "https://www.pocketgamer.com/super-snail/codes/",
  ];

  constructor() {
    const apiKey = process.env.FIRECRAWL_API_KEY || "";

    super("pocketgamer", {
      enabled: false, // Disabled for now - would need Firecrawl integration
      apiKey,
      timeout: 15000,
    });

    this.apiKey = apiKey;
  }

  async fetch(): Promise<AdapterResult> {
    if (!this.isEnabled()) {
      return {
        codes: [],
        meta: {
          status: "not_configured",
          lastFetch: new Date().toISOString(),
          itemCount: 0,
          error: "PocketGamer scraper not enabled (would require Firecrawl API)",
        },
      };
    }

    // Placeholder: In production, would use Firecrawl to scrape guides
    // Example flow:
    // 1. POST to Firecrawl API with guide URLs
    // 2. Extract code lists from articles
    // 3. Parse and normalize codes
    // 4. Return with trust weight

    console.warn("[PocketGamer] Adapter not fully implemented - requires Firecrawl integration");

    return {
      codes: [],
      meta: {
        status: "not_configured",
        lastFetch: new Date().toISOString(),
        itemCount: 0,
        error: "PocketGamer scraper requires Firecrawl API integration",
      },
    };
  }
}
