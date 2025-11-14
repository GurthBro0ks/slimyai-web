# Slimy Infrastructure: Front Door Map

> **Last Updated**: 2025-11-14
> **Author**: Infrastructure Team
> **Status**: Current Production Configuration

This document maps the complete public-facing infrastructure for Slimy services, from DNS through router forwarding to reverse proxies and backend services.

---

## Quick Reference

```
Internet → IONOS DNS (slimyai.xyz) → WAN IP (68.179.170.248) → Deco Router → NUC1 (192.168.68.64) → Caddy → Backend Services
```

**Key Components**:
- **DNS Provider**: IONOS (domain: slimyai.xyz)
- **WAN IP**: 68.179.170.248 (static)
- **Edge Router**: TP-Link Deco
- **Primary Server**: nuc1 (192.168.68.64)
- **Secondary Server**: nuc2 (192.168.68.65, private)
- **Reverse Proxy**: Caddy

---

## Layer 1: Public DNS (IONOS)

All DNS records managed at IONOS for domain `slimyai.xyz`.

### A Records

All point to the same WAN IP: **68.179.170.248**

| Hostname | FQDN | Type | Value | Purpose |
|----------|------|------|-------|---------|
| `@` | slimyai.xyz | A | 68.179.170.248 | Main site / generic front door |
| `login` | login.slimyai.xyz | A | 68.179.170.248 | Login/dashboard frontend |
| `admin` | admin.slimyai.xyz | A | 68.179.170.248 | Admin panel (Discord/OAuth, backups) |
| `panel` | panel.slimyai.xyz | A | 68.179.170.248 | User panel (future web app) |
| `mc` | mc.slimyai.xyz | A | 68.179.170.248 | Minecraft entry host (Bedrock/Java) |

### CNAME Records

| Hostname | FQDN | Type | Value | Purpose |
|----------|------|------|-------|---------|
| `www` | www.slimyai.xyz | CNAME | slimyai.xyz | Classic www → root redirect |
| `autodiscover` | autodiscover.slimyai.xyz | CNAME | adsredir.ionos.info | IONOS mail auto-config |

### API Access

- **IONOS Developer API**: Configured for programmatic DNS updates
- **API Key**: Stored securely (not in repo)
- **Use Case**: Future DNS automation, dynamic updates

---

## Layer 2: Router Port Forwarding (Deco)

TP-Link Deco forwards specific ports from **WAN (68.179.170.248)** to **LAN (192.168.68.x)**.

### HTTP/HTTPS Traffic

| External Port | Internal Target | Protocol | Service |
|--------------|-----------------|----------|---------|
| 80 | 192.168.68.64:80 | TCP | HTTP (slimy-HTTP) |
| 443 | 192.168.68.64:443 | TCP | HTTPS (slimy-https) |

**All web traffic** (regardless of hostname) hits nuc1. Host-based routing happens at Caddy level.

### Minecraft Traffic

| External Port | Internal Target | Protocol | Service |
|--------------|-----------------|----------|---------|
| 25565 | 192.168.68.64:25565 | TCP/UDP | Minecraft Java Edition |
| 19132 | 192.168.68.64:19132 | UDP | Minecraft Bedrock Edition |

### SSH Management

| External Port | Internal Target | Protocol | Service |
|--------------|-----------------|----------|---------|
| 4421 | 192.168.68.64:22 | TCP | nuc1 SSH |
| 4422 | 192.168.68.65:22 | TCP | nuc2 SSH |

**Security Note**: SSH is on non-standard ports. Standard port 22 is not exposed to WAN.

---

## Layer 3: Reverse Proxy & Services (NUC1)

NUC1 (192.168.68.64) runs **Caddy** as the reverse proxy for all HTTP/HTTPS traffic.

### 3.1 Admin Panel (admin.slimyai.xyz)

**Status**: Configured, services need verification

```
https://admin.slimyai.xyz
  ↓
Caddy :443 (TLS termination)
  ├─ /api/* → http://127.0.0.1:3080 (admin-api)
  └─ /*     → http://127.0.0.1:3081 (admin-ui)
```

