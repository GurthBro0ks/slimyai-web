import { NextResponse } from "next/server";
import { proxyToAdminApi } from "@/lib/api-proxy";

type ServiceStatus = "operational" | "degraded" | "down" | "not_configured";

export const revalidate = 30; // Cache for 30 seconds so recoveries surface quickly

export async function GET() {
  const result = await proxyToAdminApi("/api/diag");
  const checkedAt = new Date().toISOString();

  if (result.ok) {
    return NextResponse.json({
      ok: true,
      status: "operational" as const,
      checkedAt,
      adminApi: {
        status: "operational" as ServiceStatus,
        message: "Admin API reachable",
        response: result.data,
      },
    });
  }

  const adminStatus: ServiceStatus = (() => {
    if (result.code === "CONFIG_ERROR") return "not_configured";
    if (result.code === "UPSTREAM_ERROR") {
      if ((result.status ?? 0) >= 500) return "down";
      return "degraded";
    }
    return "degraded";
  })();

  const overallStatus =
    adminStatus === "not_configured"
      ? "not_configured"
      : "degraded";

  return NextResponse.json({
    ok: false,
    status: overallStatus,
    checkedAt,
    adminApi: {
      status: adminStatus,
      message: result.message,
      code: result.code,
      httpStatus: result.status ?? null,
      details: result.details ?? null,
    },
  });
}
