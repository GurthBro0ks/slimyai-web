/**
 * Snelp API Adapter
 * Fetches codes from Snelp (third-party aggregator)
 */

import { BaseAdapter, AdapterResult } from "./base";
import { Code, TRUST_WEIGHTS } from "@/lib/types/codes";

interface SnelpCodeRaw {
  code?: string;
  text?: string;
  timestamp?: string;
  active?: boolean;
  expiresAt?: string | null;
  region?: string;
  description?: string;
}

interface SnelpResponse {
  codes?: SnelpCodeRaw[];
}

export class SnelpAdapter extends BaseAdapter {
  private url: string;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SNELP_CODES_URL || "";

    super("snelp", {
      enabled: !!url,
      url,
      timeout: 10000,
    });

    this.url = url;
  }

  async fetch(): Promise<AdapterResult> {
    if (!this.isEnabled()) {
      return {
        codes: [],
        meta: {
          status: "not_configured",
          lastFetch: new Date().toISOString(),
          itemCount: 0,
          error: "Snelp API URL not configured",
        },
      };
    }

    try {
      const userAgent = this.getUserAgent();
      const response = await fetch(this.url, {
        headers: {
          "User-Agent": userAgent,
        },
      });

      if (!response.ok) {
        throw new Error(`Snelp API error: ${response.status}`);
      }

      const data: SnelpResponse = await response.json();
      const codes = this.parseCodes(data.codes || []);

      return {
        codes,
        meta: this.createSuccessMeta(codes.length),
      };
    } catch (error) {
      console.error("[Snelp] Fetch error:", error);
      return {
        codes: [],
        meta: this.createErrorMeta(error instanceof Error ? error.message : "Unknown error"),
      };
    }
  }

  private parseCodes(rawCodes: SnelpCodeRaw[]): Code[] {
    const parsed: Code[] = [];

    for (const raw of rawCodes) {
      const candidate = raw.code || raw.text || "";
      const normalized = this.normalizeCode(candidate);

      if (!normalized) {
        continue;
      }

      parsed.push({
        code: normalized,
        source: "snelp" as const,
        ts: raw.timestamp || new Date().toISOString(),
        tags: raw.active ? ["active", "snelp"] : ["snelp"],
        expires: raw.expiresAt || null,
        region: raw.region || "global",
        description: raw.description,
        verified: false,
        trustWeight: TRUST_WEIGHTS.snelp,
        provenance: ["snelp"],
      });
    }

    return parsed;
  }
}
