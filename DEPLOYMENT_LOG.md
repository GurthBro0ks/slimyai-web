## 2025-11-11 — Healthcheck & Env Follow-up

- Switched Docker healthcheck to IPv4 (`wget http://127.0.0.1:3000/api/health`) and set `HOST=0.0.0.0`/`PORT=3000` in the `web` service to match Next’s runtime binding.
- Added optional `loopback1455` diagnostic service for verifying localhost port mapping; used temporarily then removed.
- Rebuilt `web` image (`c92c00195b7d`) and confirmed `docker-compose ps` reports `Up (healthy)`.
- `/api/health` now returns `{ ok: true }` and responds over LAN (`http://192.168.68.65:3000/api/health`).
