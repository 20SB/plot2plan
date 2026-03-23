# 🏠 AI-Powered House Design Platform - plot2plan

Production-grade, scalable web application that generates professional architectural drawings using AI.

**Status**: ✅ Phase 1 Complete (Foundation MVP)

---

## 🎯 Project Vision

Transform how people design homes by providing:
- 2D Floor Plans (Naksha)
- 3D Elevations
- Structural Designs
- Electrical & Plumbing Drawings
- Interior Design Suggestions
- Complete construction-ready documentation

**In minutes, not months.**

---

## 📦 Current Features (Phase 1)

✅ **User Authentication**
- JWT-based secure login/register
- Protected routes
- Session management

✅ **Project Management**
- Create projects with detailed inputs
- Multi-step form (plot, rooms, preferences)
- Save and retrieve projects
- Dashboard with stats

✅ **Input Collection**
- Plot size and dimensions
- Room requirements (bedrooms, bathrooms, etc.)
- Design preferences (Vastu, budget, floors)
- Special requirements

✅ **Clean Architecture**
- Modular backend (NestJS)
- Modern frontend (Next.js 14)
- Type-safe (TypeScript)
- MongoDB database
- RESTful APIs

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | NestJS, Node.js, TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT (Passport) |
| State | Zustand |
| HTTP | Axios |
| Styling | Tailwind CSS |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Navigate to project
cd house-design-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/house-design-platform
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRATION=7d
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 3. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```
Backend runs on: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

### 4. Test It Out

1. Open `http://localhost:3000`
2. Click "Get Started" → Register
3. Fill in your details
4. Create a new project
5. View in dashboard

---

## 📁 Project Structure

```
house-design-platform/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # Users module
│   │   ├── projects/       # Projects module
│   │   ├── common/         # Shared utilities
│   │   ├── app.module.ts   # Root module
│   │   └── main.ts         # Entry point
│   ├── .env                # Environment config
│   └── package.json
│
├── frontend/               # Next.js 14 App
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   │   ├── dashboard/ # Protected routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── page.tsx   # Landing page
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # API client
│   │   ├── store/         # State management
│   │   └── types/         # TypeScript types
│   ├── .env.local         # Environment config
│   └── package.json
│
├── docs/                  # Documentation
│   └── PHASE_1_PLAN.md   # Phase 1 details
│
└── README.md             # This file
```

---

## 🗄️ Database Schema

### Users Collection
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'user' | 'admin'
  isActive: boolean
  phone?: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Projects Collection
```typescript
{
  userId: ObjectId (ref: User)
  name: string
  description?: string
  
  plotDetails: {
    length: number
    width: number
    area: number
    facingDirection?: string
    shape?: string
  }
  
  roomRequirements: {
    bedrooms: number
    bathrooms: number
    kitchen: number
    livingRoom: number
    diningRoom: number
    studyRoom: number
    poojaRoom: number
    balconies: number
    parking: number
    storeRoom: number
    others?: Map<string, number>
  }
  
  designPreferences?: {
    styles?: string[]
    vastuCompliant: boolean
    budgetMin?: number
    budgetMax?: number
    specialRequirements?: string[]
    floorCount?: number
    notes?: string
  }
  
  status: 'draft' | 'processing' | 'completed' | 'failed'
  generatedOutputs?: {...}
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔐 API Endpoints

### Authentication
```
POST   /api/v1/auth/register    Register new user
POST   /api/v1/auth/login       Login user
```

### Users
```
GET    /api/v1/users/profile    Get current user (protected)
```

### Projects
```
POST   /api/v1/projects         Create project (protected)
GET    /api/v1/projects         List all projects (protected)
GET    /api/v1/projects/:id     Get project by ID (protected)
PATCH  /api/v1/projects/:id     Update project (protected)
DELETE /api/v1/projects/:id     Delete project (protected)
GET    /api/v1/projects/stats   Get statistics (protected)
```

---

## 🪜 Development Phases

### ✅ Phase 1: Foundation (COMPLETE)
- User authentication
- Project CRUD
- Input form
- Dashboard
- Clean architecture

### 🔄 Phase 2: 2D Floor Plan Generator (NEXT)
- Rule-based layout engine
- Predefined templates
- Dynamic scaling
- SVG/Canvas rendering

### 📋 Phase 3: Async Processing
- Redis + BullMQ
- Background jobs
- Status tracking
- Queue management

### 📋 Phase 4: 3D Visualization
- Three.js integration
- 3D floor plans
- Elevation rendering
- 2D → 3D transformation

### 📋 Phase 5: File Export
- PDF generation
- DXF export
- S3 storage
- Download system

### 📋 Phase 6: Advanced Drawings
- Electrical layouts
- Plumbing diagrams
- Door/window details
- Drainage planning

### 📋 Phase 7: AI Enhancements
- Interior design suggestions
- AI-generated visuals
- Cost estimation
- Smart recommendations

### 📋 Phase 8: Production Ready
- Payment integration
- Rate limiting
- Monitoring & logging
- Error handling
- AWS deployment

---

## 🧪 Testing

### Backend
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend
```bash
cd frontend
npm run lint
```

---

## 🔧 Development Guidelines

### Code Style
- Use TypeScript everywhere
- Follow ESLint rules
- Write meaningful commit messages
- Keep functions small and focused
- Document complex logic

### Git Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push and create PR
4. Review and merge

### Architecture Principles
- **Single Responsibility**: Each module does one thing
- **DRY**: Don't repeat yourself
- **KISS**: Keep it simple
- **Separation of Concerns**: UI ≠ Business Logic ≠ Data
- **API First**: Backend independent of frontend

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
```

### Port Already in Use
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### CORS Errors
- Check `CORS_ORIGINS` in backend `.env`
- Ensure frontend URL matches exactly

### JWT Token Issues
- Clear browser localStorage
- Check `JWT_SECRET` consistency
- Verify token expiration time

---

## 📈 Performance Considerations

### Current (Phase 1)
- Simple REST APIs
- Direct MongoDB queries
- JWT for auth
- Client-side state management

### Future Optimizations
- Redis caching
- Database indexing
- CDN for static files
- Image optimization
- Lazy loading
- Code splitting

---

## 🚢 Deployment (Future)

### Backend
- AWS EC2 / ECS / Lambda
- MongoDB Atlas
- Redis Cloud
- S3 for file storage

### Frontend
- Vercel (recommended)
- AWS Amplify
- Netlify

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit PR

---

## 📄 License

[Add your license here]

---

## 🙏 Credits

Built with ❤️ for architects, homeowners, and designers.

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check documentation in `/docs`
- Review backend README: `backend/README.md`
- Review frontend README: `frontend/README.md`

---

## 🎉 Next Steps

**You've completed Phase 1!**

Ready to move forward?
1. Test the current system thoroughly
2. Review the code structure
3. Understand the data flow
4. Plan Phase 2 implementation

**When ready, say:**  
"Start Phase 2 - 2D Floor Plan Generator"
