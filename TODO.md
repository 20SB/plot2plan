# plot2plan — Next.js Rewrite TODO

Exact same features, new tech stack:
- **Next.js 16** (App Router, TypeScript) ← scaffolded as 16.2.4
- **Neon DB** (PostgreSQL) + **Prisma 7 ORM**
- **NextAuth.js v5** (credentials provider)
- **Shadcn UI** + **Tailwind CSS v4**
- **Anthropic SDK** (`@anthropic-ai/sdk`, claude-sonnet-4-5)
- **jsPDF + html2canvas + dxf-writer** (export)

App lives at: `nextjs/` subdirectory (keeps old frontend/backend for reference)

---

## Phase 0 — Project Bootstrap ✅ `commit a559af4`
- [x] Next.js 16 with TypeScript, Tailwind, App Router, src/ dir
- [x] Prisma 7 + Neon adapter + PrismaClient singleton
- [x] NextAuth.js v5 (credentials + JWT callbacks)
- [x] Shadcn UI + 16 components initialized
- [x] All dependencies installed (Phosphor Icons, Zod, RHF, Recharts, jspdf, html2canvas, dxf-writer, @anthropic-ai/sdk)
- [x] `.env.local.example` with all env vars
- [x] `next.config.ts` configured
- [x] `src/middleware.ts` → `src/proxy.ts` (Next.js 16 uses proxy.ts)

## Phase 1 — Database Schema ✅ `commit a559af4`
- [x] Prisma schema: User, Project, Room, PlumbingItem, ElectricalItem, Revision
- [x] Migration applied to Neon DB (`20260418145518_init`)
- [x] Prisma client generated
- [x] Seed script: admin@vastuplan.com / admin123
- [x] `src/lib/db.ts` (PrismaClient singleton)
- [x] `src/lib/auth.ts` (NextAuth v5 config)
- [x] `src/types/index.ts` (all shared types)
- [x] `src/app/api/auth/[...nextauth]/route.ts`

---

## Phase 2 — Parallel Build Tracks

### Track A — Authentication ✅ `commit 42433bd`
- [x] `POST /api/auth/register` (bcrypt, Prisma user create, 409 on duplicate)
- [x] `src/app/(auth)/layout.tsx` (dark blueprint centered layout)
- [x] `src/app/(auth)/login/page.tsx` (RHF + Zod + NextAuth signIn)
- [x] `src/app/(auth)/register/page.tsx` (form + auto-login after register)
- [x] `src/app/layout.tsx` updated (SessionProvider + Toaster)

### Track B — Project & Room API ✅ `commit 0f8b043`
- [x] `src/lib/vastu.ts` — 8-direction compass scoring engine, per-room 0-100
- [x] `src/lib/claude.ts` — Anthropic SDK, generateLayout + chatWithCopilot
- [x] `GET/POST /api/projects` (list + AI generate with Vastu scoring)
- [x] `GET/DELETE /api/projects/[id]`
- [x] `PUT /api/projects/[id]/rooms` (bulk update + auto Vastu rescore + revision snapshot)
- [x] `PUT /api/projects/[id]/plumbing`
- [x] `PUT /api/projects/[id]/electrical`
- [x] `GET /api/projects/[id]/cost-estimate` (BOQ, INR rates by room type)
- [x] `GET /api/projects/[id]/revisions`
- [x] `POST /api/projects/[id]/revisions/[revId]/restore`
- [x] `GET /api/projects/[id]/revisions/compare/[a]/[b]`
- [x] `POST /api/copilot`

### Track C — Dashboard UI ✅ `commit b22f468`
- [x] `src/app/(dashboard)/layout.tsx` (nav, user avatar, sign-out)
- [x] `src/app/(dashboard)/page.tsx` (project grid cards, vastu badge, empty state)
- [x] `src/components/panels/PlotInputForm.tsx` (dialog: dimensions, floors, style, facing, room picker)
- [x] `src/app/(dashboard)/project/[id]/page.tsx` (shell with toolbar, tab layout)

---

## Phase 3 — Canvas & Visualization

### Track D — Floor Plan Canvas ✅ `commit dae9339`
- [x] `src/hooks/useCanvas.ts` (drag-move + corner-handle resize, boundary clamping)
- [x] `src/components/canvas/FloorPlanCanvas.tsx` (HTML5 Canvas API, blueprint grid, compass rose)
- [x] Room rendering: type-based fill colors, Vastu score border (green/yellow/red)
- [x] Corner handles on selected room (SCALE=8)
- [x] Plumbing layer icons (pipe, tank, tap, drain, shower)
- [x] Electrical layer icons (socket, switch, light, fan, AC)
- [x] Multi-floor filtering by currentFloor

### Track E — Side Panels ✅ `commit b105620`
- [x] `src/components/panels/VastuScorePanel.tsx` (SVG score ring, per-room bars, warnings)
- [x] `src/components/panels/CostEstimate.tsx` (BOQ table, INR formatting)
- [x] `src/components/panels/AICopilot.tsx` (chat UI, 10-msg context window)
- [x] `src/components/panels/RevisionHistory.tsx` (list + restore + dual-select compare)
- [x] `src/components/panels/CompareView.tsx` (score delta, added/removed/changed rooms)

---

## Phase 4 — Export Utilities ✅ `commit 285c7ba`
- [x] `src/utils/pdfExport.ts` (3-page A3 PDF: floor plan + Vastu report + BOQ)
- [x] `src/utils/dxfExport.ts` (AutoCAD DXF: ARCHITECTURE/PLUMBING/ELECTRICAL layers, Y-flip)

---

## Phase 5 — Integration & Polish ✅ `commit c91b61b`
- [x] Project page: FloorPlanCanvas wired with debounced 800ms onRoomsChange → PUT /rooms
- [x] Project page: VastuScorePanel, CostEstimate, AICopilot, RevisionHistory in tabs
- [x] PDF export: fetches cost-estimate + calls exportToPdf
- [x] DXF export: calls exportToDxf (current floor + all layers)
- [x] onRestore re-fetches project
- [x] app/page.tsx deleted (dashboard route group handles root)
- [x] Production build passes ✅ (17 routes, 3.2s)
- [x] TypeScript: 0 errors across all files

---

## Environment Variables (for `.env.local`)

```
DATABASE_URL=<neon-postgresql-url>
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=<sk-ant-...>
```

## Dev Commands

```bash
cd nextjs
npm run dev    # localhost:3000
npm run build  # production build
```

## Tech Decisions Made

| Decision | Choice | Reason |
|----------|--------|--------|
| ORM | Prisma 7 | Best TS support, Neon-compatible |
| Auth | NextAuth v5 beta | Matches JWT pattern of original |
| Canvas | HTML5 Canvas API | Matches original, performance |
| Middleware | proxy.ts | Next.js 16 renamed from middleware.ts |
| DB client | PrismaClient + PrismaNeon | Prisma 7 dropped url in schema |
| AI model | claude-sonnet-4-5 | Same as original |
