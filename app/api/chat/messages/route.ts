import { NextRequest, NextResponse } from "next/server";
import { getChatMessages, sendChatMessage, MCPError } from "@/lib/mcp-client";

const DEFAULT_LIMIT = Number(process.env.CHAT_MESSAGE_LIMIT ?? 50);
const MAX_LENGTH = Number(process.env.CHAT_MAX_MESSAGE_LENGTH ?? 2000);

const FALLBACK_MESSAGES = [
  {
    id: "fallback-mentor",
    content: "The chat service is spinning up. Messages will appear here once the MCP gateway is online.",
    createdAt: new Date().toISOString(),
    author: {
      id: "mentor",
      name: "Mentor Slime",
      color: "#10b981",
    },
    mode: "mentor",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const cursor = searchParams.get("cursor") ?? undefined;

  try {
    const response = await getChatMessages({
      limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, DEFAULT_LIMIT) : DEFAULT_LIMIT,
      cursor,
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof MCPError) {
      console.warn("[api/chat/messages] MCP error", error.status, error.message);
    } else {
      console.error("[api/chat/messages] unexpected error", error);
    }

    return NextResponse.json(
      {
        messages: FALLBACK_MESSAGES,
        fallback: true,
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ message: "Message content is required." }, { status: 400 });
    }

    if (content.length > MAX_LENGTH) {
      return NextResponse.json(
        { message: `Message too long. Max length is ${MAX_LENGTH} characters.` },
        { status: 413 }
      );
    }

    const response = await sendChatMessage({
      content,
      personality: typeof body.personality === "string" ? body.personality : undefined,
      userId: typeof body.userId === "string" ? body.userId : undefined,
      channelId: typeof body.channelId === "string" ? body.channelId : undefined,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof MCPError) {
      console.warn("[api/chat/messages] MCP error", error.status, error.message);
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status ?? 502 }
      );
    }

    console.error("[api/chat/messages] unexpected error", error);
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
  }
}
