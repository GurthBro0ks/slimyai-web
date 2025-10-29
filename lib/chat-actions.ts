/**
 * Chat Actions Utility
 * Defines the structure for actions returned by the Ask Manus bot.
 */

export type ChatActionType = "copy" | "post" | "link";

export interface ChatAction {
  type: ChatActionType;
  label: string;
  value: string; // Content to copy, URL to link, or API endpoint to post
  target?: string; // Optional target for link (e.g., _blank)
  method?: "POST"; // Optional method for post
}

export interface ChatResponse {
  reply: string;
  actions: ChatAction[];
}

/**
 * Generates a mock chat response based on the user's query.
 */
export function generateMockChatResponse(query: string): ChatResponse {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("code")) {
    return {
      reply: "I found a recent code for you! It's active and ready to be redeemed.",
      actions: [
        {
          type: "copy",
          label: "Copy Code: SLIMYAI2024",
          value: "SLIMYAI2024",
        },
        {
          type: "link",
          label: "Go to Codes Hub",
          value: "/snail/codes",
        },
      ],
    };
  }

  if (lowerQuery.includes("stats")) {
    return {
      reply: "Your Club's activity is up 5% this week. Would you like to view the full dashboard?",
      actions: [
        {
          type: "link",
          label: "View Club Dashboard",
          value: "/club",
        },
      ],
    };
  }

  if (lowerQuery.includes("bug")) {
    return {
      reply: "I'm sorry you're running into an issue. I can help you submit a bug report to the dev team.",
      actions: [
        {
          type: "post",
          label: "Submit Bug Report",
          value: "/api/bug-report",
          method: "POST",
        },
      ],
    };
  }

  return {
    reply: "I'm the Ask Manus assistant. How can I help you with your Super Snail or Club needs?",
    actions: [
      {
        type: "link",
        label: "Check System Status",
        value: "/status",
      },
      {
        type: "copy",
        label: "Copy My User ID",
        value: "USER-ID-MOCK-12345",
      },
    ],
  };
}
