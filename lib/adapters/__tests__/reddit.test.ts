import { describe, it, expect, vi, beforeEach } from "vitest";
import { RedditAdapter } from "../reddit";

// Mock fetch globally
global.fetch = vi.fn();

describe("RedditAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract codes from Reddit posts", async () => {
    const mockResponse = {
      data: {
        children: [
          {
            data: {
              id: "abc123",
              title: "New gift code: REDDIT2024",
              selftext: "Use code GIFT123 for rewards!",
              created_utc: Date.now() / 1000,
              url: "https://reddit.com/r/SuperSnailGame/comments/abc123",
              author: "testuser",
              permalink: "/r/SuperSnailGame/comments/abc123",
            },
          },
        ],
      },
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const adapter = new RedditAdapter();
    const result = await adapter.fetch();

    expect(result.codes.length).toBeGreaterThan(0);
    expect(result.meta.status).toBe("ok");
    expect(result.codes.some(c => c.code === "REDDIT2024")).toBe(true);
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const adapter = new RedditAdapter();
    const result = await adapter.fetch();

    expect(result.codes).toHaveLength(0);
    expect(result.meta.status).toBe("failed");
  });

  it("should handle rate limiting", async () => {
    // Mock rate limit response that breaks the loop
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 429,
    });

    const adapter = new RedditAdapter();
    const result = await adapter.fetch();

    // Should still return gracefully, even if degraded
    expect(result.codes).toHaveLength(0);
    expect(["failed", "degraded", "ok"]).toContain(result.meta.status);
  });
});
