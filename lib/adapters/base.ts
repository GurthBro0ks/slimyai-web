/**
 * Base adapter interface for code sources
 */

import { Code, SourceMeta, SourceName } from "@/lib/types/codes";

export interface AdapterConfig {
  enabled: boolean;
  apiKey?: string;
  url?: string;
  timeout?: number;
}

export interface AdapterResult {
  codes: Code[];
  meta: SourceMeta;
}

export abstract class BaseAdapter {
  protected sourceName: SourceName;
  protected config: AdapterConfig;
  private readonly defaultUserAgent = "Slimy.ai/1.0 (+https://slimy.ai)";

  constructor(sourceName: SourceName, config: AdapterConfig) {
    this.sourceName = sourceName;
    this.config = config;
  }

  /**
   * Fetch codes from this source
   */
  abstract fetch(): Promise<AdapterResult>;

  /**
   * Check if adapter is enabled and properly configured
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Normalize code strings (uppercase, preserve dashes)
   */
  protected normalizeCode(code: string): string {
    return code.toUpperCase().trim();
  }

  /**
   * Extract potential codes using common patterns
   */
  protected extractCodes(text: string): string[] {
    // Match alphanumeric codes 6-12 chars, may include dashes
    const pattern = /\b[A-Z0-9]{3,}(?:-[A-Z0-9]{3,})*\b/gi;
    const matches = text.match(pattern) || [];

    return matches
      .map(m => this.normalizeCode(m))
      .filter(code => {
        // Filter out common false positives
        const len = code.length;
        return (
          len >= 6 &&
          len <= 12 &&
          !/^[0-9]+$/.test(code) && // Not all numbers
          !/^[A-Z]+$/.test(code) || code.includes('-') // Not all letters unless has dash
        );
      });
  }

  /**
   * Create error meta for failed fetches
   */
  protected createErrorMeta(error: string): SourceMeta {
    return {
      status: "failed",
      lastFetch: new Date().toISOString(),
      itemCount: 0,
      error,
    };
  }

  /**
   * Create success meta
   */
  protected createSuccessMeta(itemCount: number, status: "ok" | "degraded" = "ok"): SourceMeta {
    return {
      status,
      lastFetch: new Date().toISOString(),
      itemCount,
    };
  }

  /**
   * Shared user agent for outbound requests (can be overridden via env)
   */
  protected getUserAgent(): string {
    return process.env.USER_AGENT?.trim() || this.defaultUserAgent;
  }
}
