import { NextRequest, NextResponse } from "next/server";
import { exportClubAnalytics, MCPError } from "@/lib/mcp-client";

export async function POST(request: NextRequest) {
  try {
    const body = request.headers.get("content-type")?.includes("application/json")
      ? await request.json().catch(() => ({}))
      : {};

    const response = await exportClubAnalytics(body?.format ? { format: body.format } : undefined);

    return NextResponse.json(
      {
        ...response,
        message: response.message ?? "Club export started. Check your integrations for updates.",
      },
      { status: 202 }
    );
  } catch (error) {
    if (error instanceof MCPError) {
      console.warn("[api/club/export] MCP error", error.status, error.message);
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status ?? 502 }
      );
    }

    console.error("[api/club/export] unexpected error", error);
    return NextResponse.json({ message: "Failed to trigger export." }, { status: 500 });
  }
}
