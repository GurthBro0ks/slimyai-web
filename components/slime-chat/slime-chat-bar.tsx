"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PERSONALITY_MODES = [
  { id: "mentor", label: "Mentor" },
  { id: "partner", label: "Partner" },
  { id: "mirror", label: "Mirror" },
  { id: "operator", label: "Operator" },
];

export interface SlimeChatBarProps {
  onSend: (payload: { content: string; personality: string }) => Promise<void> | void;
  maxLength?: number;
  loading?: boolean;
}

export function SlimeChatBar({ onSend, maxLength = 2000, loading }: SlimeChatBarProps) {
  const [message, setMessage] = React.useState("");
  const [personality, setPersonality] = React.useState(PERSONALITY_MODES[0]?.id ?? "mentor");
  const [isSending, setIsSending] = React.useState(false);

  const remaining = maxLength - message.length;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || isSending || loading) {
      return;
    }

    try {
      setIsSending(true);
      await onSend({ content: message.trim(), personality });
      setMessage("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {PERSONALITY_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setPersonality(mode.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              "border border-emerald-500/50 bg-[#1f1f23]/70 hover:bg-emerald-500/10",
              personality === mode.id ? "text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.35)]" : "text-zinc-300"
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="slime-chat-input" className="sr-only">
          Message
        </label>
        <textarea
          id="slime-chat-input"
          value={message}
          onChange={(event) => {
            const value = event.target.value;
            if (value.length <= maxLength) {
              setMessage(value);
            }
          }}
          placeholder="Type your message…"
          className="w-full resize-none rounded-lg border border-emerald-500/40 bg-[#111113] px-3 py-2 text-sm text-zinc-100 outline-none ring-emerald-500/60 placeholder:text-zinc-500 focus:ring-2"
          rows={3}
        />
        <div className="mt-1 text-right text-xs text-zinc-500">
          {remaining} characters left
        </div>
      </div>

      <Button
        type="submit"
        variant="neon"
        size="sm"
        disabled={isSending || loading || !message.trim()}
        className="flex w-full items-center justify-center gap-2 bg-emerald-500 text-zinc-900 hover:bg-emerald-400"
      >
        {(isSending || loading) && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
        )}
        <Send className="h-4 w-4" />
        <span>Send</span>
      </Button>
    </form>
  );
}
