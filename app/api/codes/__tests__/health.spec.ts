import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/codes-aggregator", () => ({
  aggregateCodes: vi.fn(async () => ({
    codes: [{ code: "AAA-111", verified: true }, { code: "BBB-222", verified: false }],
    sources: {
      discord: { status: "ok", lastFetch: new Date().toISOString(), itemCount: 2 },
      reddit: { status: "degraded", lastFetch: new Date().toISOString(), itemCount: 1 },
      twitter: { status: "not_configured", lastFetch: new Date().toISOString(), itemCount: 0 },
    },
    generatedAt: new Date().toISOString(),
  })),
}));

import { aggregateCodes } from "@/lib/codes-aggregator";

import { GET } from "../health/route";

describe("GET /api/codes/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok status with sanitized source metadata and cache headers", async () => {
    const res = await GET();
    expect(res).toBeInstanceOf(NextResponse);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.totalCodes).toBe(2);
    expect(json.verifiedCodes).toBe(1);
    expect(json.sources.discord.status).toBe("ok");
    expect(json.sources.discord).not.toHaveProperty("error");

    const headers = Object.fromEntries(res.headers.entries());
    expect(headers["cache-control"]).toContain("s-maxage=60");
    expect(headers["cache-control"]).toContain("stale-while-revalidate=600");
    expect(headers["content-type"]).toContain("application/json");
  });

  it("handles aggregation failures gracefully", async () => {
    const error = new Error("Boom");
    const mock = vi.mocked(aggregateCodes);
    mock.mockRejectedValueOnce(error);

    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Health check failed");
  });
});
