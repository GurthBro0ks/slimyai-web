import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limiter";
import { createChatCompletion } from "@/lib/openai-client";
import { getPersonalityConfig, PersonalityMode } from "@/lib/personality-modes";
import { ChatRequest, Message } from "@/types/chat";

export const runtime = "nodejs";

const CHAT_LIMIT = 10; // 10 requests
const CHAT_WINDOW = 60 * 1000; // per minute

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
  const rateLimitKey = `chat:${ip}`;

  // Rate limiting
  if (isRateLimited(rateLimitKey, CHAT_LIMIT, CHAT_WINDOW)) {
    const resetTime = new Date(Date.now() + CHAT_WINDOW).toISOString();
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMIT_EXCEEDED",
        error: "You have exceeded the chat limit. Please try again later.",
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
    const body: ChatRequest = await request.json();
    const { message, personalityMode, conversationHistory } = body;

    // Validate input
    if (!message || !message.trim()) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_MESSAGE",
          error: "Message cannot be empty.",
        },
        { status: 400 }
      );
    }

    // Get personality configuration
    const personalityConfig = getPersonalityConfig(personalityMode || 'helpful');

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: personalityConfig.systemPrompt },
      // Include last 10 messages for context
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call OpenAI API
    const aiResponse = await createChatCompletion(messages, {
      model: 'gpt-4',
      temperature: personalityConfig.temperature,
      maxTokens: 1000,
    });

    // Create response message
    const responseMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponse.content || 'Sorry, I could not generate a response.',
      timestamp: Date.now(),
      personalityMode,
    };

    return NextResponse.json({
      ok: true,
      message: responseMessage,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    
    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        {
          ok: false,
          code: "OPENAI_AUTH_ERROR",
          error: "OpenAI API authentication failed.",
        },
        { status: 500 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        {
          ok: false,
          code: "OPENAI_RATE_LIMIT",
          error: "OpenAI API rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        code: "CHAT_ERROR",
        error: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}
