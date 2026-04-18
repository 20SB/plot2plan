# plot2plan — Next.js Rewrite TODO

Exact same features, new tech stack:
- **Next.js 15** (App Router, TypeScript)
- **Neon DB** (PostgreSQL) + **Prisma ORM**
- **NextAuth.js v5** (credentials provider)
- **Shadcn UI** + **Tailwind CSS**
- **Anthropic SDK** (`@anthropic-ai/sdk`)
- **jsPDF + html2canvas + dxf-writer** (export)

---

## Phase 0 — Project Bootstrap `[SEQUENTIAL]`
> Must complete before anything else. Single agent.

- [ ] `npx create-next-app@latest` with TypeScript, Tailwind, App Router, src/ dir
- [ ] Install Prisma + Neon adapter (`@prisma/client`, `@neondatabase/serverless`, `prisma-adapter-neon`)
- [ ] Install NextAuth.js v5 (`next-auth@beta`) + configure `auth.ts`
- [ ] Install Shadcn UI + initialize with project config
- [ ] Install all component dependencies (Phosphor Icons, Zod, React Hook Form, Axios, Recharts)
- [ ] Install export libs: `jspdf`, `html2canvas`, `dxf-writer`
- [ ] Install `@anthropic-ai/sdk`
- [ ] Create `.env.local.example` with all required env vars
- [ ] Configure `next.config.ts` (image domains, env vars exposure)
- [ ] Set up path aliases (`@/` → `src/`)
- [ ] Create `middleware.ts` for protected route guards

**Output:** Working `npm run dev` with blank Next.js app. Commit + push.

---

## Phase 1 — Database Schema `[SEQUENTIAL]`
> Depends on Phase 0. Defines the contract for all other tracks.

- [ ] Design `prisma/schema.prisma`:
  ```
  User        (id, name, email, passwordHash, role, createdAt)
  Project     (id, userId, title, plotWidth, plotHeight, plotUnit, numFloors,
                style, facing, vastuScore, createdAt, updatedAt)
  Room        (id, projectId, name, type, x, y, width, height, floor,
                direction, vastuScore, warnings String[])
  PlumbingItem(id, projectId, type, x, y, floor, label)
  ElectricalItem(id, projectId, type, x, y, floor, label)
  Revision    (id, projectId, version, label, roomsSnapshot Json, createdAt)
  ```
- [ ] Run `prisma migrate dev --name init` against Neon DB
- [ ] Generate Prisma client
- [ ] Create `src/lib/db.ts` (PrismaClient singleton — safe for Next.js dev HMR)
- [ ] Create seed script (`prisma/seed.ts`) — admin user `admin@vastuplan.com / admin123`

**Output:** DB schema live on Neon, Prisma client generated. Commit + push.

---

## Phase 2 — Parallel Build Tracks
> All tracks start after Phase 1 completes. Run in parallel.

---

### Track A — Authentication `[PARALLEL]`
**Agent: auth-agent**

- [ ] `src/lib/auth.ts` — NextAuth v5 config with credentials provider (bcrypt verify)
- [ ] `src/app/api/auth/[...nextauth]/route.ts`
- [ ] `POST /api/auth/register` route (hash password, create user, return session)
- [ ] `src/app/(auth)/login/page.tsx` — login form (React Hook Form + Zod)
- [ ] `src/app/(auth)/register/page.tsx` — register form
- [ ] `src/app/(auth)/layout.tsx` — centered card layout
- [ ] Session hooks: `useSession()` wrapper + `getServerSession()` helper
- [ ] Redirect unauthenticated users to `/login` via middleware

**Output:** Register + login flow working end-to-end. Commit + push.

---

### Track B — Project & Room API `[PARALLEL]`
**Agent: api-agent**

- [ ] `src/types/index.ts` — shared TypeScript interfaces (Room, Project, PlumbingItem, ElectricalItem, Revision, CostEstimate)
- [ ] `src/lib/vastu.ts` — Vastu scoring engine (port Python logic: 8-direction compass, per-room score 0–100, warnings)
- [ ] `src/lib/claude.ts` — Anthropic SDK client + `generateLayout()` function (prompt engineering, JSON parse, fallback layout)
- [ ] `GET  /api/projects` — list user's projects
- [ ] `POST /api/projects/generate` — call Claude, persist rooms, return project
- [ ] `GET  /api/projects/[id]` — fetch project with all rooms/items
- [ ] `DELETE /api/projects/[id]` — delete project + cascade
- [ ] `PUT  /api/projects/[id]/rooms` — bulk update rooms, recalculate Vastu score, auto-snapshot revision
- [ ] `PUT  /api/projects/[id]/plumbing` — update plumbing items
- [ ] `PUT  /api/projects/[id]/electrical` — update electrical items
- [ ] `GET  /api/projects/[id]/cost-estimate` — calculate BOQ (area-based rates by room type)
- [ ] `POST /api/copilot` — Claude chat with project context
- [ ] `GET  /api/projects/[id]/revisions` — list revisions
- [ ] `POST /api/projects/[id]/revisions/[revId]/restore` — restore room snapshot
- [ ] `GET  /api/projects/[id]/revisions/compare/[a]/[b]` — diff two revisions

**Output:** All API routes functional (testable via curl/Postman). Commit + push.

---

### Track C — Dashboard & Project List UI `[PARALLEL]`
**Agent: dashboard-agent**

