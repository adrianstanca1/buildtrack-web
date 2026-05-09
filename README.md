# BuildTrack Web Dashboard

Modern Next.js 14 admin dashboard for the BuildTrack construction management SaaS.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework (App Router) |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | UI component primitives (Card, Button, Input) |
| TanStack Query | Server state management |
| Zustand | Client state management |
| Recharts | Charts and data visualisation |
| date-fns | Date formatting |
| lucide-react | Icons |
| Axios | HTTP client |

## Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── login/page.tsx         # Sign in
│   │   └── register/page.tsx      # Sign up
│   ├── dashboard/                  # Dashboard route group
│   │   ├── layout.tsx             # Sidebar + topbar layout
│   │   ├── page.tsx               # Overview with stats, charts, activity
│   │   ├── projects/page.tsx      # Project list
│   │   ├── projects/[id]/page.tsx # Project detail with budget chart
│   │   ├── tasks/page.tsx         # Task board/list
│   │   ├── workers/page.tsx       # Worker grid
│   │   ├── safety/page.tsx        # Incident log
│   │   ├── inspections/page.tsx   # Inspection records
│   │   ├── notifications/page.tsx # Inbox with actions
│   │   ├── settings/page.tsx      # Profile, security, preferences
│   │   └── admin/                 # Admin section
│   │       ├── users/page.tsx     # User management
│   │       ├── billing/page.tsx   # Invoice dashboard
│   │       └── stats/page.tsx     # Platform analytics
│   ├── layout.tsx                 # Root layout (Inter font, QueryProvider)
│   ├── page.tsx                   # Marketing landing page
│   └── globals.css                # Tailwind + CSS variables
├── components/
│   ├── ui/                        # shadcn-style primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── layout/
│   │   └── DashboardLayout.tsx    # Shared layout wrapper
│   ├── dashboard/                 # Dashboard-specific components
│   │   ├── StatsCards.tsx
│   │   ├── ProjectChart.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── RecentTasks.tsx
│   ├── shared/                    # Reusable data components
│   │   ├── DataTable.tsx
│   │   ├── SearchBar.tsx
│   │   └── FilterDropdown.tsx
│   └── providers/
│       └── QueryProvider.tsx
├── lib/
│   ├── api.ts                     # Axios instance with interceptors
│   └── utils.ts                   # cn, formatDate, formatCurrency
├── stores/
│   ├── authStore.ts               # Zustand auth state
│   └── themeStore.ts              # Zustand dark mode
├── types/
│   └── index.ts                   # Shared TypeScript interfaces
└── middleware.ts                  # Route protection (dashboard → login)
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with feature grid, CTA |
| `/login` | Sign in with email/password |
| `/register` | Account creation |
| `/dashboard` | Overview: stats cards, budget chart, activity feed, recent tasks |
| `/dashboard/projects` | Searchable project list with progress bars |
| `/dashboard/projects/[id]` | Project detail: stats, budget bar chart, progress, tasks |
| `/dashboard/tasks` | Task list with status filter and priority badges |
| `/dashboard/workers` | Worker grid with role badges |
| `/dashboard/safety` | Incident log with severity/status badges |
| `/dashboard/inspections` | Inspection records with pass/fail status |
| `/dashboard/notifications` | Inbox with mark-read, mark-all, delete |
| `/dashboard/settings` | Profile form, password change, dark mode toggle, logout |
| `/dashboard/admin/users` | User management table |
| `/dashboard/admin/billing` | Revenue cards + invoice table |
| `/dashboard/admin/stats` | Platform analytics with pie, bar, and line charts |

## Getting Started

```bash
cd /root/buildtrack-web
npm install
npm run dev        # Development server on http://localhost:3000
npm run build      # Production build
npm run typecheck  # TypeScript check
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Backend API base URL |

## Authentication

- JWT access token stored in `localStorage`
- Refresh token handled automatically via Axios interceptor
- `middleware.ts` redirects unauthenticated users from `/dashboard` to `/login`
- Logout clears token and redirects to login

## API Integration

The `api.ts` Axios instance handles:
- Base URL from `NEXT_PUBLIC_API_URL`
- Automatic `Authorization: Bearer` header
- 401 → refresh token flow
- 401 after refresh → redirect to login

## State Management

| Store | Purpose |
|-------|---------|
| `authStore` | User object, token, auth status (persisted) |
| `themeStore` | Dark mode toggle (persisted) |

## Key Features

1. **Responsive sidebar** with mobile overlay
2. **Admin navigation** section in sidebar
3. **Recharts integration** on dashboard and admin stats
4. **Project detail** page with budget bar chart and task list
5. **Search + filter** patterns across all list pages
6. **Notification actions** (mark read, mark all, delete)
7. **Settings page** with profile, security, preferences, logout
