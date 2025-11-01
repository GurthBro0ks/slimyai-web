import { NextRequest, NextResponse } from "next/server";
import { getCodesByScope } from "@/lib/aggregator";

export const runtime = "nodejs";
export const revalidate = 600; // Cache for 10 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get("scope") || "active";

    // Get codes by scope
    const result = await getCodesByScope(scope);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Codes aggregation error:", error);

    return NextResponse.json(
      {
        ok: false,
        code: "AGGREGATION_ERROR",
        message: "Failed to aggregate codes",
        codes: [],
        sources: {},
      },
      { status: 500 }
    );
  }
}
