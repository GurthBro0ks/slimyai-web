## Healthcheck & Env Follow-up (Nov 11, 2025)

### Changes
- `docker-compose.prod.yml`: bound `HOST=0.0.0.0`/`PORT=3000`, replaced the healthcheck with an IPv4 wget against `/api/health`, and added an optional `loopback1455` Python service for loopback diagnostics.
- `.env.production` (local-only, not committed): derived `NEXT_PUBLIC_ADMIN_API_BASE` from `NEXT_PUBLIC_APP_URL` (`http://192.168.68.65:3000/api`), verified `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `OPENAI_API_KEY` are non-empty placeholders.
- `DEPLOYMENT_LOG.md`: recorded the IPv4 healthcheck fix, diagnostic service, and rebuild status.
- `.followup-web.log`: captured the latest `docker-compose logs --tail=200 web`.

### Commands & Outcomes
| Command | Result |
| --- | --- |
| `docker-compose -f docker-compose.prod.yml build --no-cache web` | ✅ Successful; Next build warns about deprecated `middleware` → `proxy`. |
| `docker-compose -f docker-compose.prod.yml up -d web` | ✅ `slimy-web` now `Up (healthy)` with IPv4 healthcheck. |
| `docker-compose -f docker-compose.prod.yml up -d loopback1455` | ✅ Temporary listener exposed `localhost:1455`; removed afterwards via `docker-compose rm -sf loopback1455`. |
| `curl -sS http://192.168.68.65:3000/api/health` | ✅ `{ ok: true, env: "production" }`. |
| `docker-compose run --rm web pnpm tsc --noEmit` / `pnpm exec tsc --noEmit` | ⚠️ Both failed: runtime image lacks TypeScript binary (only production bundle is copied). |
| `docker-compose run --rm web pnpm exec eslint .` / `pnpm lint` | ⚠️ Fails for same reason (`eslint` not installed in runtime layer). |

### Diagnostics
- `.followup-web.log` contains the latest boot log (Next ready + missing admin API base warning).
- `ss -ltnp` + `curl -I http://localhost:1455/` verified the temporary diag listener before removal.
- Post-cleanup `ss -ltnp` shows no remaining listeners on 1455.

### Final Status
- `docker-compose ps` shows: `slimy-web  Up (healthy)` @ `0.0.0.0:3000`.
- `/api/health` responds locally and over LAN.
- Optional loopback service removed after validation.
- Remaining warning: Next still logs `[AdminApiClient] NEXT_PUBLIC_ADMIN_API_BASE not configured` inside the container because the runtime env lacks that variable—provide it through `.env.production` or compose secrets before deployment.
