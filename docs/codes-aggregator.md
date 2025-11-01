# Codes Aggregator Documentation

## Overview

The Codes Aggregator is a multi-source system that collects, deduplicates, and verifies game codes from various sources with an **API-first** approach.

## Architecture

### Design Principles

1. **API-First**: Prefer official APIs over scraping
2. **Scrape Second**: Use Firecrawl for unavoidable scraping with respect for robots.txt and rate limits
3. **MCP Optional**: Model Context Protocol integration is planned for future (not implemented)

### Trust-Based Verification

Each source has a trust weight:

- **Discord** (1.0): Official Discord channels - high trust
- **Twitter** (0.8): Official Twitter account - good trust
- **Wiki** (1.0): Curated wiki - high trust
- **PocketGamer** (0.7): Gaming site - good trust
- **Snelp** (0.6): Third-party API - medium-good trust
- **Reddit** (0.5): Community posts - medium trust

Codes are marked as **verified** when:
- From a high-trust source (Discord, Wiki, Twitter), OR
- Combined trust weight ≥ 1.5 from multiple sources within 24 hours

## Sources

### API-First Sources

#### Discord (Required)
- **Method**: Discord Bot API
- **Credentials**: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`
- **Guild Config**: `DISCORD_GUILD_ID` (required), `DISCORD_CODES_CHANNEL_IDS` (comma-separated optional)
- **Trust**: 1.0 (high)
- **Status**: Fully implemented

#### Reddit (Always Enabled)
- **Method**: Public JSON API (no auth required)
- **Endpoint**: `/r/SuperSnailGame/search.json`
- **Trust**: 0.5 (medium)
- **Status**: Fully implemented

#### Twitter (Optional)
- **Method**: Twitter API v2
- **Credentials**: `TWITTER_BEARER_TOKEN`
- **Username**: @SuperSnailUS
- **Trust**: 0.8 (good)
- **Status**: Fully implemented, disabled by default

#### Snelp (Optional)
- **Method**: Public API
- **Config**: `NEXT_PUBLIC_SNELP_CODES_URL`
- **Trust**: 0.6 (medium-good)
- **Status**: Fully implemented

### Scraping Sources (Firecrawl)

#### Wiki (Not Implemented)
- **URL**: https://supersnailgame.fandom.com/wiki/Gift_Codes
- **Method**: Firecrawl API
- **Credentials**: `FIRECRAWL_API_KEY`
- **Trust**: 1.0 (high)
- **Status**: Placeholder only

#### PocketGamer (Not Implemented)
- **URL**: https://www.pocketgamer.com/super-snail/codes/
- **Method**: Firecrawl API
- **Credentials**: `FIRECRAWL_API_KEY`
- **Trust**: 0.7 (good)
- **Status**: Placeholder only

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Required for Discord
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_server_id
DISCORD_CODES_CHANNEL_IDS=channel_id_1,channel_id_2

# Optional: Twitter v2
TWITTER_BEARER_TOKEN=your_bearer_token

# Optional: Snelp API
NEXT_PUBLIC_SNELP_CODES_URL=https://api.snelp.com/codes

# Optional: Firecrawl (for wiki/pocketgamer scraping)
FIRECRAWL_API_KEY=your_firecrawl_key
# Optional: custom UA
USER_AGENT="Slimy.ai/1.0 (+https://slimy.ai)"
```

### GitHub Secrets (for CI)

Add these secrets in **Settings → Secrets and variables → Actions**:

- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_GUILD_ID`
- `DISCORD_CODES_CHANNEL_IDS`
- `TWITTER_BEARER_TOKEN` (optional)
- `NEXT_PUBLIC_SNELP_CODES_URL` (optional)
- `FIRECRAWL_API_KEY` (optional)
- `USER_AGENT` (optional repository variable)

## Usage

### CLI Commands

```bash
# Run aggregation
pnpm codes:aggregate

# Check health only (no file writes)
pnpm codes:health
```

### API Endpoints

#### `/api/codes`
Returns aggregated codes with filtering

**Query Parameters:**
- `scope`: `active` | `past7` | `verified` | `all` (default: `active`)

**Response:**
```json
{
  "codes": [...],
  "sources": {...},
  "scope": "active",
  "count": 42,
  "generatedAt": "2025-11-01T12:00:00Z"
}
```

#### `/api/codes/health`
Health check endpoint for monitoring

**Response:**
```json
{
  "ok": true,
  "sources": {
    "discord": { "status": "ok", "lastFetch": "...", "itemCount": 10 },
    "reddit": { "status": "ok", "lastFetch": "...", "itemCount": 5 },
    "twitter": { "status": "not_configured", "lastFetch": "...", "itemCount": 0 }
  },
  "totalCodes": 12,
  "verifiedCodes": 8,
  "generatedAt": "2025-11-01T12:00:00Z"
}
```

## Scheduled Aggregation

The workflow `.github/workflows/aggregate-codes.yml` runs every 10 minutes:

1. Fetches from all configured sources
2. Deduplicates and verifies codes
3. Writes `data/codes/index.json` and dated snapshot
4. Uploads artifacts for 30 days
5. Creates job summary with statistics

### Manual Trigger

Go to **Actions → Aggregate Codes (Scheduled) → Run workflow**

## Monitoring & Alerting

The system includes incident monitoring via `.github/workflows/codes-incident-check.yml`:

- Tracks consecutive workflow failures
- Opens GitHub issue labeled `codes:incident` after 3 failures
- Updates existing issue if already open
- Auto-closes when health is restored

### Health Check Example

```bash
curl https://your-domain.com/api/codes/health
```

## File Structure

```
lib/
  types/
    codes.ts              # Core types and trust weights
  adapters/
    base.ts               # Base adapter class
    discord.ts            # Discord API adapter
    reddit.ts             # Reddit API adapter
    twitter.ts            # Twitter v2 adapter (optional)
    snelp.ts              # Snelp API adapter
    wiki.ts               # Wiki scraper (placeholder)
    pocketgamer.ts        # PocketGamer scraper (placeholder)
    index.ts              # Adapter registry
  dedupe.ts               # Deduplication with trust weights
  codes-aggregator.ts     # Main aggregator logic

scripts/
  aggregate-codes.ts      # CLI aggregation script

app/api/codes/
  route.ts                # Main codes API
  health/route.ts         # Health check endpoint

data/codes/
  index.json              # Latest aggregated codes
  snapshots/              # Dated snapshots
    YYYY-MM-DD.json
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test dedupe.test.ts
```

## Future Enhancements

- [ ] Complete Firecrawl integration for Wiki and PocketGamer
- [ ] Model Context Protocol (MCP) integration
- [ ] 7-day trailing average for item count drops
- [ ] Auto-close incident issues when resolved
- [ ] Code expiration prediction based on patterns
- [ ] Multi-region code support

## Troubleshooting

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create application → Bot → Copy token
3. Add bot to server with `bot` and `messages.read` scopes
4. Get channel IDs by enabling Developer Mode in Discord

### Twitter API

1. Apply for Twitter Developer account
2. Create App → Keys and Tokens → Bearer Token
3. Add token to secrets

### Rate Limiting

All adapters include rate-limit handling:
- Discord: Respects `Retry-After` header
- Reddit: 1s delay between queries
- Twitter: Exponential backoff with 60s cap

## Security

- Never commit `.env` files
- API keys stored in GitHub Secrets only
- Health endpoint doesn't expose error details
- No secrets in workflow logs
