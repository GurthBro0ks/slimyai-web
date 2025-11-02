import { env } from "process";

const MCP_BASE_URL = env.MCP_BASE_URL ?? env.NEXT_PUBLIC_MCP_BASE_URL ?? "http://localhost:3100";
const MCP_CHAT_URL = env.MCP_CHAT_SERVICE_URL ?? `${MCP_BASE_URL}/chat`;
const MCP_CLUB_URL = env.MCP_CLUB_ANALYTICS_URL ?? `${MCP_BASE_URL}/club`;
const MCP_API_KEY = env.MCP_API_KEY ?? env.NEXT_PUBLIC_MCP_API_KEY;

export class MCPError extends Error {
  public readonly status?: number;
  public readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "MCPError";
    this.status = status;
    this.details = details;
  }
}

function buildHeaders(init?: HeadersInit, body?: BodyInit | null) {
  const headers = new Headers(init);
  if (MCP_API_KEY && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${MCP_API_KEY}`);
  }
  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

async function request<T>(serviceUrl: string, path: string, init?: RequestInit): Promise<T> {
  const url = new URL(path, serviceUrl);
  const response = await fetch(url, {
    ...init,
    headers: buildHeaders(init?.headers, init?.body ?? null),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json().catch(() => undefined) : await response.text();

  if (!response.ok) {
    throw new MCPError(
      typeof payload === "string" ? payload : payload?.message ?? "MCP request failed",
      response.status,
      payload
    );
  }

  return payload as T;
}

export interface ChatMessagePayload {
  id: string;
  content: string;
  createdAt: string;
  mode?: string;
  persona?: string;
  author: {
    id: string;
    name: string;
    color?: string;
    avatar?: string;
  };
}

export interface ChatMessagesResponse {
  messages: ChatMessagePayload[];
  nextCursor?: string | null;
}

export async function getChatMessages(params?: { limit?: number; cursor?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.cursor) searchParams.set("cursor", params.cursor);
  const path = `/messages${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return request<ChatMessagesResponse>(MCP_CHAT_URL, path);
}

export async function sendChatMessage(payload: { content: string; personality?: string; channelId?: string; userId?: string }) {
  return request<{ message: ChatMessagePayload }>(MCP_CHAT_URL, "/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOnlineUsers() {
  return request<{ users: Array<{ id: string; name: string; status?: string; color?: string; mood?: string; lastActiveAt?: string }> }>(
    MCP_CHAT_URL,
    "/users"
  );
}

export async function uploadClubScreenshot(payload: { file: File | Blob; filename?: string; metadata?: Record<string, string> }) {
  const formData = new FormData();
  formData.append("file", payload.file, payload.filename);
  if (payload.metadata) {
    for (const [key, value] of Object.entries(payload.metadata)) {
      formData.append(`meta[${key}]`, value);
    }
  }

  return request<{ jobId: string; status: string; message?: string }>(MCP_CLUB_URL, "/upload", {
    method: "POST",
    body: formData,
  });
}

export async function exportClubAnalytics(payload?: { format?: string }) {
  return request<{ exportId?: string; status: string; message?: string }>(MCP_CLUB_URL, "/export", {
    method: "POST",
    body: JSON.stringify(payload ?? { format: "sheets" }),
  });
}