- [ ] `src/app/(dashboard)/layout.tsx` — nav bar (logo, user menu, logout)
- [ ] `src/app/(dashboard)/page.tsx` — project list grid (cards with title, date, Vastu score badge)
- [ ] Create project modal — `PlotInputForm` (React Hook Form + Zod validation):
  - Plot width/height, unit (ft/m), num floors, facing direction, architectural style, room checklist
- [ ] Project card actions: open, delete (confirm dialog)
- [ ] Loading skeletons for project list
- [ ] `src/app/(dashboard)/project/[id]/page.tsx` — project detail shell with tab layout

**Output:** Dashboard renders project list, create form submits to API. Commit + push.

---

## Phase 3 — Canvas & Visualization
> Start after Track B types are defined (can overlap with Track B implementation).

---

### Track D — Floor Plan Canvas `[PARALLEL]`
**Agent: canvas-agent**

- [ ] `src/hooks/useCanvas.ts` — encapsulate drag/resize logic (move vs corner handle detection, SCALE=8)
- [ ] `src/components/canvas/FloorPlanCanvas.tsx`:
  - Blueprint grid background
  - Room rectangles with labels
  - Drag-to-move handler
  - Corner handle resize handler
  - Multi-floor filtering by `currentFloor`
  - Vastu color coding (green/yellow/red by score)
  - Room selection + info tooltip
- [ ] `src/components/canvas/PlumbingLayer.tsx` — overlay: pipes, tanks, taps, drains, showers (editable positions)
- [ ] `src/components/canvas/ElectricalLayer.tsx` — overlay: sockets, switches, lights, fans, AC units (editable positions)
- [ ] `src/components/layout/LayerToggle.tsx` — ARCH / PLMB / ELEC toggle buttons
- [ ] `src/components/layout/FloorSelector.tsx` — floor navigation (1 to N floors)
- [ ] Auto-save on room drop: debounced `PUT /api/projects/[id]/rooms`

**Output:** Canvas renders rooms, drag/resize works, layers toggle, floor switching works. Commit + push.

---

### Track E — Side Panels `[PARALLEL]`
**Agent: panels-agent**

- [ ] `src/components/panels/VastuScorePanel.tsx`:
  - Overall score ring/gauge (Recharts RadialBar)
  - Per-room score list with direction badges
  - Warnings list with severity icons (Phosphor)
- [ ] `src/components/panels/CostEstimate.tsx`:
  - BOQ table (room, area, rate, subtotal)
  - Total cost with currency
  - Export to PDF button trigger
- [ ] `src/components/panels/AICopilot.tsx`:
  - Chat message thread
  - Input + send (POST /api/copilot)
  - Streaming-friendly design (show typing indicator)
- [ ] `src/components/panels/RevisionHistory.tsx`:
  - Revision list (version, label, timestamp)
  - Restore button (with confirm)
  - Compare button (opens CompareView)
- [ ] `src/components/panels/CompareView.tsx`:
  - Side-by-side canvas snapshots
  - Diff table (rooms added/moved/removed)
  - Score delta indicator

**Output:** All side panels render correctly with mock data, then wired to real API. Commit + push.

---

## Phase 4 — Export Utilities `[PARALLEL with Phase 3]`
**Agent: export-agent**

- [ ] `src/utils/pdfExport.ts`:
  - Capture canvas with html2canvas
  - Build jsPDF doc: floor plan image + Vastu report table + BOQ table
  - A3 size (840×1188mm), landscape
  - Per-floor pages for multi-floor projects
- [ ] `src/utils/dxfExport.ts`:
  - Map rooms to DXF polylines (dxf-writer)
  - Separate layers: ARCHITECTURE, PLUMBING, ELECTRICAL
  - Include room labels as DXF TEXT entities
- [ ] Export buttons wired into project toolbar

**Output:** PDF and DXF download working from UI. Commit + push.

---

## Phase 5 — Integration & Polish `[SEQUENTIAL]`
> Final wiring pass. All tracks must be complete.

- [ ] Wire canvas mutations → auto-save → revision snapshot
- [ ] Wire project page tabs: ARCH/PLMB/ELEC + side panel tabs
- [ ] Error boundaries + toast notifications (sonner)
- [ ] Loading states + optimistic UI for room moves
- [ ] Responsive layout (canvas + panel side-by-side on desktop, stacked on mobile)
- [ ] Empty states (no projects, no rooms)
- [ ] 404 and error pages
- [ ] Final end-to-end manual test: register → create project → drag rooms → export PDF → export DXF → compare revisions

**Output:** Fully functional app. Final commit + push.

---

## Environment Variables

```env
# .env.local
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/plot2plan?sslmode=require
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Git Strategy

- Branch: `nextjs-rewrite`
- Commit after each Phase/Track completes
- Push after each commit
- PR to `main` after Phase 5

---

## Dependency Map

```
Phase 0 → Phase 1 → Phase 2 (A + B + C in parallel)
                          ↓
                    Phase 3 (D + E in parallel, needs B types)
                    Phase 4 (parallel with Phase 3)
                          ↓
                    Phase 5 (integration, sequential)
```

---

## Agent Assignment

| Agent | Tracks | Depends On |
|-------|--------|------------|
| bootstrap-agent | Phase 0 + Phase 1 | — |
| auth-agent | Track A | Phase 1 done |
| api-agent | Track B | Phase 1 done |
| dashboard-agent | Track C | Phase 1 done |
| canvas-agent | Track D | Track B types |
| panels-agent | Track E | Track B types |
| export-agent | Phase 4 | Phase 3 canvas |
| integration-agent | Phase 5 | All above |
