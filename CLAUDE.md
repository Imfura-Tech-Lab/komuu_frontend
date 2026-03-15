# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AFSA (African Forensic Science Association) Membership Portal - a Next.js 15 frontend application for managing member applications, certificates, payments, events, and community features. The app supports multiple user roles (Administrator, President, Board, Member, Pending) with role-based access control.

## Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking only
```

## Architecture

### Tech Stack
- Next.js 15 with App Router (React 19)
- TypeScript with strict mode
- Tailwind CSS v4 with shadcn/ui (new-york style)
- next-themes for dark mode

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                 # Base UI components (shadcn)
│   ├── admin/              # Admin-specific components and modals
│   ├── dashboard/          # Dashboard layout and widgets
│   ├── applications/       # Application management components
│   └── [feature]/          # Feature-specific components
├── lib/
│   ├── api-client.ts       # API client with auth token management
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── config/             # Navigation and app config
├── services/               # API service classes (auth, membership, PDF)
└── types/                  # TypeScript types and role permissions
```

### Key Patterns

**Authentication Flow:**
- Token stored in localStorage (`auth_token`, `user_data`)
- `ApiClient` class handles bearer token injection (`src/lib/api-client.ts`)
- `AuthService` manages login/logout (`src/services/auth-service.ts`)
- `useAuth` hook for component-level auth state (`src/lib/hooks/Use-auth.ts`)

**Page Layout Pattern:**
```tsx
// All authenticated pages wrap content in SecureDashboardLayout
<SecureDashboardLayout requiredRoles={['Administrator']} requiredPermissions={['manage_users']}>
  {/* page content */}
</SecureDashboardLayout>
```

**Role-Based Access Control:**
- Roles defined in `src/types/index.ts`: Administrator, President, Board, Member, Pending
- `ROLE_PERMISSIONS` object maps roles to permission arrays
- `RoleGuard` component for conditional rendering based on permissions
- `useRoleAccess` hook for programmatic permission checks

**Data Fetching Pattern:**
- Custom hooks in `src/lib/hooks/` (e.g., `useDashboardData`, `useApplications`)
- Hooks use `useApi` from api-client for state management
- Return `{ data, loading, error, refetch }` pattern

### API Configuration

Backend URL configured via `NEXT_PUBLIC_BACKEND_API_URL` environment variable. The ApiClient automatically handles:
- Bearer token injection
- Request timeout (15s default)
- Retry logic for failed requests
- CORS for external APIs

### Styling Conventions

- Primary brand color: `#00B5A5` (teal)
- Uses Tailwind CSS with dark mode support (`dark:` prefix)
- shadcn/ui components via `@/components/ui`
- Import path alias: `@/*` maps to `./src/*`

## Git Rules

When making commits:
- Never add Co-authored-by trailer
- Never mention Claude, AI, or assistant in commit messages
- Commit messages must appear written by the developer only
