# House Design Platform - Backend API

Production-grade NestJS backend for AI-powered house design platform.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
```

### Running the app

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3001/api/v1`

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Users
- `GET /api/v1/users/profile` - Get current user profile (protected)

### Projects
- `POST /api/v1/projects` - Create new project (protected)
- `GET /api/v1/projects` - Get all projects (protected)
- `GET /api/v1/projects/:id` - Get project by ID (protected)
- `PATCH /api/v1/projects/:id` - Update project (protected)
- `DELETE /api/v1/projects/:id` - Delete project (protected)
- `GET /api/v1/projects/stats` - Get project statistics (protected)

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # JWT guards
│   ├── strategies/      # Passport strategies
│   └── auth.module.ts
├── users/               # Users module
│   ├── schemas/         # MongoDB schemas
│   └── users.module.ts
├── projects/            # Projects module
│   ├── dto/
│   ├── schemas/
│   └── projects.module.ts
├── common/              # Shared utilities
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── filters/
├── config/              # Configuration
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (Passport)
- **Validation**: class-validator
- **Language**: TypeScript
