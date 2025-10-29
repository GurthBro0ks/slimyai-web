import { NextResponse } from "next/server";
import { proxyToAdminApi } from "@/lib/api-proxy";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  const result = await proxyToAdminApi("/api/diag");

  if (!result.ok) {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(result.data);
}
