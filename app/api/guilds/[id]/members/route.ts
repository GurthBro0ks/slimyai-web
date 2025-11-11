import { NextRequest, NextResponse } from "next/server";

import { apiClient } from "@/lib/api-client";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

/**
 * GET /api/guilds/:id/members
 * Get guild members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";
    const search = searchParams.get("search") || undefined;

    const queryParams = new URLSearchParams({
      limit,
      offset,
      ...(search && { search }),
    });

    const result = await apiClient.get(`/api/guilds/${id}/members?${queryParams}`, {
      useCache: true,
      cacheTtl: 60000, // 1 minute TTL
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Failed to fetch guild members:", error);
    return NextResponse.json(
      { error: "Failed to fetch guild members", code: "FETCH_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guilds/:id/members
 * Add member to guild
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { userId, roles = [] } = body;

    // Basic validation
    if (!userId) {
      return NextResponse.json(
        {
          error: "Validation error",
          code: "VALIDATION_ERROR",
          message: "userId is required"
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(roles)) {
      return NextResponse.json(
        {
          error: "Validation error",
          code: "VALIDATION_ERROR",
          message: "roles must be an array"
        },
        { status: 400 }
      );
    }

    const result = await apiClient.post(`/api/guilds/${id}/members`, {
      userId,
      roles,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Failed to add guild member:", error);
    return NextResponse.json(
      { error: "Failed to add guild member", code: "ADD_MEMBER_ERROR" },
      { status: 500 }
    );
  }
}
