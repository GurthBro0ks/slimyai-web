## 2025-11-11 — Healthcheck & Env Follow-up

- Switched Docker healthcheck to IPv4 (`wget http://127.0.0.1:3000/api/health`) and set `HOST=0.0.0.0`/`PORT=3000` in the `web` service to match Next’s runtime binding.
- Added optional `loopback1455` diagnostic service for verifying localhost port mapping; used temporarily then removed.
- Rebuilt `web` image (`c92c00195b7d`) and confirmed `docker-compose ps` reports `Up (healthy)`.
- `/api/health` now returns `{ ok: true }` and responds over LAN (`http://192.168.68.65:3000/api/health`).

## 2025-11-11 — Runtime env wiring + web-check

- `docker-compose.prod.yml`: `env_file` now drives runtime envs, `ADMIN_API_BASE` is provided alongside `HOST`/`PORT`, and `web-check` builder service runs `pnpm tsc --noEmit && pnpm exec eslint .` without host pnpm.
- `/api/health` is `force-dynamic` and reports `adminApiBaseConfigured` when `ADMIN_API_BASE` is set (derived from `NEXT_PUBLIC_ADMIN_API_BASE` in `.env.production`).
- `docker-compose build --no-cache web` + `up -d web` succeeded; `docker-compose ps` shows both services healthy.
- `docker-compose run --rm web-check` installs dev deps in the builder stage and runs type+lint checks (output saved in `.web-check.out` when needed).
