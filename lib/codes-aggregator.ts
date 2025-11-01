/**
 * Codes Aggregator (Refactored with Adapter Pattern)
 * API-first approach with trust-based verification
 */

import { getAllAdapters } from "./adapters";
import { deduplicateWithTrust, filterByScope, sortByRelevance } from "./dedupe";
import { Code, CodesResponse, SourceMeta, SourceName } from "./types/codes";

// Re-export types and utilities for backward compatibility
export type { Code, CodesResponse, SourceMeta };
export { filterByScope };

/**
 * Aggregate codes from all configured sources
 */
export async function aggregateCodes(): Promise<CodesResponse> {
  const adapters = getAllAdapters();
  const enabledAdapters = adapters.filter(adapter => adapter.isEnabled());

  console.log(`[Aggregator] Running ${enabledAdapters.length} enabled adapters`);

  // Fetch from all sources in parallel
  const results = await Promise.allSettled(
    enabledAdapters.map(adapter => adapter.fetch())
  );

  // Collect codes and metadata
  const allCodes: Code[] = [];
  const sources: Record<string, SourceMeta> = {};

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const adapter = enabledAdapters[i];
    const sourceName = (adapter as any).sourceName as SourceName;

    if (result.status === "fulfilled") {
      const { codes, meta } = result.value;
      allCodes.push(...codes);
      sources[sourceName] = meta;
      console.log(`[Aggregator] ${sourceName}: ${codes.length} codes, status: ${meta.status}`);
    } else {
      console.error(`[Aggregator] ${sourceName} failed:`, result.reason);
      sources[sourceName] = {
        status: "failed",
        lastFetch: new Date().toISOString(),
        itemCount: 0,
        error: result.reason?.message || "Unknown error",
      };
    }
  }

  // Add metadata for disabled adapters
  const allAdapters = getAllAdapters();
  for (const adapter of allAdapters) {
    const sourceName = (adapter as any).sourceName as SourceName;
    if (!sources[sourceName]) {
      sources[sourceName] = {
        status: "not_configured",
        lastFetch: new Date().toISOString(),
        itemCount: 0,
      };
    }
  }

  // Deduplicate with trust weight accumulation
  const deduped = deduplicateWithTrust(allCodes);

  // Sort by relevance (verified first, then by trust, then by recency)
  const sorted = sortByRelevance(deduped);

  return {
    codes: sorted,
    sources: sources as Record<SourceName, SourceMeta>,
    generatedAt: new Date().toISOString(),
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
