/**
 * Discord API Adapter (API-first)
 * Fetches codes from official Super Snail Discord channels
 */

import { BaseAdapter, AdapterResult } from "./base";
import { Code, TRUST_WEIGHTS } from "@/lib/types/codes";

interface DiscordMessage {
  id: string;
  content: string;
  timestamp: string;
  channel_id: string;
  author: {
    id: string;
    username: string;
    bot?: boolean;
  };
}

interface DiscordChannel {
  id: string;
  name: string;
}

export class DiscordAdapter extends BaseAdapter {
  private token: string;
  private clientId: string;
  private guildId: string;
  private codesChannelIds: string[] = []; // Will be populated dynamically

  constructor() {
    const token = process.env.DISCORD_TOKEN || "";
    const clientId = process.env.DISCORD_CLIENT_ID || "";
    const guildId = process.env.DISCORD_GUILD_ID || "";

    super("discord", {
      enabled: Boolean(token && clientId && guildId),
      timeout: 10000,
    });

    this.token = token;
    this.clientId = clientId;
    this.guildId = guildId;
  }

  async fetch(): Promise<AdapterResult> {
    if (!this.isEnabled()) {
      return {
        codes: [],
        meta: {
          status: "not_configured",
          lastFetch: new Date().toISOString(),
          itemCount: 0,
          error: "Discord API credentials not configured",
        },
      };
    }

    try {
      // Find codes-related channels
      await this.findCodesChannels();

      if (this.codesChannelIds.length === 0) {
        return {
          codes: [],
          meta: this.createSuccessMeta(0, "degraded"),
        };
      }

      // Fetch messages from all codes channels
      const allCodes: Code[] = [];

      for (const channelId of this.codesChannelIds) {
        const messages = await this.fetchChannelMessages(channelId);
        const codes = this.parseMessages(messages);
        allCodes.push(...codes);
      }

      return {
        codes: allCodes,
        meta: this.createSuccessMeta(allCodes.length),
      };
    } catch (error) {
      console.error("[Discord] Fetch error:", error);
      return {
        codes: [],
        meta: this.createErrorMeta(error instanceof Error ? error.message : "Unknown error"),
      };
    }
  }

  private async findCodesChannels(): Promise<void> {
    // For now, use hardcoded channel IDs or env var
    // In production, you'd query the API to find channels with "codes" in the name
    const channelIds = process.env.DISCORD_CODES_CHANNEL_IDS?.split(",") || [];
    this.codesChannelIds = channelIds.map(id => id.trim()).filter(Boolean);

    // If no specific channels configured, try to discover them
    if (this.codesChannelIds.length === 0) {
      try {
        const channels = await this.listGuildChannels();
        this.codesChannelIds = channels
          .filter(ch => ch.name.includes("code") || ch.name.includes("gift"))
          .map(ch => ch.id);
      } catch (error) {
        console.warn("[Discord] Could not list channels:", error);
      }
    }
  }

  private async listGuildChannels(): Promise<DiscordChannel[]> {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${this.guildId}/channels`,
      {
        headers: {
          Authorization: `Bot ${this.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return response.json();
  }

  private async fetchChannelMessages(channelId: string, limit: number = 100): Promise<DiscordMessage[]> {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
      {
        headers: {
          Authorization: `Bot ${this.token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - wait and retry once
        const retryAfter = parseInt(response.headers.get("Retry-After") || "5");
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.fetchChannelMessages(channelId, limit);
      }
      throw new Error(`Discord API error: ${response.status}`);
    }

    return response.json();
  }

  private parseMessages(messages: DiscordMessage[]): Code[] {
    const codes: Code[] = [];

    for (const msg of messages) {
      const extractedCodes = this.extractCodes(msg.content);

      for (const codeStr of extractedCodes) {
        codes.push({
          code: codeStr,
          source: "discord",
          ts: msg.timestamp,
          tags: ["discord", msg.author.bot ? "bot" : "user"],
          expires: null,
          region: "global",
          description: msg.content.substring(0, 100),
          verified: true, // Discord is high-trust
          trustWeight: TRUST_WEIGHTS.discord,
          provenance: ["discord"],
          url: `https://discord.com/channels/${this.guildId}/${msg.channel_id}/${msg.id}`,
        });
      }
    }

    return codes;
  }
}
