"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SlimeChatUser {
  id: string;
  name: string;
  status?: "online" | "away" | "offline";
  color?: string;
  mood?: string;
  lastActiveAt?: string;
}

export interface SlimeChatUserListProps {
  users: SlimeChatUser[];
  loading?: boolean;
}

const FALLBACK_COLORS = ["#06b6d4", "#ec4899", "#eab308", "#10b981", "#8b5cf6"];

function getColorForUser(user: SlimeChatUser, index: number) {
  if (user.color) return user.color;
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function SlimeChatUserList({ users, loading }: SlimeChatUserListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-lg bg-[#1f1f23]/60"
          />
        ))}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-[#111113]/70 p-4 text-sm text-zinc-400">
        Slime Chat will show online clubmates and Slimy personalities here once connected.
      </div>
    );
  }

  return (
    <ul className="space-y-3 text-sm">
      {users.map((user, index) => {
        const color = getColorForUser(user, index);
        const status = user.status ?? "online";
        return (
          <li
            key={user.id}
            className={cn(
              "flex items-start justify-between rounded-lg border border-emerald-500/10 bg-[#111113]/80 px-3 py-2",
              "shadow-[0_0_12px_rgba(16,185,129,0.12)]"
            )}
          >
            <div>
              <div className="flex items-center gap-2 font-semibold text-zinc-50">
                <span
                  className="inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                {user.name}
              </div>
              {user.mood && (
                <p className="mt-1 text-xs text-zinc-400">{user.mood}</p>
              )}
            </div>
            <div className="flex flex-col items-end text-xs text-zinc-400">
              <span className="capitalize">{status}</span>
              {user.lastActiveAt && (
                <span>{new Date(user.lastActiveAt).toLocaleTimeString()}</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
