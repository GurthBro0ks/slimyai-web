import { describe, it, expect } from "vitest";
import { filterByScope, searchCodes, type Code } from "@/lib/codes-aggregator";

const mockCodes: Code[] = [
  {
    code: "ACTIVE2024",
    source: "snelp",
    ts: new Date().toISOString(),
    tags: ["active"],
    expires: null,
    region: "global",
    description: "Active code from Snelp",
  },
  {
    code: "EXPIRED2023",
    source: "snelp",
    ts: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    tags: [],
    expires: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Expired yesterday
    region: "global",
  },
  {
    code: "RECENT2024",
    source: "reddit",
    ts: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    tags: ["reddit"],
    expires: null,
    region: "global",
  },
  {
    code: "OLD2023",
    source: "reddit",
    ts: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    tags: ["reddit"],
    expires: null,
    region: "global",
  },
];

describe("Codes Aggregator", () => {
  describe("filterByScope", () => {
    it("should filter active codes", () => {
      const result = filterByScope(mockCodes, "active");
      expect(result).toHaveLength(3); // All except expired
      expect(result.some((c) => c.code === "EXPIRED2023")).toBe(false);
    });

    it("should filter codes from past 7 days", () => {
      const result = filterByScope(mockCodes, "past7");
      expect(result).toHaveLength(2); // ACTIVE2024 and RECENT2024
      expect(result.every((c) => ["ACTIVE2024", "RECENT2024"].includes(c.code))).toBe(true);
    });

    it("should return all codes for 'all' scope", () => {
      const result = filterByScope(mockCodes, "all");
      expect(result).toHaveLength(4);
    });
  });

  describe("searchCodes", () => {
    it("should return all codes for empty query", () => {
      const result = searchCodes(mockCodes, "");
      expect(result).toHaveLength(4);
    });

    it("should search by code text", () => {
      const result = searchCodes(mockCodes, "ACTIVE");
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("ACTIVE2024");
    });

    it("should search by description", () => {
      const result = searchCodes(mockCodes, "Snelp");
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("ACTIVE2024");
    });

    it("should search by tags", () => {
      const result = searchCodes(mockCodes, "reddit");
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.source === "reddit")).toBe(true);
    });

    it("should be case-insensitive", () => {
      const result = searchCodes(mockCodes, "active");
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("ACTIVE2024");
    });
  });
});
