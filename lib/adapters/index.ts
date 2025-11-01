/**
 * Adapter registry
 * Export all adapters for use by the aggregator
 */

export { BaseAdapter } from "./base";
export { DiscordAdapter } from "./discord";
export { RedditAdapter } from "./reddit";
export { TwitterAdapter } from "./twitter";
export { SnelpAdapter } from "./snelp";
export { WikiAdapter } from "./wiki";
export { PocketGamerAdapter } from "./pocketgamer";

import { DiscordAdapter } from "./discord";
import { RedditAdapter } from "./reddit";
import { TwitterAdapter } from "./twitter";
import { SnelpAdapter } from "./snelp";
import { WikiAdapter } from "./wiki";
import { PocketGamerAdapter } from "./pocketgamer";

/**
 * Get all configured adapters in priority order (API-first)
 */
export function getAllAdapters() {
  return [
    new DiscordAdapter(),    // API-first, high trust
    new RedditAdapter(),     // API-first, medium trust
    new TwitterAdapter(),    // API-first, high trust (optional)
    new SnelpAdapter(),      // API, medium-good trust
    new WikiAdapter(),       // Scrape (Firecrawl), high trust
    new PocketGamerAdapter(), // Scrape (Firecrawl), good trust
  ];
}
