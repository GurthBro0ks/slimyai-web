# Codes Aggregator Quickstart

API-first aggregation with Firecrawl fallback when APIs are unavailable.

## Secrets & Variables

Configure in **GitHub → Settings → Secrets and variables → Actions**:

- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_GUILD_ID`
- `DISCORD_CODES_CHANNEL_IDS` *(optional, comma-separated)*
- `FIRECRAWL_API_KEY` *(required for wiki/pocketgamer adapters)*
- `TWITTER_BEARER_TOKEN` *(optional)*
- `NEXT_PUBLIC_SNELP_CODES_URL` *(optional public API)*
- `USER_AGENT` *(optional override, default `Slimy.ai/1.0 (+https://slimy.ai)` )*

## Commands

- `pnpm codes:aggregate` — writes `data/codes/index.json` and `data/codes/snapshots/YYYY-MM-DD.json`
- `pnpm codes:health` — prints per-source status without writing files
- `pnpm test -- --run` — unit and integration suites

## Health Endpoint

- `GET /api/codes/health`
- Cache: `s-maxage=60, stale-while-revalidate=600`

## GitHub Actions

- `.github/workflows/aggregate-codes.yml` — runs every 10 minutes and on `workflow_dispatch`
  - Uploads `data/codes/index.json` and dated snapshots
  - Soft-fails when some sources degrade; still surfaces logs & summary
- `.github/workflows/codes-incident-check.yml` — opens/updates `codes:incident` issue after 3 consecutive failures

## Adapters (API-first → Scrape fallback)

| Adapter | Trust | Default | Notes |
|---------|-------|---------|-------|
| Discord | 1.0 | Requires bot token + guild ID | High trust, verified codes |
| Reddit | 0.5 | Enabled | Public JSON API |
| Twitter | 0.8 | Disabled | Enabled when bearer token provided |
| Snelp | 0.6 | Disabled | Requires `NEXT_PUBLIC_SNELP_CODES_URL` |
| Wiki | 1.0 | Disabled | Firecrawl placeholder |
| PocketGamer | 0.7 | Disabled | Firecrawl placeholder |

## Cron Flow

1. Install & build via pnpm
2. Run `pnpm codes:aggregate`
3. Summarize run in job output
4. Upload artifacts (latest index + snapshots)

## Firecrawl (Future Work)

- Respect robots, TTL, and cache headers
- Use `FIRECRAWL_API_KEY`
- Populate wiki/pocketgamer adapters when available

