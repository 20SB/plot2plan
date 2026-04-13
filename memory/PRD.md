# Vastu Blueprint - PRD

## Problem Statement
Build a full-stack web application for architects, civil engineers, and home planners that generates Vastu-compliant house plans with complete technical drawings and intelligent layout assistance.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Phosphor Icons
- **Backend**: FastAPI + Motor (MongoDB async)
- **AI**: Anthropic Claude Sonnet 4.5 via emergentintegrations
- **PDF**: jsPDF for blueprint export
- **DB**: MongoDB (projects, revisions collections)

## User Personas
- Architects designing Vastu-compliant homes
- Civil engineers needing quick layout generation
- Home planners optimizing room placements

## Core Requirements (Static)
1. Plot input (dimensions, facing, rooms, style, budget)
2. AI-powered Vastu-compliant layout generation
3. Interactive 2D floor plan with drag & resize
4. Real-time Vastu scoring and validation
5. AI Copilot for architectural assistance
6. Cost estimation and BOQ
7. PDF export with blueprint + analysis

## Implemented Features (Apr 13, 2026)
### MVP (Phase 1)
- [x] Plot input form with all parameters
- [x] AI layout generation using Claude Sonnet 4.5
- [x] 2D floor plan canvas with blueprint grid
- [x] Room drag to reposition
- [x] Vastu scoring engine (per-room + overall)
- [x] Vastu warnings and alerts
- [x] AI Copilot chat panel
- [x] Cost estimation & BOQ table
- [x] Professional architect dashboard UI

### Phase 2 Features (Apr 13, 2026)
- [x] Room resize with corner drag handles
- [x] Revision history with auto-save
- [x] Layout comparison (side-by-side diff)
- [x] Revision restore
- [x] PDF export (floor plan + Vastu report + BOQ)

## Prioritized Backlog
### P0
- Save/load multiple projects
- User authentication

### P1
- Plumbing & water pipeline plan layer
- Electrical layout layer
- Layer toggle (architecture/plumbing/electrical)
- DXF export
- Print-ready A3 sheets

### P2
- 3D elevation preview
- Client presentation mode
- Shareable approval links
- Municipality compliance checklist
- Vastu consultation report
- AI-generated interior suggestions
- Multi-floor support with staircase flow
- Annotations/comments
- Contractor handoff mode
