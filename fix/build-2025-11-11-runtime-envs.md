## Runtime Env Wiring — Follow-up (Nov 11, 2025)

### Changes
- `docker-compose.prod.yml`
  - Uses `env_file: .env.production` for `web`, while keeping `HOST` / `PORT` overrides.
  - Adds `ADMIN_API_BASE` to the runtime (via `.env.production`) so `/api/health` can verify it.
  - Introduces `web-check` (builder target) that runs `pnpm tsc --noEmit && pnpm exec eslint .` without requiring host pnpm.
- `app/api/health/route.ts` is now `force-dynamic`, reads envs at runtime via bracket access, and reports `adminApiBaseConfigured`.
- `DEPLOYMENT_LOG.md` updated with the runtime-env milestone.

### Commands & Outcomes
| Command | Result |
| --- | --- |
| `docker-compose -f docker-compose.prod.yml build --no-cache web` | ✅ Successful; standard Next middleware→proxy warning persists. |
| `docker-compose -f docker-compose.prod.yml up -d web` | ✅ `slimy-web` healthy on `0.0.0.0:3000`. |
| `curl -sS http://192.168.68.65:3000/api/health` | ✅ `{"ok":true,"env":"production","adminApiBaseConfigured":true}` → saved to `.health-after-env.json` (not committed). |
| `docker-compose -f docker-compose.prod.yml run --rm web-check` | ✅ Builder stage installs dev deps and runs `pnpm tsc --noEmit && pnpm exec eslint .` (warnings only about ignored build scripts; see `.web-check.out`). |

### Notes
- `.env.production` (local only) now contains both `NEXT_PUBLIC_ADMIN_API_BASE=http://192.168.68.65:3000/api` and `ADMIN_API_BASE` with the same value; keep secrets (NEXTAUTH, OpenAI, etc.) out of git.
- `/api/health` is dynamic, so future env changes appear immediately. Health JSON is a simple `{ ok, env, adminApiBaseConfigured }` payload for Compose healthchecks and monitoring.
- Middleware→proxy deprecation still outstanding; schedule migration separately.
