import "server-only";

import type { NextRequest } from "next/server";

import { apiClient } from "@/lib/api-client";
import { getUserRole } from "@/slimy.config";
import type { AuthUser, Guild } from "./types";

interface AdminAuthResponse {
  user: {
    id: string;
    name: string;
    email?: string;
  };
  role?: AuthUser["role"];
  guilds?: Guild[];
}

export interface ServerAuthUser extends AuthUser {
  email?: string;
  roles?: string[];
}

export interface ServerAuthSession {
  user: ServerAuthUser | null;
}

function getCookieHeader(request?: NextRequest): string | undefined {
  return request?.headers.get("cookie") || undefined;
}

function toServerAuthUser(payload: AdminAuthResponse): ServerAuthUser {
  const guildRoles = payload.guilds?.flatMap(guild => guild.roles) || [];
  const resolvedRole = payload.role || getUserRole(guildRoles);

  return {
    id: payload.user.id,
    name: payload.user.name,
    email: payload.user.email,
    role: resolvedRole,
    guilds: payload.guilds,
    roles: [resolvedRole],
  };
}

async function fetchSession(request?: NextRequest): Promise<ServerAuthUser | null> {
  const cookie = getCookieHeader(request);

  const response = await apiClient.get<AdminAuthResponse>("/api/auth/me", {
    useCache: false,
    headers: cookie
      ? {
          Cookie: cookie,
        }
      : undefined,
  });

  if (!response.ok || !response.data) {
    return null;
  }

  return toServerAuthUser(response.data);
}

export async function auth(request?: NextRequest): Promise<ServerAuthSession> {
  const user = await fetchSession(request);
  return { user };
}

export async function requireAuth(request: NextRequest): Promise<ServerAuthUser> {
  const session = await auth(request);

  if (!session.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}
