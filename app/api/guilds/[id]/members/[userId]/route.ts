import { NextRequest, NextResponse } from "next/server";

import { apiClient } from "@/lib/api-client";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

/**
 * PATCH /api/guilds/:id/members/:userId
 * Update member roles
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { id, userId } = await params;
    const body = await request.json();
    const { roles } = body;

    // Basic validation
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

    const result = await apiClient.patch(`/api/guilds/${id}/members/${userId}`, {
      roles,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Failed to update member roles:", error);
    return NextResponse.json(
      { error: "Failed to update member roles", code: "UPDATE_ROLES_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/guilds/:id/members/:userId
 * Remove member from guild
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { id, userId } = await params;

    const result = await apiClient.delete(`/api/guilds/${id}/members/${userId}`);

    if (!result.ok) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Failed to remove guild member:", error);
    return NextResponse.json(
      { error: "Failed to remove guild member", code: "REMOVE_MEMBER_ERROR" },
      { status: 500 }
    );
  }
}
