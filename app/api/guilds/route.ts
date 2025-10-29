import { NextResponse } from "next/server";
import { proxyToAdminApi } from "@/lib/api-proxy";

export const dynamic = "force-dynamic"; // no-store

export async function GET() {
  const result = await proxyToAdminApi("/api/guilds");

  if (!result.ok) {
    return NextResponse.json(result, { status: 503 });
  }

  return NextResponse.json(result.data);
}
