# Slimy.ai Integration & Deployment Plan
## Bridging Three Worlds into One Unified Platform

**Created:** 2025-11-13
**Status:** Draft - Awaiting Bot Repo Analysis
**Goal:** Integrate Discord bot, Admin panel, and Next.js dashboard into unified architecture

---

## 📊 Current State Assessment

### World 1: Discord Bot (slimy-bot) ✅ PRODUCTION

**Status:** Fully operational, production-ready
**Location:** Docker containers on production server (NUC/VPS)
**Repository:** slimy-bot

#### Stack
- Discord.js v14
- MySQL database (shared with admin panel)
- Docker + docker-compose
- OpenAI API (GPT-4 + Vision)

#### Features (Working)
- ✅ AI chat with personality modes
- ✅ Supersnail club analytics (screenshot analysis)
- ✅ Snail codes aggregation (Snelp, Reddit)
- ✅ Guild management via slash commands
- ✅ User roles and permissions

#### Deployment
- Container: Discord bot
- Container: MySQL
- Network: slimy-net (Docker)
- Location: Production server at admin.slimyai.xyz IP

#### Known Issues
- None reported (working in production)

---

### World 2: Admin Panel (admin.slimyai.xyz) ✅ PRODUCTION

**Status:** Working after October 2024 fixes
**Location:** /opt/slimy/app on production Linux server
**Repository:** Part of slimy-bot (admin-api + admin-ui subdirectories)

#### Stack
- Express.js Admin API (port 3080)
- Next.js Admin UI (port 3081)
- Caddy or nginx (reverse proxy, HTTPS)
- MySQL database (shared with bot)

#### Features (Working)
- ✅ Discord OAuth login
- ✅ Guild list and management
- ✅ User management
- ✅ Role management
- ✅ Basic analytics dashboard

