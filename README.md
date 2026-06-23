# Scheduler Pro — Phase 1: Foundation & Authentication

A production-ready SaaS productivity platform built with Next.js 15, TypeScript, Express.js, PostgreSQL, and Prisma.

## Tech Stack

### Frontend
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** — utility-first styling
- **React Hook Form** + **Zod** — form validation
- **Zustand** — client state management
- **Axios** — HTTP client with auto token refresh

### Backend
- **Express.js** + **TypeScript**
- **PostgreSQL** + **Prisma ORM**
- **JWT** (access + refresh token strategy)
- **bcryptjs** — password hashing
- **Helmet**, **CORS**, **express-rate-limit** — security

---

## Project Structure

```
scheduler-saas/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB schema (User, Task, Event, Session)
│   └── src/
│       ├── controllers/
│       │   └── auth.controller.ts  # Register, login, logout, refresh, me
│       ├── middleware/
│       │   ├── auth.ts             # JWT authenticate + authorize guards
│       │   ├── errorHandler.ts     # Global error handler
│       │   └── validate.ts         # express-validator chains
│       ├── routes/
│       │   └── auth.routes.ts
│       ├── utils/
│       │   ├── jwt.ts              # Token generation & verification
│       │   ├── prisma.ts           # Prisma singleton
│       │   └── response.ts         # Typed API response helpers
│       ├── types/index.ts
│       ├── app.ts                  # Express app setup
│       └── index.ts                # Server entry point
│
└── frontend/
    └── src/
        ├── app/
        │   ├── auth/
        │   │   ├── layout.tsx       # Split-panel auth layout
        │   │   ├── login/page.tsx   # Login form
        │   │   └── register/page.tsx # Register + password strength
        │   └── dashboard/
        │       ├── layout.tsx
        │       ├── page.tsx         # Overview with stats, tasks, schedule
        │       ├── tasks/page.tsx
        │       └── settings/page.tsx
        ├── components/
        │   └── layout/
        │       └── DashboardShell.tsx # Sidebar + topbar shell
        ├── hooks/
        │   └── useAuth.ts           # useRequireAuth, useRedirectIfAuth
        ├── lib/
        │   ├── api.ts               # Axios instance + interceptors + auto-refresh
        │   ├── authService.ts       # Auth API calls
        │   ├── store.ts             # Zustand auth store
        │   ├── utils.ts             # cn(), formatDate(), getInitials()
        │   └── validations.ts       # Zod schemas
        └── types/index.ts
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or connection string to remote DB)

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment variables

**Backend** — copy and fill in `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
```env
DATABASE_URL="postgresql://user:password@localhost:5432/scheduler_db"
JWT_ACCESS_SECRET="your-random-64-char-secret"
JWT_REFRESH_SECRET="your-other-random-64-char-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:3000"
BCRYPT_SALT_ROUNDS=12
```

**Frontend** — copy and fill in `frontend/.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Set up the database
```bash
# Push schema to DB and generate Prisma client
npm run db:generate
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Run in development
```bash
npm run dev
# Backend → http://localhost:5000
# Frontend → http://localhost:3000
```

---

## API Endpoints

### Auth (rate limited: 10 req/15 min)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Sign in |
| POST | `/api/auth/refresh` | ❌ | Refresh tokens |
| POST | `/api/auth/logout` | ✅ | Sign out |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/health` | ❌ | Health check |

### Request/Response format

**Register**
```json
POST /api/auth/register
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "Secure@123",
  "confirmPassword": "Secure@123"
}
```

**Success Response (201)**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "id": "uuid", "name": "Alex Johnson", "email": "...", "role": "USER" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

## Authentication Architecture

```
Client                    Backend
  │                          │
  ├── POST /login ──────────►│ Verify credentials
  │◄── { accessToken (15m),  │ Hash check (bcrypt)
  │      refreshToken (7d) }─┤ Create UserSession
  │                          │
  ├── GET /me ──────────────►│ Verify JWT (access)
  │   Authorization: Bearer  │
  │                          │
  ├── [Token expires]        │
  ├── POST /refresh ────────►│ Verify refresh JWT
  │◄── { new tokens } ───────┤ Rotate session
  │                          │
  └── POST /logout ─────────►│ Delete UserSession
                             │ Clear refreshToken
```

### Security features
- **Dual-token strategy**: Short-lived access tokens (15m) + long-lived refresh tokens (7d)
- **Token rotation**: Refresh tokens are rotated on every use
- **Session table**: Server-side invalidation via `UserSession`
- **Bcrypt hashing**: 12 salt rounds for passwords
- **Rate limiting**: 10 auth requests per 15 minutes
- **Helmet**: Security headers on all responses
- **CORS**: Restricted to configured client origin

---

## Roadmap (upcoming phases)

- **Phase 2**: Task CRUD, drag-and-drop board, priority management
- **Phase 3**: Calendar with recurring events and iCal sync
- **Phase 4**: Productivity analytics and charts
- **Phase 5**: Team workspaces and collaboration
- **Phase 6**: Notifications (email + in-app)
