#!/usr/bin/env bash
set -euo pipefail

echo "=== /etc/hosts (top) ==="
head -n 20 /etc/hosts || true; echo

echo "=== Resolve localhost ==="
getent hosts localhost || true; echo

echo "=== Listeners on 1455 ==="
ss -ltnp | grep :1455 || echo "No listeners on 1455"; echo

echo "=== lsof 1455 ==="
lsof -nP -iTCP:1455 -sTCP:LISTEN || true; echo

echo "=== curl 127.0.0.1:1455 ==="
curl -sS -v --max-time 2 http://127.0.0.1:1455/ 2>&1 | sed -n '1,20p' || echo "curl failed"; echo

echo "=== Docker ports ==="
docker ps --format '{{.Names}}  {{.Ports}}' 2>/dev/null || true; echo

echo "=== PM2 ==="
pm2 ls 2>/dev/null || true; echo

echo "=== UFW (firewall) ==="
sudo -n ufw status 2>/dev/null || ufw status 2>/dev/null || echo "ufw status unavailable"
