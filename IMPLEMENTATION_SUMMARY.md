# Codes Aggregator Implementation Summary

This document summarizes the implementation of the Codes Aggregator feature following the API-first architecture plan.

## ✅ Completed Components

### 1. Type Definitions (`lib/types/codes.ts`)
- Defined comprehensive TypeScript types for codes, sources, and metadata
- Supports all 6 source types: Discord, Reddit, Twitter, Wiki, PocketGamer, Snelp
- Includes source status tracking: `ok`, `degraded`, `failed`, `not_configured`

### 2. API Adapters

#### Discord Adapter (`lib/adapters/discord.ts`)
- Uses Discord Bot API with `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` secrets
- Fetches messages from channel `1118010099974287370`
- Implements 429 rate-limit handling
- Trust weight: 0.9

#### Reddit Adapter (`lib/adapters/reddit.ts`)
- Uses public JSON API for r/SuperSnail_US
- Searches for "code OR 'secret code' OR redeem"
- Implements cross-post deduplication within 24 hours
- Trust weight: 0.6

#### Wiki Adapter (`lib/adapters/wiki.ts`)
- Uses Firecrawl API with `FIRECRAWL_API_KEY` secret
- Scrapes https://supersnail.wiki.gg/wiki/Snail_codes
- Parses markdown tables for codes
- Trust weight: 1.0 (highest trust)

#### PocketGamer Adapter (`lib/adapters/pocketgamer.ts`)
- Uses Firecrawl API
- Scrapes https://www.pocketgamer.com/super-snail/codes/
- Trust weight: 0.7

#### Snelp Adapter (`lib/adapters/snelp.ts`)
- Uses Firecrawl API
- Scrapes https://snelp.com/codes
- Trust weight: 0.65

### 3. Deduplication Logic (`lib/dedupe.ts`)
- Normalizes codes to uppercase
- Merges codes from multiple sources
- Applies trust-weight based verification:
  - **Verified** if from high-trust source (Wiki, Discord, Twitter)
  - **Verified** if combined weight ≥ 1.5 within 24 hours
- Implements scope filtering: `active`, `past7`, `all`

### 4. Main Aggregator (`lib/aggregator.ts`)
- Orchestrates all adapters in parallel
- Returns unified `AggregationResult` with codes and source metadata
- Sorts codes by `last_seen_at` (newest first)

### 5. API Endpoint (`app/api/codes/route.ts`)
- Updated to use new aggregator
- Supports `scope` query parameter
- Cache-Control: 10 minutes with 24-hour stale-while-revalidate
- Returns codes, sources metadata, scope, and count

### 6. UI Components (`app/snail/codes/page.tsx`)
- Enhanced with new features:
  - **Verified badge** for high-confidence codes
  - **Provenance drawer** showing all sources with confidence scores
  - **Expires Soon badge** for codes expiring within 3 days
  - **Source badges** for Discord, Reddit, Wiki, PocketGamer, Snelp
  - **Improved search** across code, title, description, tags
  - **Copy All** persistent button
  - **Report** functionality for dead codes

## 📋 GitHub Secrets Required

The following secrets must be configured in GitHub repository settings:

- `DISCORD_TOKEN` — Discord bot token
- `DISCORD_CLIENT_ID` — Discord application/client ID
- `FIRECRAWL_API_KEY` — Firecrawl API key for scraping

## 🚀 Deployment Notes

### GitHub Actions Workflow
A workflow file (`aggregate-codes-workflow.yml`) has been created but must be manually added to `.github/workflows/` due to permission restrictions. The workflow:
- Runs every 10 minutes
- Fetches codes from all sources
- Creates JSON snapshots as artifacts
- Logs warnings for failed/degraded sources

### Environment Variables
No additional environment variables are needed beyond the GitHub secrets listed above.

## 🧪 Testing Recommendations

1. **Unit Tests** (to be added):
   - Test deduplication logic with various code formats
   - Test verification rules with different trust weight combinations
   - Test scope filtering edge cases

2. **Integration Tests** (to be added):
   - Mock adapter responses and test aggregation
   - Test API endpoint with different scopes
   - Test error handling for failed sources

3. **Manual Testing**:
   - Verify Discord bot has proper permissions
   - Test Firecrawl API key validity
   - Check UI rendering with real data
   - Verify provenance drawer shows correct sources

## 📊 Source Status Monitoring

The API returns source metadata for each adapter:
```json
{
  "sources": {
    "discord": {
      "source": "discord",
      "status": "ok",
      "lastFetch": "2025-11-01T15:48:00.000Z",
      "itemCount": 5
    },
    "reddit": {
      "source": "reddit",
      "status": "ok",
      "lastFetch": "2025-11-01T15:48:00.000Z",
      "itemCount": 12
    }
    // ... other sources
  }
}
```

## 🔄 Next Steps

1. Add the GitHub Actions workflow manually (requires `workflows` permission)
2. Implement unit and integration tests
3. Add monitoring/alerting for source failures
4. Consider adding Twitter API v2 support when keys are available
5. Implement MCP pilot if API/scrape methods prove unreliable

## 📝 Documentation

All planning documentation is available in:
- `docs/codes/` — Architecture, specs, adapters, deduplication, UX, testing, operations
- `docs/mcp/` — MCP optional pilot plan
- `reports/codes/` — Work breakdown, Codex tasks, open questions
