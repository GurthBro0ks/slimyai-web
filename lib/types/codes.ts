/**
 * Core types for the codes aggregation system
 */

export type SourceName = "discord" | "reddit" | "twitter" | "wiki" | "pocketgamer" | "snelp";

export type SourceStatus = "ok" | "degraded" | "failed" | "not_configured";

export interface Code {
  code: string;
  source: SourceName;
  ts: string; // ISO timestamp
  tags: string[];
  expires: string | null; // ISO timestamp or null
  region: string;
  description?: string;
  verified?: boolean; // True if from high-trust source or multiple confirmations
  trustWeight?: number; // Cumulative trust from all sources
  provenance?: string[]; // List of all sources that reported this code
  url?: string; // Source URL (e.g., Discord message link, tweet URL)
}

export interface SourceMeta {
  status: SourceStatus;
  lastFetch: string; // ISO timestamp
  itemCount: number;
  error?: string;
}

export interface CodesResponse {
  codes: Code[];
  sources: Record<SourceName, SourceMeta>;
  generatedAt: string;
}

/**
 * Configuration for each adapter's trust level
 * Higher trust = more likely to be verified
 */
export const TRUST_WEIGHTS: Record<SourceName, number> = {
  discord: 1.0,   // Official Discord - high trust
  twitter: 0.8,   // Official Twitter - good trust
  wiki: 1.0,      // Wiki (curated) - high trust
  reddit: 0.5,    // Community posts - medium trust
  pocketgamer: 0.7, // Gaming site - good trust
  snelp: 0.6,     // Third-party API - medium-good trust
};

/**
 * Verification threshold: if combined trust weight ≥ this within 24h, mark as verified
 */
export const VERIFICATION_THRESHOLD = 1.5;

/**
 * Time window for trust weight accumulation (milliseconds)
 */
export const TRUST_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
