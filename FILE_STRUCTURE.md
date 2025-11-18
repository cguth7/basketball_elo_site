# Basketball ELO Tracker - File Structure

Complete file structure for the authentication implementation.

## Project Root

```
basketball_elo_site/
├── app/
│   ├── (app)/                          # Protected routes group
│   │   ├── layout.tsx                  # Protected layout with navigation bar
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Main dashboard (stats, recent games)
│   │   ├── games/
│   │   │   └── page.tsx               # Games list and recording
│   │   └── leaderboard/
│   │       └── page.tsx               # Player rankings
│   ├── (auth)/                         # Auth routes group  
│   │   └── login/
│   │       └── page.tsx               # Login page with Google OAuth
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts               # OAuth callback handler
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # Homepage (public)
│   └── globals.css                     # Global styles
│
├── lib/
│   ├── auth/
│   │   ├── actions.ts                  # Server Actions (signIn, signOut)
│   │   └── helpers.ts                  # Auth helpers (getUser, getSession)
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   ├── server.ts                   # Server Supabase client
│   │   └── middleware.ts               # Middleware Supabase client
│   ├── elo/                            # ELO calculation (existing)
│   └── utils.ts                        # Utility functions
│
├── components/                         # Reusable UI components (existing)
│
├── middleware.ts                       # Route protection & token refresh
│
├── .env.example                        # Environment variable template
├── .env.local                          # Your environment variables (create this)
│
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── tailwind.config.ts                  # Tailwind config
│
├── README_AUTH.md                      # Quick start guide
├── AUTH_SETUP.md                       # Detailed setup guide
├── AUTH_IMPLEMENTATION_SUMMARY.md      # Technical details
├── AUTH_TESTING_CHECKLIST.md           # Testing checklist
└── FILE_STRUCTURE.md                   # This file
```

## Key Files Explained

### Authentication Core

#### `lib/supabase/client.ts`
- **Purpose**: Browser Supabase client for Client Components
- **Used in**: Interactive components, client-side data fetching
- **Exports**: `createClient()` function

#### `lib/supabase/server.ts`
- **Purpose**: Server Supabase client for Server Components/Actions
- **Used in**: Server-side data fetching, secure operations
- **Features**: Proper cookie handling with `getAll`/`setAll`
- **Security**: Uses `server-only` package
- **Exports**: `createClient()` function

#### `lib/supabase/middleware.ts`
- **Purpose**: Middleware Supabase client for token refresh
- **Used in**: Next.js middleware
- **Features**: Token refresh, route protection logic
- **Exports**: `updateSession()` function

#### `lib/auth/actions.ts`
- **Purpose**: Server Actions for authentication
- **Exports**:
  - `signInWithGoogle()` - Initiates Google OAuth flow
  - `signOut()` - Clears session and redirects

#### `lib/auth/helpers.ts`
- **Purpose**: Server-side auth helper functions
- **Security**: Uses `server-only` package
- **Exports**:
  - `getUser()` - Get current user (cached)
  - `getSession()` - Get current session (cached)
  - `isAuthenticated()` - Check auth status

#### `middleware.ts`
- **Purpose**: Next.js middleware (runs on every request)
- **Features**:
  - Calls `updateSession()` to refresh tokens
  - Excludes static files and images
  - Runs before page rendering

### Application Pages

#### `app/(auth)/login/page.tsx`
- **Route**: `/login`
- **Access**: Public
- **Features**:
  - Google OAuth button
  - Clean, centered design
  - Server Action for sign-in

#### `app/auth/callback/route.ts`
- **Route**: `/auth/callback`
- **Access**: Public (no auth check)
- **Purpose**: Handle OAuth redirect from Google
- **Features**:
  - Exchanges authorization code for session
  - Sets auth cookies
  - Redirects to dashboard

#### `app/(app)/layout.tsx`
- **Applied to**: All routes under `(app)/`
- **Features**:
  - Navigation bar
  - User avatar and name
  - Sign out button
  - Responsive design
- **Auth**: Redirects to `/login` if not authenticated

#### `app/(app)/dashboard/page.tsx`
- **Route**: `/dashboard`
- **Access**: Protected
- **Features**:
  - Welcome message with user name
  - Stats cards (ELO, games played, win rate, rank)
  - Recent games section
  - "Record a Game" CTA

