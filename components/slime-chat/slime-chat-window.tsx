"use client";

import * as React from "react";
import { MessageSquare, Users, X, Minimize2, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlimeChatBar } from "./slime-chat-bar";
import type { SlimeChatUser } from "./slime-chat-user-list";
import { SlimeChatUserList } from "./slime-chat-user-list";

interface SlimeChatMessageAuthor {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
  personality?: string;
}

export interface SlimeChatMessage {
  id: string;
  content: string;
  createdAt: string;
  author: SlimeChatMessageAuthor;
  mode?: string;
}

interface SlimeChatWindowProps {
  className?: string;
}

const FALLBACK_MESSAGES: SlimeChatMessage[] = [
  {
    id: "welcome-1",
    content: "Welcome back! I'm ready to help you strategize your next Super Snail run.",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    author: { id: "slime-mentor", name: "Mentor Slime", color: "#10b981", personality: "mentor" },
    mode: "mentor",
  },
  {
    id: "welcome-2",
    content: "Tap the emerald button, pick a personality, and let's get slimy.",
    createdAt: new Date(Date.now() - 1000 * 45).toISOString(),
    author: { id: "slime-operator", name: "Operator Slime", color: "#06b6d4", personality: "operator" },
    mode: "operator",
  },
];

const DEFAULT_USERS: SlimeChatUser[] = [
  { id: "mentor", name: "Mentor Slime", status: "online", color: "#10b981", mood: "Tactical insights ready" },
  { id: "partner", name: "Partner Slime", status: "online", color: "#ec4899", mood: "Co-op mode engaged" },
  { id: "mirror", name: "Mirror Slime", status: "away", color: "#06b6d4", mood: "Reflecting on your last win" },
];

const REFRESH_INTERVAL_MS = 15_000;

function scrollToBottom(element: HTMLDivElement | null) {
  if (!element) return;
  element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
}

