import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const adminBase = process.env.NEXT_PUBLIC_ADMIN_API_BASE || "";

  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    env: process.env.NODE_ENV,
    adminApiBaseConfigured: adminBase.length > 0,
  });
}