**Backend Services**:
- **Admin API**: Port 3080 (Express.js, handles Discord OAuth, backups, user management)
- **Admin UI**: Port 3081 (React SPA, admin dashboard)

**Configuration**:
- Caddy config: `/etc/caddy/Caddyfile`
- Source config: `/opt/slimy/app/deploy/Caddyfile`
- Security: HSTS headers, automatic TLS via Let's Encrypt

**Current State**:
- ✅ DNS configured
- ✅ Port forwarding active
- ✅ Caddy vhost configured
- ⚠️  Backend services status: needs verification (previously 502'd)

**Next Steps**:
1. Verify `admin-api` is running on port 3080
2. Verify `admin-ui` is running on port 3081
3. Test https://admin.slimyai.xyz end-to-end

---

### 3.2 Main Web App (slimyai.xyz, login.slimyai.xyz, panel.slimyai.xyz)

**Status**: Network path ready, Caddy vhosts pending

```
https://slimyai.xyz, login.slimyai.xyz, panel.slimyai.xyz
  ↓
Caddy :443 (TLS termination)
  ↓
Next.js app (slimyai-web) on port 3000 (planned)
```

**Application**:
- **Project**: slimyai-web (this repo)
- **Framework**: Next.js 14
- **Features**: User login, dashboard, Bedrock status, admin integration

**Current State**:
- ✅ DNS configured (all three hostnames)
- ✅ Port forwarding active (80/443 → nuc1)
- ❌ Caddy vhost blocks not yet configured
- ❌ Next.js app not yet deployed to nuc1

**Planned Caddy Config**:
```caddyfile
slimyai.xyz, www.slimyai.xyz {
    reverse_proxy localhost:3000
}

login.slimyai.xyz {
    reverse_proxy localhost:3000
}

panel.slimyai.xyz {
    reverse_proxy localhost:3000
}
```

**Next Steps**:
1. Add vhost blocks to Caddy for slimyai.xyz, login, panel
2. Deploy slimyai-web to nuc1
3. Configure Next.js to run on port 3000 (or update Caddy to match port)
4. Set up systemd service for slimyai-web
5. Test all three hostnames

---

### 3.3 Minecraft (mc.slimyai.xyz)

**Status**: Fully operational (non-HTTP traffic)

```
mc.slimyai.xyz:25565 (Java) or :19132 (Bedrock)
  ↓
DNS → 68.179.170.248
  ↓
Deco forwards 25565/19132 → 192.168.68.64
  ↓
Minecraft Server (direct connection, no reverse proxy)
```

**Services**:
- **Java Edition**: Port 25565
- **Bedrock Edition**: Port 19132

**Web Integration**:
- `/api/bedrock-status` endpoint in slimyai-web fetches server status
- Routed through Caddy to Next.js app
- Displays online/offline status on web dashboard

**Current State**: ✅ Fully configured and working

---

## Layer 4: Secondary Server (NUC2)

**IP**: 192.168.68.65
**Status**: Private, SSH-only access

**Access**:
- SSH via port 4422 forwarding
- Not exposed to public web traffic

**Planned Use**:
- Database hosting
- Backup services
- Load balancing (future)

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET CLIENTS                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   IONOS DNS (slimyai.xyz)                    │
│  • slimyai.xyz, login, admin, panel, mc → 68.179.170.248   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              TP-Link Deco Router (WAN Gateway)               │
│                   IP: 68.179.170.248                         │
│                                                              │
│  Port Forwards:                                              │
│  • 80, 443 → 192.168.68.64 (HTTP/HTTPS)                    │
│  • 25565, 19132 → 192.168.68.64 (Minecraft)                │
│  • 4421 → 192.168.68.64:22 (SSH)                           │
│  • 4422 → 192.168.68.65:22 (SSH)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │   NUC1 (Edge Box)    │  │   NUC2 (Private)     │
    │  192.168.68.64       │  │  192.168.68.65       │
    └──────────────────────┘  └──────────────────────┘
                │                        │
                │                   SSH only (4422)
                ▼
    ┌──────────────────────────────────────┐
    │       Caddy Reverse Proxy            │
    │        (Ports 80/443)                │
    └──────────────────────────────────────┘
                │
      ┌─────────┼─────────┬─────────┐
      ▼         ▼         ▼         ▼
  ┌───────┐ ┌───────┐ ┌───────┐ ┌──────────┐
  │Admin  │ │Admin  │ │Slimy  │ │Minecraft │
  │ API   │ │  UI   │ │ Web   │ │ Servers  │
  │:3080  │ │:3081  │ │:3000  │ │25565/    │
  │       │ │       │ │(plan) │ │19132     │
  └───────┘ └───────┘ └───────┘ └──────────┘
      ▲         ▲         ▲
      │         │         │
   admin.*   admin.*   slimyai.xyz
            (html)     login.*
                       panel.*
```

---

## Security Summary

### TLS/SSL
- **Provider**: Let's Encrypt (automatic via Caddy)
- **Renewal**: Automatic
- **HSTS**: Enabled on admin.slimyai.xyz
- **Protocols**: TLS 1.2+

### Network Security
- **SSH**: Non-standard ports (4421, 4422)
- **Firewall**: Deco router port forwarding (whitelist approach)
- **Internal Services**: Bound to 127.0.0.1 (admin-api, admin-ui)
- **Reverse Proxy**: Single point of entry, all HTTPS

### Access Control
- **Admin Panel**: Discord OAuth required
- **SSH**: Key-based authentication
- **Database**: Not exposed to WAN (nuc2 private)

---

## Next Infrastructure Actions

### Immediate (Week 1)
1. ✅ Document infrastructure map (this doc)
2. ⚠️  Verify admin-api and admin-ui are running on nuc1
3. ⚠️  Test https://admin.slimyai.xyz end-to-end
4. ❌ Add Caddy vhosts for slimyai.xyz, login, panel
5. ❌ Deploy slimyai-web to nuc1

### Short-term (Month 1)
- Set up monitoring for all public services
- Configure automated backups for Caddy config
- Document deployment procedures for each service
- Set up staging environment (separate ports or subdomain)

### Long-term
- Load balancing between nuc1 and nuc2
- Dedicated database server on nuc2
- Container orchestration (Docker/k3s)
- CDN for static assets

---

## Troubleshooting

### Service is 502'ing

1. Check if backend service is running: `systemctl status <service-name>`
2. Verify port is listening: `ss -tlnp | grep <port>`
3. Check Caddy logs: `journalctl -u caddy -f`
4. Test backend directly: `curl http://localhost:<port>`

### DNS not resolving

1. Check IONOS DNS console for record
2. Verify with `dig slimyai.xyz` or `nslookup`
3. Wait for TTL (usually 3600s = 1 hour)
4. Flush local DNS cache if needed

### Can't reach service from internet

1. Verify DNS resolves to 68.179.170.248
2. Check Deco port forwarding is active
3. Check nuc1 firewall: `sudo ufw status`
4. Verify Caddy is running: `systemctl status caddy`
5. Check Caddy vhost config matches hostname

### SSL certificate issues

1. Caddy auto-manages certs; check logs: `journalctl -u caddy | grep -i cert`
2. Verify DNS propagation (Let's Encrypt needs valid DNS)
3. Check port 80 is reachable (ACME http-01 challenge)
4. Force renewal: `caddy reload` (if config changed)

---

## References

- **IONOS DNS Console**: https://my.ionos.com/
- **Deco Router**: http://192.168.68.1/
- **Caddy Documentation**: https://caddyserver.com/docs/
- **Repository**: `/home/user/slimyai-web`
- **Deployment Docs**: `/opt/slimy/app/deploy/README.md` (on nuc1)

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2025-11-14 | Infrastructure Team | Initial front door map created |