#### Deployment
- Service: admin-api on port 3080
- Service: admin-ui on port 3081
- Proxy: Caddy → /api/* → 3080, /* → 3081
- DNS: admin.slimyai.xyz → server public IP (IONOS DNS)

#### Known Issues
- Legacy codebase (being replaced by slimyai-web)
- Limited features compared to planned dashboard
- Separate from Discord bot codebase (duplicated logic)

---

### World 3: slimyai-web (Next.js Dashboard) ⚠️ DEVELOPMENT

**Status:** UI foundation complete, backend integration BLOCKED
**Location:** Development only (not deployed)
**Repository:** slimyai-web (this repo)

#### Stack (from repository scan)
- Next.js 16 with App Router
- React 19.2
- TypeScript 5 (strict, zero 'any' types)
- Prisma ORM (schema defined, not connected)
- Redis (caching layer designed, not active)
- Vitest + Playwright (testing infrastructure)

#### What EXISTS (Code/Architecture)
- ✅ 173 TypeScript files
- ✅ 29 API route handlers (MOCK/INCOMPLETE)
- ✅ 30 React components (UI complete)
- ✅ 13 pages (UI complete)
- ✅ 9 Prisma database models (schema only, no DB)
- ✅ Enterprise-grade monitoring (logger, APM, alerting)
- ✅ Security systems (DDoS protection, request signing)
- ✅ Type safety (100%, zero 'any' types)
- ✅ 75% test coverage
- ✅ Grade A++ (98/100) for code quality

#### What's MISSING (Blockers)
- ❌ Real Admin API integration (currently mocked)
- ❌ Database connection (Prisma schema exists, no DATABASE_URL)
- ❌ Discord OAuth (designed but not wired)
- ❌ Session management (uses mock cookies)
- ❌ Real data (uses localStorage/mocks)
- ❌ Deployment configuration (no production env)
- ❌ Integration with existing bot/admin panel

#### Features (UI Only, Not Functional)
- 🎨 Chat interface (UI ready, no backend)
- 🎨 Guild management pages (UI ready, no API)
- 🎨 Club analytics UI (UI ready, no Vision API)
- 🎨 Codes aggregator UI (UI ready, no data source)
- 🎨 Admin panel (UI ready, no auth/data)
- 🎨 Analytics dashboard (UI ready, no metrics)
- 🎨 User preferences (UI ready, localStorage only)

#### Grade Breakdown (What Code Quality Shows)
- Architecture: 95/100 ✅ Excellent patterns, clean separation
- Type Safety: 100/100 ✅ Zero 'any' types
- Testing: 85/100 ✅ Good coverage (but tests mock data)
- Security: 95/100 ✅ Systems designed (not active)
- Performance: 90/100 ✅ Monitoring ready (not deployed)
- Monitoring: 95/100 ✅ Infrastructure ready (not active)

**Summary:** World-class frontend architecture with comprehensive infrastructure design, but **ZERO backend connectivity**. It's a beautiful, well-tested, type-safe... mock.

---

## 🔍 Gap Analysis

### Critical Blockers

#### 1. Database Layer (CRITICAL)
**Problem:** Three separate data stories
- Bot/Admin Panel: MySQL (production, working)
- slimyai-web: Prisma schema for PostgreSQL (designed, not deployed)
- No shared database, no data sync

**Impact:** Cannot launch slimyai-web without database

**Options:**
- **Option A:** Migrate bot/admin to PostgreSQL + Prisma (big lift, risky)
- **Option B:** Make slimyai-web use existing MySQL (requires Prisma MySQL adapter)
- **Option C:** Run both databases, sync via API (complex, duplicated data)

**Recommendation:** Option B (use existing MySQL, update Prisma schema)

---

#### 2. Admin API Integration (CRITICAL)
**Problem:** API mismatch
- Existing Admin API: Limited endpoints for old admin panel
- slimyai-web: Expects 29 endpoints (currently mocked)
- No OpenAPI spec, no shared contract

**Impact:** Cannot fetch/save data from slimyai-web

**Required Work:**
- Audit existing Admin API endpoints
- Map slimyai-web's 29 API routes to Admin API
- Extend Admin API with missing endpoints
- OR: Implement API routes directly in slimyai-web (serverless functions)

**Recommendation:** Implement API routes in slimyai-web as Next.js API routes, calling bot services/DB directly (consolidate stacks)

---

#### 3. Authentication & Authorization (CRITICAL)
**Problem:** OAuth not wired
- Admin Panel: Working Discord OAuth (Express session)
- slimyai-web: Middleware expects `slimy_admin` cookie (designed, not working)
- No shared session store

**Impact:** Cannot log in to slimyai-web

**Required Work:**
- Implement Discord OAuth flow in slimyai-web
- Share session cookies between admin panel and slimyai-web (same domain)
- OR: Migrate to JWT tokens (stateless, better for scaling)

**Recommendation:** Implement Discord OAuth directly in slimyai-web (Next.js API routes + NextAuth.js or custom)

---

#### 4. Service Integration (HIGH)
**Problem:** Duplicated logic
- Bot: Club analytics, codes aggregation, chat (Discord.js)
- slimyai-web: Same features (web UI)
- No shared code, no service layer

**Impact:** Cannot reuse bot logic from web

**Required Work:**
- Extract bot features into shared services (lib/)
- Create API layer for bot to expose services
- Call bot services from slimyai-web
- OR: Reimplement in slimyai-web (duplication)

**Recommendation:** Extract shared logic into npm package or monorepo

---

#### 5. Deployment Architecture (HIGH)
**Problem:** Unclear deployment story
- Bot: Docker on production server ✅
- Admin Panel: /opt/slimy/app on same server ✅
- slimyai-web: No deployment config ❌

**Impact:** Cannot deploy slimyai-web to production

**Required Work:**
- Define hosting strategy (same server? separate?)
- Create Dockerfile for slimyai-web
- Configure reverse proxy (Caddy/nginx)
- Set up DNS (slimyai.xyz or panel.slimyai.xyz)
- Configure environment variables

**Recommendation:** Deploy slimyai-web on same server, separate port, reverse proxy to slimyai.xyz

---

### Non-Critical Gaps

#### 6. Redis Integration (MEDIUM)
**Current:** Designed in slimyai-web, not connected
**Impact:** No caching, slower performance
**Work:** Configure Redis URL, test cache layer

---

#### 7. OpenAI Integration (MEDIUM)
**Current:** Bot uses OpenAI, slimyai-web has mock chat
**Impact:** Web chat doesn't work
**Work:** Share OpenAI API key, implement chat API routes

---

#### 8. Monitoring & Alerting (LOW)
**Current:** Infrastructure designed in slimyai-web, not active
**Impact:** No observability in production
**Work:** Enable logging, APM, alerting in production

---

#### 9. CI/CD Pipeline (LOW)
**Current:** GitHub Actions exist, not configured for deployment
**Impact:** Manual deployment required
**Work:** Configure deploy workflow, automate releases

---

## 🎯 Integration Strategy

### Target Architecture (End Goal)

```
┌─────────────────────────────────────────────────────────────┐
│                    IONOS DNS                                │
│  admin.slimyai.xyz → NUC1 IP                               │
│  slimyai.xyz → NUC1 IP                                     │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              NUC1 (Production Server)                       │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Caddy Reverse Proxy (HTTPS)                       │   │
│  │  - admin.slimyai.xyz/api/* → Admin API (3080)     │   │
│  │  - admin.slimyai.xyz/* → Admin UI (3081)          │   │
│  │  - slimyai.xyz/* → slimyai-web (3000)             │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐                │
│  │ Discord Bot     │  │ slimyai-web      │                │
│  │ (Docker)        │  │ (Next.js)        │                │
│  │ Port: Internal  │  │ Port: 3000       │                │
│  └─────────────────┘  └──────────────────┘                │
│           │                     │                           │
│           └──────────┬──────────┘                          │
│                      ▼                                      │
│  ┌────────────────────────────────────────────────────┐   │
│  │  MySQL Database (Docker)                           │   │
│  │  - Bot data                                        │   │
│  │  - Admin panel data                                │   │
│  │  - slimyai-web data (unified schema)               │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Redis Cache (Docker)                              │   │
│  │  - Session storage                                 │   │
│  │  - API caching                                     │   │
│  │  - Rate limiting                                   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Service Consolidation Plan

**Phase 1: Unified Database**
- Migrate Prisma schema from PostgreSQL to MySQL
- Extend existing MySQL with slimyai-web tables
- Create migration scripts
- Test Prisma + MySQL integration

**Phase 2: API Consolidation**
- Implement slimyai-web API routes as Next.js routes (eliminate separate Admin API)
- Routes call bot services or database directly
- Keep Discord bot separate (different concern)

**Phase 3: Shared Auth**
- Implement Discord OAuth in slimyai-web
- Use same session cookie (`slimy_admin`)
- Store sessions in Redis
- Both old admin panel and new dashboard share sessions

**Phase 4: Gradual Migration**
- Deploy slimyai-web alongside old admin panel
- Migrate features one by one
- Eventually deprecate old admin panel
- slimyai-web becomes THE admin panel + user dashboard

---

## 📅 Phased Implementation Roadmap

### Phase 0: Infrastructure Preparation (Week 1) 🚧

**Goal:** Unblock slimyai-web deployment

#### Tasks
1. **Database Setup**
   - [ ] Audit existing MySQL schema (bot + admin panel)
   - [ ] Convert Prisma schema from PostgreSQL to MySQL
   - [ ] Create migration scripts for new tables
   - [ ] Test Prisma + MySQL connection
   - [ ] Set DATABASE_URL in .env

2. **Redis Setup**
   - [ ] Deploy Redis container on production server
   - [ ] Configure Redis URL in .env
   - [ ] Test cache connection from slimyai-web

3. **Environment Configuration**
   - [ ] Create production .env for slimyai-web
   - [ ] Copy secrets from bot (OPENAI_API_KEY, etc.)
   - [ ] Configure NEXT_PUBLIC_ADMIN_API_BASE (if keeping old API)
   - [ ] Set session secret, signing keys

4. **Deployment Preparation**
   - [ ] Create Dockerfile for slimyai-web
   - [ ] Create docker-compose.yml entry
   - [ ] Test local Docker build
   - [ ] Configure Caddy for slimyai.xyz

**Deliverable:** slimyai-web can connect to database and cache

---

### Phase 1: Authentication & Session Management (Week 2) 🔐

**Goal:** Enable user login to slimyai-web

#### Tasks
1. **Discord OAuth Implementation**
   - [ ] Install NextAuth.js or implement custom OAuth
   - [ ] Create /api/auth/callback endpoint
   - [ ] Configure Discord app (OAuth redirect URLs)
   - [ ] Implement role mapping (admin, club, user)
   - [ ] Test login flow

2. **Session Management**
   - [ ] Store sessions in Redis (not in-memory)
   - [ ] Share session cookie with old admin panel (same domain)
   - [ ] Implement session validation middleware
   - [ ] Test session persistence

3. **Protected Routes**
   - [ ] Verify middleware.ts works with real sessions
   - [ ] Test role-based access (admin, club, user)
   - [ ] Test redirect to login

**Deliverable:** Users can log in to slimyai-web with Discord

---

### Phase 2: Core API Implementation (Week 3-4) 🛠️

**Goal:** Make slimyai-web API routes functional

#### Strategy Decision
**Option A:** Extend existing Admin API (3080)
- Pros: Reuses existing code, minimal duplication
- Cons: Maintains separate service, requires API client

**Option B:** Implement in slimyai-web (Next.js API routes)
- Pros: Consolidates stack, serverless-ready, simpler deployment
- Cons: Duplicates some logic from admin API

**Recommendation:** Option B (implement in slimyai-web)

#### Priority 1: Essential Endpoints (Week 3)
Implement these endpoints with REAL data:

1. **Authentication**
   - ✅ GET /api/auth/me (get current user + roles)

2. **Guilds**
   - [ ] GET /api/guilds (list user's guilds from DB)
   - [ ] GET /api/guilds/[id] (guild details)
   - [ ] PATCH /api/guilds/[id] (update guild)
   - [ ] GET /api/guilds/[id]/members (list members)

3. **User Preferences**
   - [ ] GET /api/user/preferences
   - [ ] PUT /api/user/preferences

4. **System**
   - [ ] GET /api/health (health check)
   - [ ] GET /api/diag (diagnostics)

#### Priority 2: Feature Endpoints (Week 4)
5. **Codes Aggregation**
   - [ ] GET /api/codes (Snelp + Reddit aggregation)
   - [ ] GET /api/codes/health (source health)
   - [ ] POST /api/codes/report (report bad code)

6. **Stats**
   - [ ] GET /api/stats (system stats)
   - [ ] GET /api/usage (usage metrics)

#### Priority 3: Advanced Features (Later)
7. **Chat** (if separating from Discord)
   - [ ] POST /api/chat/bot (AI chat)
   - [ ] GET /api/chat/conversations
   - [ ] POST /api/chat/message

8. **Club Analytics**
   - [ ] POST /api/club/upload (screenshot upload)
   - [ ] POST /api/club/analyze (GPT-4 Vision analysis)
   - [ ] POST /api/club/export (export results)

**Deliverable:** Core features work with real data

---

### Phase 3: Feature Migration (Week 5-6) 🚀

**Goal:** Migrate features from old admin panel to slimyai-web

#### Week 5: Guild Management
- [ ] Migrate guild list page
- [ ] Migrate guild details page
- [ ] Migrate member management
- [ ] Migrate feature flags UI
- [ ] Test CRUD operations

#### Week 6: Analytics & Codes
- [ ] Migrate codes aggregator
- [ ] Migrate stats dashboard
- [ ] Migrate club analytics (if used)
- [ ] Test data flow

**Deliverable:** Feature parity with old admin panel

---

### Phase 4: Bot Integration (Week 7) 🤖

**Goal:** Integrate Discord bot features into web dashboard

#### Tasks
1. **Shared Services**
   - [ ] Extract club analytics logic from bot
   - [ ] Extract codes aggregation from bot
   - [ ] Create shared npm package or monorepo
   - [ ] Import into slimyai-web

2. **Direct Integration**
   - [ ] Web UI can trigger club analysis
   - [ ] Web UI shows same data as Discord bot
   - [ ] Bot and web share database (already done if Phase 0 complete)

**Deliverable:** Web dashboard has all bot features

---

### Phase 5: Production Deployment (Week 8) 📦

**Goal:** Deploy slimyai-web to production alongside bot

#### Tasks
1. **Docker Deployment**
   - [ ] Build production Docker image
   - [ ] Add to docker-compose.yml on production server
   - [ ] Configure environment variables
   - [ ] Test container startup

2. **Reverse Proxy**
   - [ ] Update Caddyfile for slimyai.xyz
   - [ ] Configure HTTPS
   - [ ] Test routing

3. **DNS**
   - [ ] Point slimyai.xyz to production server IP
   - [ ] Test DNS propagation
   - [ ] Verify HTTPS certificate

4. **Monitoring**
   - [ ] Enable structured logging (logs/ directory)
   - [ ] Configure alerting webhooks
   - [ ] Enable APM tracking
   - [ ] Test Web Vitals collection

**Deliverable:** slimyai-web live at slimyai.xyz

---

### Phase 6: Migration & Deprecation (Week 9-10) 🔄

**Goal:** Fully replace old admin panel

#### Week 9: Parallel Operation
- [ ] Run both admin.slimyai.xyz and slimyai.xyz
- [ ] Monitor for bugs/issues
- [ ] Migrate active users to new dashboard
- [ ] Fix any discovered issues

#### Week 10: Deprecation
- [ ] Redirect admin.slimyai.xyz → slimyai.xyz
- [ ] Archive old admin panel code
- [ ] Remove admin-api and admin-ui containers
- [ ] Clean up unused code

**Deliverable:** Single unified platform

---

## 🏗️ Architecture Decisions

### Decision 1: Database Strategy
**Chosen:** Use existing MySQL, update Prisma schema
**Rationale:**
- Avoids risky migration of production bot data
- Prisma supports MySQL well
- Can migrate to PostgreSQL later if needed
- Minimizes disruption

### Decision 2: API Strategy
**Chosen:** Implement API routes in slimyai-web (Next.js)
**Rationale:**
- Consolidates stack (one less service to maintain)
- Leverages Next.js API routes (serverless-ready)
- Easier deployment (one container instead of three)
- Modern architecture (serverless functions)

### Decision 3: Authentication Strategy
**Chosen:** Implement Discord OAuth in slimyai-web
**Rationale:**
- NextAuth.js makes this trivial
- Can share sessions via Redis
- Stateless JWT option for future scaling
- Better developer experience

### Decision 4: Deployment Strategy
**Chosen:** Docker on same NUC as bot
**Rationale:**
- Simplifies infrastructure (one server)
- Shares database and Redis
- Lower costs
- Easier to manage
- Can scale to separate servers later

### Decision 5: Migration Strategy
**Chosen:** Gradual feature migration, parallel operation
**Rationale:**
- Lower risk (old admin panel stays working)
- Can test thoroughly
- Users can switch gradually
- Easier rollback if issues

---

## 🚨 Risk Assessment

### High Risk
1. **Database Migration**
   - Risk: Breaking production bot
   - Mitigation: Test on staging, backup DB, gradual rollout

2. **Authentication Breaking**
   - Risk: Users locked out
   - Mitigation: Keep old admin panel working, test extensively

3. **Data Loss**
   - Risk: Lost guild/user data during migration
   - Mitigation: Database backups, migration scripts tested on copies

### Medium Risk
4. **Performance Degradation**
   - Risk: New dashboard slows down bot
   - Mitigation: Separate containers, monitoring, load testing

5. **Feature Gaps**
   - Risk: Missing features from old admin panel
   - Mitigation: Feature parity checklist, user testing

### Low Risk
6. **Monitoring Gaps**
   - Risk: Issues not detected
   - Mitigation: Enable logging/APM from day 1

7. **Security Issues**
   - Risk: Auth bypass, DDoS
   - Mitigation: Code review, penetration testing, DDoS protection enabled

---

## 📋 Prerequisites & Dependencies

### Before Starting
- [ ] Bot repo analysis complete (PENDING)
- [ ] Admin API endpoints documented (PENDING)
- [ ] Current MySQL schema exported (PENDING)
- [ ] Production server access confirmed
- [ ] Backup strategy verified

### Required Access
- [ ] Production server SSH access (NUC1)
- [ ] IONOS DNS admin access
- [ ] Discord developer portal (OAuth app)
- [ ] GitHub repo access (both repos)
- [ ] MySQL admin access

### Required Credentials
- [ ] DATABASE_URL (MySQL connection string)
- [ ] REDIS_URL (Redis connection string)
- [ ] OPENAI_API_KEY (from bot .env)
- [ ] Discord OAuth client ID + secret
- [ ] Session secret for cookie signing
- [ ] REQUEST_SIGNING_SECRET (for inter-service auth)

---

## 🎯 Success Criteria

### Phase 0 Success
- ✅ slimyai-web connects to MySQL
- ✅ slimyai-web connects to Redis
- ✅ Environment variables configured
- ✅ Docker build succeeds

### Phase 1 Success
- ✅ Users can log in with Discord
- ✅ Sessions persist in Redis
- ✅ Role-based access works
- ✅ Protected routes enforce auth

### Phase 2 Success
- ✅ All Priority 1 API endpoints return real data
- ✅ Database queries work
- ✅ Error handling works
- ✅ API tests pass

### Phase 3 Success
- ✅ Guild management feature complete
- ✅ Codes aggregator feature complete
- ✅ Feature parity with old admin panel

### Phase 4 Success
- ✅ Web dashboard can analyze club screenshots
- ✅ Web dashboard shows snail codes
- ✅ Bot and web share data

### Phase 5 Success
- ✅ slimyai-web deployed to slimyai.xyz
- ✅ HTTPS working
- ✅ Monitoring active
- ✅ No downtime during deployment

### Phase 6 Success
- ✅ Old admin panel deprecated
- ✅ All users migrated
- ✅ Single unified platform
- ✅ Documentation updated

---

## 📊 Effort Estimation

### By Phase
| Phase | Duration | Effort | Risk |
|-------|----------|--------|------|
| Phase 0: Infrastructure | 1 week | Medium | High |
| Phase 1: Auth | 1 week | Low | Medium |
| Phase 2: Core API | 2 weeks | High | Medium |
| Phase 3: Feature Migration | 2 weeks | Medium | Low |
| Phase 4: Bot Integration | 1 week | Medium | Low |
| Phase 5: Deployment | 1 week | Low | High |
| Phase 6: Migration | 2 weeks | Low | Medium |
| **Total** | **10 weeks** | | |

### By Resource Type
- **Development:** 60% (API implementation, feature migration)
- **DevOps:** 20% (deployment, infrastructure, monitoring)
- **Testing:** 15% (integration tests, user testing)
- **Documentation:** 5% (API docs, deployment guides)

---

## 🔄 Next Steps

### Immediate (This Week)
1. ✅ Complete slimyai-web repository scan (DONE)
2. ⏳ Analyze slimy-bot repository (PENDING - awaiting other repo)
3. ⏳ Document existing Admin API endpoints (PENDING)
4. ⏳ Export current MySQL schema (PENDING)
5. ⏳ Create combined analysis report (PENDING)

### After Bot Analysis
1. Finalize Phase 0 task breakdown
2. Create Prisma schema for MySQL
3. Set up staging environment
4. Begin Phase 0 implementation

### Weekly Cadence
- **Monday:** Plan week's tasks
- **Wednesday:** Mid-week checkpoint
- **Friday:** Demo progress, retrospective
- **Sunday:** Prepare next week

---

## 📝 Open Questions

### For Bot Repo Analysis
1. What endpoints does the current Admin API (port 3080) expose?
2. What's the exact MySQL schema (tables, columns, relationships)?
3. Which features are Discord-only vs. need web equivalent?
4. What shared logic can be extracted (club analytics, codes)?
5. What's the current deployment setup on production server?

### For Architecture
1. Should we keep admin.slimyai.xyz or just use slimyai.xyz?
2. Keep old admin panel as fallback or deprecate immediately?
3. PostgreSQL migration now or later?
4. Separate staging server or use NUC2?

### For Deployment
1. Docker or direct deploy for slimyai-web?
2. Same container orchestration or separate?
3. Shared reverse proxy config or separate?
4. How to handle zero-downtime deployment?

---

## 📚 Appendices

### Appendix A: Current slimyai-web API Routes

From repository scan, these 29 routes exist (currently mocked):

**Auth:** /api/auth/me
**Chat:** /api/chat/bot, /api/chat/conversations, /api/chat/message, /api/chat/messages, /api/chat/users
**Club:** /api/club/analyze, /api/club/export, /api/club/upload
**Codes:** /api/codes, /api/codes/health, /api/codes/report, /api/local-codes
**Guilds:** /api/guilds, /api/guilds/[id], /api/guilds/[id]/members, /api/guilds/[id]/members/[userId], /api/guilds/[id]/members/bulk, /api/guilds/[id]/flags, /api/guilds/[id]/settings
**Stats:** /api/stats, /api/stats/events/stream, /api/usage
**User:** /api/user/preferences
**Snail:** /api/snail/history
**System:** /api/diag, /api/health, /api/screenshot, /api/web-vitals

### Appendix B: slimyai-web Prisma Models

From repository scan, these 9 models are defined:

1. ClubAnalysis
2. ClubAnalysisImage
3. ClubMetric
4. UserPreferences
5. ChatConversation
6. ChatMessage
7. GuildFeatureFlags
8. CodeReport
9. AuditLog
10. UserSession

### Appendix C: Current Infrastructure

**Production Server:** NUC1 (migrating from IONOS VPS)
**Staging Server:** NUC2 (planned)
**DNS Provider:** IONOS
**Reverse Proxy:** Caddy or nginx
**Container Orchestration:** Docker + docker-compose

---

**Last Updated:** 2025-11-13
**Next Review:** After bot repository analysis
**Owner:** GurthBro0ks
**Status:** 🟡 Awaiting Bot Repo Analysis
