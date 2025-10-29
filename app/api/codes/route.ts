import { NextRequest, NextResponse } from "next/server";
import { aggregateCodes, filterByScope } from "@/lib/codes-aggregator";

export const runtime = "nodejs";
export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get("scope") || "active";

    // Aggregate from all sources
    const result = await aggregateCodes();

    // Filter by scope
    const filteredCodes = filterByScope(result.codes, scope);

    return NextResponse.json(
      {
        codes: filteredCodes,
        sources: result.sources,
        scope,
        count: filteredCodes.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Codes aggregation error:", error);

    return NextResponse.json(
      {
        ok: false,
        code: "AGGREGATION_ERROR",
        message: "Failed to aggregate codes",
        codes: [],
      },
      { status: 500 }
    );
  }
}
