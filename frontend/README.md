# P2P House Design Platform - Frontend

Modern, responsive Next.js 14 frontend for the AI-powered house design platform.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Backend API running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Update .env.local with your backend API URL (if different)
```

### Running the app

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

The app will be available at: `http://localhost:3000`

## 📱 Features

### Phase 1 (Current)
- ✅ User authentication (Register/Login)
- ✅ Protected routes
- ✅ Dashboard with project overview
- ✅ Multi-step project creation form
- ✅ Project listing and detail view
- ✅ Responsive design (mobile, tablet, desktop)

### Coming Soon
- Phase 2: 2D floor plan visualization
- Phase 3: Real-time design generation status
- Phase 4: 3D renders and visualizations
- Phase 5: File downloads (PDF, DXF)

## 🏗️ Project Structure

```
src/
├── app/                      # Next.js 14 App Router
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── projects/        # Project management
│   │   │   ├── new/         # Create new project
│   │   │   └── [id]/        # Project detail
│   │   ├── layout.tsx       # Dashboard layout
│   │   └── page.tsx         # Dashboard home
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # Reusable components
│   └── ProtectedRoute.tsx   # Auth wrapper
├── lib/                     # Utilities
│   └── api.ts               # API client (Axios)
├── store/                   # State management
│   └── authStore.ts         # Auth state (Zustand)
└── types/                   # TypeScript types
    └── index.ts             # Shared types
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Form Handling**: React Hook Form (ready to integrate)
- **Routing**: Next.js App Router

## 🔐 Authentication Flow

1. User registers/logs in
2. Receives JWT token
3. Token stored in localStorage
4. Axios interceptor adds token to all requests
5. Protected routes check auth status
6. Auto-redirect on 401 responses

## 📋 Pages

### Public Routes
- `/` - Landing page
- `/login` - Sign in
- `/register` - Sign up

### Protected Routes
- `/dashboard` - Project overview and stats
- `/dashboard/projects/new` - Create new project (4-step form)
- `/dashboard/projects/[id]` - View project details

## 🎯 Form Steps (New Project)

1. **Basic Info**: Project name and description
2. **Plot Details**: Dimensions, area, facing, shape
3. **Room Requirements**: Bedrooms, bathrooms, kitchen, etc.
4. **Design Preferences**: Floors, Vastu, budget, notes

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Tailwind Colors
Primary color (blue) defined in `tailwind.config.ts`. Customize as needed.

## 📦 Dependencies

### Core
- `next` - React framework
- `react` - UI library
- `react-dom` - React DOM renderer

### State & Data
- `zustand` - State management
- `axios` - HTTP client

### Forms (ready)
- `react-hook-form` - Form validation

### Styling
- `tailwindcss` - Utility-first CSS
- `clsx` - Conditional classnames
- `tailwind-merge` - Merge Tailwind classes

## 🚦 Development Workflow

1. Start backend: `cd ../backend && npm run start:dev`
2. Start frontend: `npm run dev`
3. Open `http://localhost:3000`
4. Register a new account
5. Create a project
6. View in dashboard

## 📝 Code Style

- Use TypeScript for type safety
- Follow React hooks best practices
- Use client components (`'use client'`) for interactivity
- Prefer functional components
- Use Tailwind utility classes
- Keep components small and focused

## 🐛 Debugging

### Common Issues

**"Network Error" on API calls**
- Check backend is running on port 3001
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in backend

**Token expired / Unauthorized**
- Clear localStorage
- Log in again
- Check JWT_SECRET matches between sessions

**Build errors**
- Delete `.next` folder
- Run `npm install` again
- Check TypeScript errors

## 🔜 Next Steps (Phase 2)

- Integrate 2D floor plan generator
- Add real-time generation status
- WebSocket for live updates
- SVG/Canvas rendering for floor plans