#### `app/(app)/games/page.tsx`
- **Route**: `/games`
- **Access**: Protected
- **Features**:
  - Game list (placeholder)
  - "Record New Game" button

#### `app/(app)/leaderboard/page.tsx`
- **Route**: `/leaderboard`
- **Access**: Protected
- **Features**:
  - Player rankings (placeholder)

#### `app/page.tsx`
- **Route**: `/` (homepage)
- **Access**: Public
- **Features**:
  - Hero section
  - "Get Started" / "Sign In" buttons (when not authenticated)
  - "Go to Dashboard" button (when authenticated)
  - Feature cards

### Configuration Files

#### `.env.example`
- Template for environment variables
- Shows required variables with placeholders

#### `.env.local` (you create this)
- Your actual environment variables
- **Never commit this file**
- Required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL`

## Route Structure

### Public Routes
- `/` - Homepage
- `/login` - Login page

### Protected Routes (require authentication)
- `/dashboard` - Main dashboard
- `/games` - Games management
- `/leaderboard` - Player rankings

### Utility Routes
- `/auth/callback` - OAuth callback (no auth check)

## Route Groups

### `(app)/`
- Groups all protected application routes
- Shares common layout with navigation
- Automatic auth protection

### `(auth)/`
- Groups authentication-related pages
- Separate from main app layout
- Public access

## Data Flow

### Authentication Flow
```
Client → Server Action (signInWithGoogle)
     ↓
Supabase Auth (initiate OAuth)
     ↓
Google OAuth Consent
     ↓
Redirect to /auth/callback?code=...
     ↓
Callback Route (exchange code for session)
     ↓
Set cookies
     ↓
Redirect to /dashboard
```

### Protected Page Access
```
Browser request to /dashboard
     ↓
Middleware runs
     ↓
updateSession() refreshes token
     ↓
Check authentication status
     ↓
If not authenticated → Redirect to /login
If authenticated → Continue to page
     ↓
Page Server Component runs
     ↓
getUser() fetches user data
     ↓
Render page with user info
```

## Import Patterns

### In Server Components
```typescript
import { getUser } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
```

### In Client Components
```typescript
import { createClient } from '@/lib/supabase/client'
```

### In Server Actions
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
```

### In Middleware
```typescript
import { updateSession } from '@/lib/supabase/middleware'
```

## TypeScript Types

All Supabase-related types are imported from:
- `@supabase/ssr` - CookieOptions
- `@supabase/supabase-js` - User, Session, etc.

## Dependencies

### Auth-Related Packages
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - SSR support for Supabase
- `server-only` - Ensures server-only code isn't bundled

### Already Installed
- `next` - Framework
- `react` - UI library
- `tailwindcss` - Styling
- `typescript` - Type safety

## Environment-Specific Files

### Development
- `.env.local` - Local environment variables
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### Production
- Environment variables set in hosting platform
- `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- Same other variables as development

## Security Boundaries

### Server-Only Code
Files that use `'server-only'`:
- `lib/auth/helpers.ts`
- `lib/supabase/server.ts`

These files will throw an error if imported in Client Components.

### Client-Only Code
Files for browser:
- `lib/supabase/client.ts`

### Universal Code
Can run on both server and client:
- `lib/utils.ts`
- Component files (depends on context)

## Best Practices

### Adding New Protected Routes
1. Create file under `app/(app)/your-route/page.tsx`
2. It automatically gets auth protection
3. Add navigation link in `app/(app)/layout.tsx`

### Adding New Public Routes
1. Create file under `app/your-route/page.tsx`
2. Update middleware if needed to exclude from auth checks

### Using Auth in Components
- Server Components: Use `getUser()` from helpers
- Client Components: Use `createClient()` from client.ts
- Server Actions: Use `createClient()` from server.ts

### Environment Variables
- Prefix public variables with `NEXT_PUBLIC_`
- Keep service role key server-side only
- Never commit `.env.local`

## Notes

- All auth code follows Next.js 15 App Router patterns
- Proper SSR support with cookie handling
- TypeScript strict mode enabled
- No compilation errors
- Production-ready authentication system
