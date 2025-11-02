import { NextResponse } from "next/server";
import { getOnlineUsers, MCPError } from "@/lib/mcp-client";

const FALLBACK_USERS = [
  { id: "mentor", name: "Mentor Slime", status: "online", color: "#10b981", mood: "Ready to coach your squad" },
  { id: "partner", name: "Partner Slime", status: "online", color: "#ec4899", mood: "Raid planning in progress" },
];

export async function GET() {
  try {
    const response = await getOnlineUsers();
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof MCPError) {
      console.warn("[api/chat/users] MCP error", error.status, error.message);
    } else {
      console.error("[api/chat/users] unexpected error", error);
    }

    return NextResponse.json({ users: FALLBACK_USERS, fallback: true }, { status: 200 });
  }
}
