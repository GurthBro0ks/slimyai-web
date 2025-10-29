import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limiter";
import { generateMockChatResponse } from "@/lib/chat-actions";

export const runtime = "nodejs";

const CHAT_LIMIT = 5; // 5 requests
const CHAT_WINDOW = 60 * 1000; // per minute

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
  const rateLimitKey = `chat:${ip}`;

  if (isRateLimited(rateLimitKey, CHAT_LIMIT, CHAT_WINDOW)) {
    const resetTime = new Date(Date.now() + CHAT_WINDOW).toISOString();
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMIT_EXCEEDED",
        message: "You have exceeded the chat limit. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(CHAT_WINDOW / 1000),
          "X-RateLimit-Reset": resetTime,
        },
      }
    );
  }

  try {
    const body: {
      guildId: string;
      route: string;
      role: string;
      filters: any;
      pageSummary: string;
      userAsk: string;
    } = await request.json();

    const response = generateMockChatResponse(body.userAsk);

    return NextResponse.json({
      ok: true,
      ...response,
    });
  } catch (error) {
    console.error("Chat bot error:", error);
    return NextResponse.json(
      {
        ok: false,
        code: "CHAT_ERROR",
        message: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}
