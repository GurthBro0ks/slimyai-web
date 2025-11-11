import { NextRequest, NextResponse } from "next/server";

import { apiClient } from "@/lib/api-client";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

/**
 * POST /api/guilds/:id/members/bulk/add
 * Bulk add members to guild
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
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get("operation");

    if (!operation) {
      return NextResponse.json(
        {
          error: "Validation error",
          code: "VALIDATION_ERROR",
          message: "operation query parameter is required (add, update, remove)"
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    let endpoint: string;
    let payload: any;

    switch (operation) {
      case "add":
        if (!body.members || !Array.isArray(body.members)) {
          return NextResponse.json(
            {
              error: "Validation error",
              code: "VALIDATION_ERROR",
              message: "members array is required for add operation"
            },
            { status: 400 }
          );
        }
        endpoint = `/api/guilds/${id}/members/bulk-add`;
        payload = { members: body.members };
        break;

      case "update":
        if (!body.updates || !Array.isArray(body.updates)) {
          return NextResponse.json(
            {
              error: "Validation error",
              code: "VALIDATION_ERROR",
              message: "updates array is required for update operation"
            },
            { status: 400 }
          );
        }
        endpoint = `/api/guilds/${id}/members/bulk-update`;
        payload = { updates: body.updates };
        break;

      case "remove":
        if (!body.userIds || !Array.isArray(body.userIds)) {
          return NextResponse.json(
            {
              error: "Validation error",
              code: "VALIDATION_ERROR",
              message: "userIds array is required for remove operation"
            },
            { status: 400 }
          );
        }
        endpoint = `/api/guilds/${id}/members/bulk-remove`;
        payload = { userIds: body.userIds };
        break;

      default:
        return NextResponse.json(
          {
            error: "Validation error",
            code: "VALIDATION_ERROR",
            message: "Invalid operation. Must be one of: add, update, remove"
          },
          { status: 400 }
        );
    }

    const result = await apiClient.post(endpoint, payload);

    if (!result.ok) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Failed to perform bulk operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation", code: "BULK_OPERATION_ERROR" },
      { status: 500 }
    );
  }
}
