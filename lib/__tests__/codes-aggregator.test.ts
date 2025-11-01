import { describe, it, expect, vi } from "vitest";
import { searchCodes } from "../codes-aggregator";
import { Code } from "../types/codes";

describe("Codes Aggregator", () => {
  describe("searchCodes", () => {
    const mockCodes: Code[] = [
      {
        code: "SEARCH123",
        source: "discord",
        ts: new Date().toISOString(),
        tags: ["discord", "active"],
        expires: null,
        region: "global",
        description: "Test code from Discord",
      },
      {
        code: "REDDIT456",
        source: "reddit",
        ts: new Date().toISOString(),
        tags: ["reddit"],
        expires: null,
        region: "global",
        description: "Community shared code",
      },
    ];

    it("should return all codes for empty query", () => {
      const result = searchCodes(mockCodes, "");
      expect(result).toHaveLength(2);
    });

    it("should search by code text", () => {
      const result = searchCodes(mockCodes, "SEARCH");
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("SEARCH123");
    });

    it("should search by description", () => {
      const result = searchCodes(mockCodes, "Discord");
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("SEARCH123");
    });

    it("should search by tags", () => {
      const result = searchCodes(mockCodes, "reddit");
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("REDDIT456");
    });

    it("should be case-insensitive", () => {
      const result = searchCodes(mockCodes, "discord");
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("SEARCH123");
    });
  });
});
