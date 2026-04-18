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

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

## Commands

### Frontend

```bash
cd frontend
yarn start          # Dev server at localhost:3000
yarn build          # Production build
yarn test           # Jest (watch mode)
yarn test --watchAll=false  # Run tests once
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Tests

```bash
# Backend API test suite (run from repo root)
python backend_test.py

# Backend linting/formatting
black backend/
isort backend/
flake8 backend/
mypy backend/
```

## Architecture

**plot2plan** is a Vastu-compliant floor plan generator for architects. Users submit plot dimensions and room requirements; Claude Sonnet AI generates a spatial layout with Vastu scoring, which is then rendered on an interactive 2D canvas.

### Stack

- **Frontend**: React 19 + Craco (CRA), Tailwind CSS, Shadcn UI, React Router v7
- **Backend**: FastAPI + Uvicorn, Motor (async MongoDB), Pydantic v2
- **AI**: Anthropic Claude Sonnet 4.5 via `emergentintegrations` SDK
- **Auth**: JWT (httponly cookies + localStorage fallback), bcrypt
- **Exports**: jsPDF + html2canvas (PDF), dxf-writer (AutoCAD DXF)

### Request Flow

1. User submits `PlotInputForm` → `POST /api/projects/generate`
2. FastAPI builds a structured prompt → Claude Sonnet 4.5 returns JSON array of `Room` objects
3. Rooms are stored in MongoDB, returned to frontend
4. `FloorPlanCanvas` renders rooms with drag/resize handles; changes auto-save via `PUT /api/projects/{id}/rooms`
5. Vastu score recalculated server-side from room positions relative to plot center (8-direction compass model)

### Key Files

| File | Role |
|------|------|
| `backend/server.py` | Entire FastAPI app (~33KB): auth, project CRUD, AI generation, Vastu engine |
| `frontend/src/pages/Dashboard.js` | App shell; orchestrates all tabs, lifts state |
| `frontend/src/components/FloorPlanCanvas.js` | 2D canvas: rendering, drag/resize, multi-floor filtering |
| `frontend/src/contexts/AuthContext.js` | JWT token state and refresh logic |
| `frontend/src/utils/pdfExport.js` | PDF generation pipeline |
| `frontend/src/utils/dxfExport.js` | AutoCAD DXF export |
| `backend_test.py` | `VastuBlueprintAPITester` integration test suite |

### Data Models

- **Project**: plot dimensions, num_floors, style, rooms[], plumbing[], electrical[], vastu_score
- **Room**: id, name, type, x/y/width/height (pixel units), floor (int), direction, vastu_score, warnings[]
- **Revision**: project_id, version, rooms[], label, timestamp

### Multi-Floor

Each room carries a `floor: int` field (1–N). The canvas filters by `currentFloor` state. Staircases must exist on every floor at the same coordinates — the AI prompt enforces this constraint.

### Canvas Rendering

`FloorPlanCanvas` uses a `SCALE=8` factor (pixels per unit). Drag vs. resize is distinguished by corner handle hit detection. All mutations go through `useCallback` handlers and immediately `PUT` to the backend.

### Vastu Scoring

Room center is compared to plot center to determine compass direction (8 zones). Each room type has a preferred direction; deviation reduces the 0–100 score. Overall project score is the average of all room scores.

### AI Copilot

`POST /api/copilot` accepts a chat message + current project state and returns suggestions. Uses the same emergentintegrations SDK with conversation history.

### Revision History

Every room update optionally snapshots the project as a Revision. `GET .../revisions/compare/{a}/{b}` returns a diff of room positions and scores for side-by-side view in `CompareView.js`.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Token signing key |
| `EMERGENT_LLM_KEY` | Anthropic/Claude API key |
| `REACT_APP_BACKEND_URL` | Frontend → backend base URL |
| `ENABLE_HEALTH_CHECK` | Toggles Emergent platform health plugin |

## Emergent Platform

`.emergent/emergent.yml` configures the Docker image used by the Emergent hosting platform. The frontend Webpack config (`craco.config.js`) loads a health-check plugin when `ENABLE_HEALTH_CHECK=true`. This is platform-specific and not needed for local development.
