# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

## Commands

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npx tsc --noEmit # TypeScript check
npx prisma studio # DB browser UI
```

## Architecture

**plot2plan** is a Vastu-compliant floor plan generator for architects. Users submit plot dimensions and room requirements; Claude Sonnet AI generates a spatial layout with Vastu scoring, rendered on an interactive 2D canvas.

### Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Neon DB** (PostgreSQL) + **Prisma 7 ORM**
- **NextAuth.js v5** (credentials provider, JWT)
- **Shadcn UI** + Phosphor Icons + Recharts
- **Anthropic SDK** (`@anthropic-ai/sdk`, claude-sonnet-4-5)
- **jsPDF + html2canvas + dxf-writer** (export)

### Key Files

| File | Role |
|------|------|
| `src/lib/db.ts` | Prisma singleton (safe for Next.js HMR) |
| `src/lib/auth.ts` | NextAuth v5 config (credentials + JWT callbacks) |
| `src/lib/claude.ts` | Anthropic SDK — `generateLayout()` + `chatWithCopilot()` |
| `src/lib/vastu.ts` | Vastu scoring engine (8-direction compass, 0–100 per room) |
| `src/app/api/projects/route.ts` | GET list + POST generate (calls Claude → scores → persists) |
| `src/app/api/projects/[id]/rooms/route.ts` | PUT rooms (rescores Vastu + auto-snapshots revision) |
| `src/app/(dashboard)/project/[id]/page.tsx` | Project detail shell (canvas + 4 side panels) |
| `src/components/canvas/FloorPlanCanvas.tsx` | HTML5 Canvas API — blueprint grid, drag/resize, layers |
| `src/hooks/useCanvas.ts` | Drag-to-move + corner-handle resize state logic |
| `prisma/schema.prisma` | DB schema: User, Project, Room, PlumbingItem, ElectricalItem, Revision |

### Request Flow

1. User submits `PlotInputForm` → `POST /api/projects/generate`
2. FastAPI builds structured prompt → Claude Sonnet 4-5 returns JSON array of `Room` objects
3. Rooms scored by Vastu engine, stored in Neon DB via Prisma
4. `FloorPlanCanvas` renders rooms (SCALE=8 px/unit); drag/resize auto-saves via debounced `PUT /api/projects/[id]/rooms`
5. Room update triggers Vastu rescore + revision snapshot

### Data Models

- **Project**: plotWidth/Height, plotUnit, numFloors, style, facing, vastuScore, rooms[], plumbing[], electrical[], revisions[]
- **Room**: name, type, x/y/width/height (plot units), floor, direction, vastuScore, warnings[]
- **Revision**: version, label, roomsSnapshot (JSON), createdAt

### Canvas Rendering

`FloorPlanCanvas` draws everything on a single `<canvas>` element. `SCALE=8` maps plot units → pixels. Drag vs resize is detected by hit-testing 10px corner handles. Layers (ARCH/PLMB/ELEC) filter what gets drawn each frame.

### Vastu Scoring

Room center relative to plot center → compass angle → one of 8 directions (N/NE/E/SE/S/SW/W/NW). Each room type has ideal directions; score = 100 for ideal, −20 per 45° sector away. Overall score = average across all rooms.

### API Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create user (bcrypt) |
| GET/POST | `/api/projects` | List / AI-generate project |
| GET/DELETE | `/api/projects/[id]` | Fetch or delete project |
| PUT | `/api/projects/[id]/rooms` | Update rooms + rescore + snapshot |
| PUT | `/api/projects/[id]/plumbing` | Update plumbing items |
| PUT | `/api/projects/[id]/electrical` | Update electrical items |
| GET | `/api/projects/[id]/cost-estimate` | BOQ with INR rates |
| POST | `/api/copilot` | Claude chat with project context |
| GET | `/api/projects/[id]/revisions` | List revision history |
| POST | `/api/projects/[id]/revisions/[revId]/restore` | Restore a revision |
| GET | `/api/projects/[id]/revisions/compare/[a]/[b]` | Diff two revisions |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Token signing key |
| `NEXTAUTH_URL` | App base URL (e.g. `http://localhost:3000`) |
| `ANTHROPIC_API_KEY` | Claude API key |

## Important Next.js 16 / Prisma 7 quirks

- **Middleware**: uses `src/proxy.ts` (Next.js 16 renamed from `middleware.ts`)
- **Prisma 7**: DB connection configured in `prisma.config.ts`, not `schema.prisma`
- **Route params**: `params` is a `Promise` in Next.js 16 — always `await params`
- **Zod v4**: use `.issues` not `.errors` on `ZodError`
