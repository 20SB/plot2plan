# Vastu Blueprint - PRD

## Problem Statement
Full-stack web application for architects generating Vastu-compliant house plans with AI layout assistance.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Phosphor Icons + jsPDF + dxf-writer
- **Backend**: FastAPI + Motor (MongoDB async) + JWT Auth + bcrypt
- **AI**: Anthropic Claude Sonnet 4.5 via emergentintegrations
- **DB**: MongoDB (users, projects, revisions collections)

## Implemented Features (Apr 14, 2026)
### Phase 1 (MVP)
- [x] AI layout generation using Claude Sonnet 4.5
- [x] 2D floor plan canvas with blueprint grid
- [x] Room drag & resize with corner handles
- [x] Vastu scoring engine (per-room + overall)
- [x] AI Copilot chat panel
- [x] Cost estimation & BOQ table

### Phase 2
- [x] Room resize with corner handles
- [x] Revision history with auto-save
- [x] Layout comparison
- [x] PDF export (floor plan + Vastu report + BOQ)

### Phase 3 (Current)
- [x] JWT Authentication (login/register/logout)
- [x] Save/load multiple projects per user
- [x] Project management (CRUD)
- [x] Plumbing layer (pipes, tanks, taps, drains, showers - editable)
- [x] Electrical layer (sockets, switches, lights, fans, AC - editable)
- [x] Layer toggle (ARCH/PLMB/ELEC)
- [x] DXF export (AutoCAD compatible)
- [x] Print-ready A3 sheets

## Credentials
- Admin: admin@vastuplan.com / admin123

## Backlog
### P0
- Multi-floor support with staircase flow
- Client presentation mode

### P1
- Shareable approval links
- Municipality compliance checklist
- Vastu consultation report

### P2
- 3D elevation preview
- AI-generated interior suggestions
- Annotations/comments
- Contractor handoff mode