export function SlimeChatWindow({ className }: SlimeChatWindowProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<SlimeChatMessage[]>(FALLBACK_MESSAGES);
  const [users, setUsers] = React.useState<SlimeChatUser[]>(DEFAULT_USERS);
  const [loadingMessages, setLoadingMessages] = React.useState(true);
  const [loadingUsers, setLoadingUsers] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const messageLimit = React.useMemo(() => {
    const limit = Number(process.env.NEXT_PUBLIC_CHAT_MESSAGE_LIMIT ?? process.env.CHAT_MESSAGE_LIMIT);
    return Number.isFinite(limit) && limit > 0 ? limit : 50;
  }, []);

  React.useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("slime-chat-open") : null;
    if (stored === "true") {
      setIsOpen(true);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("slime-chat-open", isOpen ? "true" : "false");
    }

    if (isOpen) {
      scrollToBottom(scrollRef.current);
    }
  }, [isOpen]);

  const fetchMessages = React.useCallback(async () => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`/api/chat/messages?limit=${messageLimit}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load messages (${response.status})`);
      }
      const data = await response.json();
      const nextMessages: SlimeChatMessage[] = Array.isArray(data?.messages) ? data.messages : data ?? [];
      if (nextMessages.length) {
        setMessages(nextMessages.slice(-messageLimit));
      }
      setError(null);
    } catch (cause) {
      console.error("[SlimeChat] load messages failed", cause);
      setError("Unable to reach chat service. Using cached conversation.");
    } finally {
      setLoadingMessages(false);
    }
  }, [messageLimit]);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/chat/users", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load online users (${response.status})`);
      }
      const data = await response.json();
      const nextUsers: SlimeChatUser[] = Array.isArray(data?.users) ? data.users : data ?? [];
      if (nextUsers.length) {
        setUsers(nextUsers);
      }
    } catch (cause) {
      console.error("[SlimeChat] load users failed", cause);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMessages();
    fetchUsers();
    const id = window.setInterval(() => {
      fetchMessages();
      fetchUsers();
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [fetchMessages, fetchUsers]);

  React.useEffect(() => {
    if (!scrollRef.current) return;
    scrollToBottom(scrollRef.current);
  }, [messages, loadingMessages]);

  const handleSend = React.useCallback(
    async ({ content, personality }: { content: string; personality: string }) => {
      try {
        const response = await fetch("/api/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content, personality }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send message (${response.status})`);
        }

        const data = await response.json();
        if (data?.message) {
          setMessages((prev) => [...prev.slice(-(messageLimit - 1)), data.message]);
        } else {
          fetchMessages();
        }
      } catch (cause) {
        console.error("[SlimeChat] send failed", cause);
        setError("Message sent to queue. Service will retry when online.");
      }
    },
    [fetchMessages, messageLimit]
  );

  const toggleOpen = () => setIsOpen((value) => !value);

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col items-end space-y-3 sm:space-y-4",
        className
      )}
    >
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "pointer-events-auto flex items-center gap-2 rounded-full border-2 border-emerald-500/80 bg-[#18181b]/95 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.45)] transition hover:scale-[1.03] hover:border-emerald-400 hover:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/70",
          isOpen ? "shadow-[0_0_22px_rgba(16,185,129,0.6)]" : undefined
        )}
        aria-expanded={isOpen}
        aria-controls="slime-chat-window"
      >
        <MessageSquare className="h-4 w-4" />
        Slime Chat
        <span className="rounded-full bg-emerald-500/80 px-2 py-0.5 text-xs font-bold text-emerald-950">
          Beta
        </span>
      </button>

      {isOpen && (
        <div
          id="slime-chat-window"
          className={cn(
            "pointer-events-auto flex w-[82vw] flex-col overflow-hidden rounded-2xl border-2 border-emerald-500/80 bg-[#18181b]/95 shadow-[0_0_30px_rgba(16,185,129,0.55)] backdrop-blur",
            "sm:w-[35vw] sm:min-w-[320px] sm:max-w-[420px]",
            "h-[70vh] sm:h-[500px]"
          )}
        >
          <div className="flex items-center justify-between border-b border-emerald-500/20 px-4 py-3 text-sm text-emerald-100">
            <div className="flex items-center gap-2 font-semibold">
              <MessageCircle className="h-4 w-4" />
              Slime Chat
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-300">
              <Minimize2
                className="h-4 w-4 cursor-pointer hover:text-emerald-200"
                onClick={toggleOpen}
                aria-label="Minimize slime chat"
              />
              <X
                className="h-4 w-4 cursor-pointer hover:text-emerald-200"
                onClick={toggleOpen}
                aria-label="Close slime chat"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex justify-between gap-3 border-b border-emerald-500/10 bg-[#111113]/90 px-4 py-2 text-xs text-emerald-300">
              <span>Emerald Core Online</span>
              <span>Messages kept {messageLimit} deep</span>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4" ref={scrollRef}>
              {loadingMessages ? (
                <div className="flex flex-1 items-center justify-center text-zinc-400">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-300" />
                  Loading conversation...
                </div>
              ) : (
                <ul className="space-y-3 text-sm text-zinc-100">
                  {messages.map((message) => (
                    <li
                      key={message.id}
                      className="rounded-xl border border-emerald-500/20 bg-[#111113]/80 p-3 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    >
                      <div className="mb-1 flex items-center justify-between text-xs text-emerald-200">
                        <span className="flex items-center gap-2 font-semibold">
                          <span
                            className="inline-flex h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: message.author.color ?? "#10b981",
                            }}
                            aria-hidden="true"
                          />
                          {message.author.name}
                          {message.mode && (
                            <span className="rounded-full border border-emerald-500/40 px-2 py-0.5 text-[10px] uppercase text-emerald-200/90">
                              {message.mode}
                            </span>
                          )}
                        </span>
                        <time dateTime={message.createdAt} className="text-zinc-400">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </time>
                      </div>
                      <p className="leading-relaxed text-zinc-200 whitespace-pre-wrap">{message.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <div className="mx-4 mb-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {error}
              </div>
            )}

            <div className="border-t border-emerald-500/10 bg-[#111113]/90 px-4 py-3">
              <SlimeChatBar onSend={handleSend} maxLength={Number(process.env.NEXT_PUBLIC_CHAT_MAX_MESSAGE_LENGTH) || 2000} />
            </div>
          </div>

          <div className="border-t border-emerald-500/20 bg-[#111113]/80 px-4 py-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              <Users className="h-4 w-4" />
              Online personalities
            </div>
            <SlimeChatUserList users={users} loading={loadingUsers} />
          </div>
        </div>
      )}
    </div>
  );
}
