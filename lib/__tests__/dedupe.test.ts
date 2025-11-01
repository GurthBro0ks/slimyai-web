import { describe, it, expect } from "vitest";
import {
  normalizeCodeKey,
  deduplicateWithTrust,
  filterByScope,
  sortByRelevance,
} from "../dedupe";
import { Code } from "../types/codes";

describe("Dedupe Module", () => {
  describe("normalizeCodeKey", () => {
    it("should uppercase codes", () => {
      expect(normalizeCodeKey("abc123")).toBe("ABC123");
    });

    it("should preserve dashes", () => {
      expect(normalizeCodeKey("ABC-123")).toBe("ABC-123");
    });

    it("should trim whitespace", () => {
      expect(normalizeCodeKey("  ABC123  ")).toBe("ABC123");
    });
  });

  describe("deduplicateWithTrust", () => {
    it("should merge codes from same normalized key", () => {
      const codes: Code[] = [
        {
          code: "TEST123",
          source: "reddit",
          ts: new Date().toISOString(),
          tags: ["reddit"],
          expires: null,
          region: "global",
          trustWeight: 0.5,
          provenance: ["reddit"],
        },
        {
          code: "test123", // Same code, different case
          source: "discord",
          ts: new Date().toISOString(),
          tags: ["discord"],
          expires: null,
          region: "global",
          trustWeight: 1.0,
          verified: true,
          provenance: ["discord"],
        },
      ];

      const result = deduplicateWithTrust(codes);

      expect(result).toHaveLength(1);
      expect(result[0].trustWeight).toBe(1.5); // 0.5 + 1.0
      expect(result[0].provenance).toEqual(expect.arrayContaining(["reddit", "discord"]));
    });

    it("should mark as verified when trust >= threshold from multiple sources", () => {
      const codes: Code[] = [
        {
          code: "VERIFY1",
          source: "reddit",
          ts: new Date().toISOString(),
          tags: [],
          expires: null,
          region: "global",
          trustWeight: 0.5,
          verified: false,
          provenance: ["reddit"],
        },
        {
          code: "VERIFY1",
          source: "snelp",
          ts: new Date().toISOString(),
          tags: [],
          expires: null,
          region: "global",
          trustWeight: 0.6,
          verified: false,
          provenance: ["snelp"],
        },
        {
          code: "VERIFY1",
          source: "pocketgamer",
          ts: new Date().toISOString(),
          tags: [],
          expires: null,
          region: "global",
          trustWeight: 0.7,
          verified: false,
          provenance: ["pocketgamer"],
        },
      ];

      const result = deduplicateWithTrust(codes);

      expect(result).toHaveLength(1);
      expect(result[0].verified).toBe(true); // 0.5 + 0.6 + 0.7 = 1.8 >= 1.5
      expect(result[0].trustWeight).toBe(1.8);
    });

    it("should keep verified status from high-trust sources", () => {
      const codes: Code[] = [
        {
          code: "OFFICIAL",
          source: "discord",
          ts: new Date().toISOString(),
          tags: ["discord"],
          expires: null,
          region: "global",
          trustWeight: 1.0,
          verified: true, // Discord is high-trust
          provenance: ["discord"],
        },
      ];

      const result = deduplicateWithTrust(codes);

      expect(result).toHaveLength(1);
      expect(result[0].verified).toBe(true);
    });
  });

  describe("filterByScope", () => {
    const now = new Date();
    const mockCodes: Code[] = [
      {
        code: "ACTIVE1",
        source: "discord",
        ts: now.toISOString(),
        tags: ["active"],
        expires: null,
        region: "global",
      },
      {
        code: "EXPIRED1",
        source: "reddit",
        ts: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        tags: [],
        expires: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        region: "global",
      },
      {
        code: "RECENT1",
        source: "twitter",
        ts: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: [],
        expires: null,
        region: "global",
      },
      {
        code: "OLD1",
        source: "reddit",
        ts: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        tags: [],
        expires: null,
        region: "global",
      },
      {
        code: "VERIFIED1",
        source: "discord",
        ts: now.toISOString(),
        tags: [],
        expires: null,
        region: "global",
        verified: true,
      },
    ];

    it("should filter active codes", () => {
      const result = filterByScope(mockCodes, "active");
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(c => c.code === "ACTIVE1")).toBe(true);
      expect(result.some(c => c.code === "EXPIRED1")).toBe(false);
    });

    it("should filter codes from past 7 days", () => {
      const result = filterByScope(mockCodes, "past7");
      expect(result.some(c => c.code === "RECENT1")).toBe(true);
      expect(result.some(c => c.code === "OLD1")).toBe(false);
    });

    it("should filter verified codes", () => {
      const result = filterByScope(mockCodes, "verified");
      expect(result.some(c => c.code === "VERIFIED1")).toBe(true);
      expect(result.length).toBe(1);
    });

    it("should return all codes for 'all' scope", () => {
      const result = filterByScope(mockCodes, "all");
      expect(result).toHaveLength(mockCodes.length);
    });
  });

  describe("sortByRelevance", () => {
    it("should sort verified codes first", () => {
      const codes: Code[] = [
        {
          code: "UNVERIFIED",
          source: "reddit",
          ts: new Date().toISOString(),
          tags: [],
          expires: null,
          region: "global",
          verified: false,
          trustWeight: 0.5,
        },
        {
          code: "VERIFIED",
          source: "discord",
          ts: new Date().toISOString(),
          tags: [],
          expires: null,
          region: "global",
          verified: true,
          trustWeight: 1.0,
        },
      ];

      const result = sortByRelevance(codes);
      expect(result[0].code).toBe("VERIFIED");
    });

    it("should sort by trust weight within same verification status", () => {
      const codes: Code[] = [
        {
          code: "LOW",
          source: "reddit",
          ts: new Date().toISOString(),
          tags: [],
          expires: null,
          region: "global",
          verified: false,
          trustWeight: 0.3,
        },
        {
          code: "HIGH",
          source: "snelp",
          ts: new Date().toISOString(),
          tags: [],
          expires: null,
          region: "global",
          verified: false,
          trustWeight: 0.8,
        },
      ];

      const result = sortByRelevance(codes);
      expect(result[0].code).toBe("HIGH");
    });
  });
});
