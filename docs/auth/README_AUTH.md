# Basketball ELO Tracker - Authentication System

Complete authentication implementation using Supabase Auth with Google OAuth for Next.js 15 App Router.

## Quick Start

### 1. Install Dependencies
All required packages are already in `package.json`. Just run:
```bash
npm install
```

### 2. Set Up Supabase Project

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** to find your project URL and keys
3. Go to **Authentication** → **Providers** → Enable **Google**
4. Add your Google OAuth credentials (Client ID and Secret)

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configure Redirect URLs

**In Supabase:**
- Navigate to **Authentication** → **URL Configuration**
- Site URL: `http://localhost:3000`
- Redirect URLs: Add `http://localhost:3000/auth/callback`

**In Google Cloud Console:**
- Create OAuth 2.0 credentials
- Add authorized redirect URI: `http://localhost:3000/auth/callback`

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and test the auth flow!

## What Was Implemented

### Core Authentication Files

```
lib/
├── supabase/
│   ├── client.ts         # Browser client for client components
│   ├── server.ts         # Server client with SSR cookie handling
│   └── middleware.ts     # Token refresh and route protection logic
└── auth/
    ├── actions.ts        # Server Actions (signInWithGoogle, signOut)
    └── helpers.ts        # Auth helpers (getUser, getSession, isAuthenticated)

middleware.ts             # Route protection middleware
```

### Application Pages

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx       # Login page with Google OAuth
├── (app)/                 # Protected routes group
│   ├── layout.tsx        # Navigation bar + user menu
│   ├── dashboard/
│   │   └── page.tsx     # Main dashboard
│   ├── games/
│   │   └── page.tsx     # Games page
│   └── leaderboard/
│       └── page.tsx     # Leaderboard page
├── auth/
│   └── callback/
│       └── route.ts      # OAuth callback handler
└── page.tsx             # Public homepage
```

## Features

### ✅ Implemented

- **Google OAuth** - Primary authentication method
- **Route Protection** - Middleware guards protected routes
- **Token Refresh** - Automatic session refresh on every request
- **User Navigation** - Avatar, name, and sign out functionality
- **SSR Support** - Proper cookie handling for server-side rendering
- **Security** - Uses `server-only` package, proper cookie methods
- **TypeScript** - Fully typed with no compilation errors

### 🔄 Future Enhancements

- Phone authentication
- Email/password auth
- User profile management
- Role-based access control (RBAC)
- Session management UI
- Multi-factor authentication (MFA)

## Authentication Flow

### Login Flow
```
User visits /login
    ↓
Clicks "Continue with Google"
    ↓
Google OAuth consent
    ↓
Redirect to /auth/callback?code=...
    ↓
Exchange code for session
    ↓
Redirect to /dashboard
```

### Route Protection
```
User visits protected route (/dashboard, /games, /leaderboard)
    ↓
Middleware checks authentication
    ↓
If authenticated → Allow access
If not → Redirect to /login
```

## Testing

See `AUTH_TESTING_CHECKLIST.md` for comprehensive testing instructions.

Quick test:
1. Visit `http://localhost:3000`
2. Click "Get Started" or "Sign In"
3. Complete Google OAuth flow
4. Verify you're redirected to dashboard
5. Check that navigation bar shows your avatar and name
6. Click "Sign out" to test logout flow

## Documentation

- **AUTH_SETUP.md** - Detailed setup guide with troubleshooting
- **AUTH_IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **AUTH_TESTING_CHECKLIST.md** - Complete testing checklist

## Security Best Practices

### Implemented ✅
- Server-only imports for sensitive code
- Proper cookie handling (`getAll`/`setAll`)
- Token refresh on every request
- No service role key exposure to client
- PKCE OAuth flow via Supabase

### Recommended for Production 🔒
- Enable MFA in Supabase
- Configure rate limiting
- Set up Row Level Security (RLS) policies
- Enable email verification
- Add CSRF protection
- Implement session timeout
- Enable refresh token rotation

## Architecture Decisions

### Why Supabase Auth?
- Built-in OAuth providers
- Automatic token refresh
- SSR support with `@supabase/ssr`
- Row Level Security integration
- No need to manage auth infrastructure

### Why Google OAuth?
- Most users have Google accounts
- Trusted provider
- Easy setup
- Good UX

### Why Next.js App Router?
- Server Components by default (better performance)
- Built-in Server Actions
- Better SEO
- Improved routing

### Why Route Groups?
- Clean URL structure
- Shared layouts for protected routes
- Easier to manage auth boundaries

## File Structure Explained

### `lib/supabase/client.ts`
Browser client for Client Components. Use when you need auth in:
- Interactive components
- Client-side data fetching
- Real-time subscriptions

### `lib/supabase/server.ts`
Server client for Server Components and Server Actions. Use when:
- Fetching data on the server
- Running server-side logic
- Accessing secure data

### `lib/supabase/middleware.ts`
Middleware client for token refresh. Handles:
- Refreshing auth tokens on every request
- Redirecting based on auth status
- Route protection logic

### `middleware.ts`
Next.js middleware that runs on every request:
- Calls `updateSession` from `lib/supabase/middleware.ts`
- Excludes static files and images
- Runs before page rendering

### `lib/auth/actions.ts`
Server Actions for auth operations:
- `signInWithGoogle()` - Initiates OAuth flow
- `signOut()` - Clears session and redirects

### `lib/auth/helpers.ts`
Server-side helper functions:
- `getUser()` - Get current user (cached)
- `getSession()` - Get current session (cached)
- `isAuthenticated()` - Check if user is logged in

## Common Issues

### "Could not authenticate user"
- Check redirect URLs in Supabase and Google Cloud Console
- Verify `NEXT_PUBLIC_SITE_URL` is correct
- Check Supabase logs for errors

### Infinite redirect loop
- Verify `/auth/callback` is excluded from auth checks
- Check middleware logic in `lib/supabase/middleware.ts`

### Session not persisting
- Enable cookies in browser
- Check cookie domain settings
- Verify Supabase cookies are being set (check DevTools)

### TypeScript errors
- Run `npm install` to ensure all packages are installed
- Check that `@supabase/ssr` is latest version
- Run `npx tsc --noEmit` to check for errors

## Development Workflow

### Making Changes
1. Edit files in `lib/auth/` or `app/(auth)/`
2. Restart dev server if modifying middleware
3. Test auth flow thoroughly
4. Check browser console for errors

### Adding New Protected Routes
1. Create page under `app/(app)/`
2. It automatically inherits auth protection
3. Add navigation link in `app/(app)/layout.tsx`

### Adding New Auth Methods
1. Enable provider in Supabase
2. Create new sign-in function in `lib/auth/actions.ts`
3. Add button to login page
4. Test OAuth flow

## Production Deployment

### Before Deploying
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Add production redirect URL to Supabase
- [ ] Add production redirect URL to Google Cloud Console
- [ ] Test complete auth flow in staging
- [ ] Verify HTTPS is enabled
- [ ] Set secure cookie options for production
- [ ] Enable security headers
- [ ] Set up monitoring and logging

### Environment Variables
Set these in your hosting platform (Vercel, Netlify, etc.):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Support & Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)

## License

This authentication implementation follows the same license as your project.

---

**Questions?** Check the detailed guides in:
- `AUTH_SETUP.md` for setup and configuration
- `AUTH_TESTING_CHECKLIST.md` for testing procedures
- `AUTH_IMPLEMENTATION_SUMMARY.md` for technical details
