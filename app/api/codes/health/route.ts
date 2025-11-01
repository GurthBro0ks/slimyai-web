import { NextResponse } from "next/server";
import { aggregateCodes } from "@/lib/codes-aggregator";

export const runtime = "nodejs";
export const revalidate = 60; // Cache for 60 seconds

/**
 * Health endpoint for codes aggregator
 * Returns per-source status without exposing secrets
 */
export async function GET() {
  try {
    const result = await aggregateCodes();

    // Sanitize sources (remove any error messages that might contain sensitive info)
    const sanitizedSources = Object.fromEntries(
      Object.entries(result.sources).map(([name, meta]) => [
        name,
        {
          status: meta.status,
          lastFetch: meta.lastFetch,
          itemCount: meta.itemCount,
          // Don't include error details in public API
        },
      ])
    );

    // Overall health check
    const statuses = Object.values(result.sources).map(s => s.status);
    const hasOk = statuses.some(s => s === "ok");
    const allFailed = statuses.every(s => s === "failed" || s === "not_configured");

    return NextResponse.json(
      {
        ok: hasOk && !allFailed,
        sources: sanitizedSources,
        totalCodes: result.codes.length,
        verifiedCodes: result.codes.filter(c => c.verified).length,
        generatedAt: result.generatedAt,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Health check failed",
        generatedAt: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
