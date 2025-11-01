/**
 * Advanced deduplication with trust weight accumulation
 * and cross-source verification
 */

import {
  Code,
  TRUST_WEIGHTS,
  VERIFICATION_THRESHOLD,
  TRUST_WINDOW_MS,
} from "./types/codes";

interface CodeGroup {
  normalizedCode: string;
  codes: Code[];
  totalTrust: number;
  firstSeen: Date;
  lastSeen: Date;
  sources: Set<string>;
}

/**
 * Normalize code for deduplication (uppercase, preserve dashes)
 */
export function normalizeCodeKey(code: string): string {
  return code.toUpperCase().trim();
}

/**
 * Deduplicate codes with trust weight accumulation
 * Codes from multiple sources within 24h have their trust weights combined
 */
export function deduplicateWithTrust(codes: Code[]): Code[] {
  // Group codes by normalized key
  const groups = new Map<string, CodeGroup>();

  for (const code of codes) {
    const key = normalizeCodeKey(code.code);
    const ts = new Date(code.ts);

    if (!groups.has(key)) {
      groups.set(key, {
        normalizedCode: key,
        codes: [code],
        totalTrust: code.trustWeight || 0,
        firstSeen: ts,
        lastSeen: ts,
        sources: new Set([code.source]),
      });
    } else {
      const group = groups.get(key)!;

      // Only accumulate trust if within time window
      if (Math.abs(ts.getTime() - group.firstSeen.getTime()) <= TRUST_WINDOW_MS) {
        group.totalTrust += code.trustWeight || 0;
      }

      group.codes.push(code);
      group.sources.add(code.source);
      if (ts < group.firstSeen) group.firstSeen = ts;
      if (ts > group.lastSeen) group.lastSeen = ts;
    }
  }

  // Merge each group into a single code
  const merged: Code[] = [];

  for (const group of groups.values()) {
    // Pick the "best" code as base (prefer verified, then most recent)
    const baseCodes = group.codes
      .sort((a, b) => {
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return new Date(b.ts).getTime() - new Date(a.ts).getTime();
      });

    const base = { ...baseCodes[0] };

    // Merge provenance
    base.provenance = Array.from(group.sources);

    // Accumulate trust
    base.trustWeight = group.totalTrust;

    // Mark as verified if:
    // 1. Already verified (from high-trust source), OR
    // 2. Trust weight >= threshold from multiple sources
    if (!base.verified) {
      base.verified = group.totalTrust >= VERIFICATION_THRESHOLD && group.sources.size > 1;
    }

    // Merge tags (unique)
    const allTags = new Set<string>();
    for (const code of group.codes) {
      code.tags.forEach(tag => allTags.add(tag));
    }
    base.tags = Array.from(allTags);

    // Use most recent timestamp
    base.ts = group.lastSeen.toISOString();

    merged.push(base);
  }

  return merged;
}

/**
 * Filter codes by scope
 */
export function filterByScope(codes: Code[], scope: string): Code[] {
  const now = new Date();

  switch (scope) {
    case "active":
      return codes.filter((code) => {
        // Has explicit expiry and not expired
        if (code.expires) {
          return new Date(code.expires) > now;
        }
        // OR marked as active
        return code.tags.includes("active");
      });

    case "past7":
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return codes.filter((code) => new Date(code.ts) > sevenDaysAgo);

    case "verified":
      return codes.filter((code) => code.verified);

    case "all":
    default:
      return codes;
  }
}

/**
 * Sort codes by relevance (verified first, then by trust weight, then by timestamp)
 */
export function sortByRelevance(codes: Code[]): Code[] {
  return codes.sort((a, b) => {
    // Verified codes first
    if (a.verified !== b.verified) {
      return a.verified ? -1 : 1;
    }

    // Then by trust weight
    const trustA = a.trustWeight || 0;
    const trustB = b.trustWeight || 0;
    if (trustA !== trustB) {
      return trustB - trustA;
    }

    // Finally by timestamp (newest first)
    return new Date(b.ts).getTime() - new Date(a.ts).getTime();
  });
}
