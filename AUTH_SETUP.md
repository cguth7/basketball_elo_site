# Authentication Setup Guide

This guide explains the complete authentication flow implemented for the Basketball ELO Tracker application.

## Overview

The application uses **Supabase Auth** with **Google OAuth** as the primary authentication method. The implementation follows Next.js 15 App Router best practices with proper SSR support.

## Architecture

### File Structure

```
lib/
├── supabase/
│   ├── client.ts          # Browser client for client components
│   ├── server.ts          # Server client for server components/actions
│   └── middleware.ts      # Middleware client for token refresh
└── auth/
    ├── actions.ts         # Server actions for sign in/out
    └── helpers.ts         # Helper functions for auth status

app/
├── (auth)/
│   └── login/
│       └── page.tsx       # Login page with Google OAuth
├── (app)/
│   ├── layout.tsx         # Protected app layout with navigation
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard page
│   ├── games/
│   │   └── page.tsx       # Games page
│   └── leaderboard/
│       └── page.tsx       # Leaderboard page
├── auth/
│   └── callback/
│       └── route.ts       # OAuth callback handler
└── page.tsx               # Public homepage

middleware.ts              # Route protection and token refresh
```

## Key Features

### 1. Supabase Client Utilities

**Browser Client** (`lib/supabase/client.ts`)
- Used in Client Components
- Creates browser-side Supabase client
- Handles client-side auth operations

**Server Client** (`lib/supabase/server.ts`)
- Used in Server Components and Server Actions
- Properly handles cookies with `getAll`/`setAll`
- Uses `server-only` package to prevent client-side usage
- Gracefully handles cookie setting errors from Server Components

**Middleware Client** (`lib/supabase/middleware.ts`)
- Refreshes auth tokens on every request
- Handles route protection logic
- Redirects authenticated/unauthenticated users appropriately

### 2. Authentication Flow

1. **User visits login page** (`/login`)
   - Shows Google OAuth button
   - Clicking triggers `signInWithGoogle` Server Action

2. **OAuth redirect**
   - User is redirected to Google OAuth consent screen
   - After consent, Google redirects to `/auth/callback?code=...`

3. **Callback handling** (`/auth/callback`)
   - Exchanges authorization code for session
   - Sets auth cookies
   - Redirects to `/dashboard`

4. **Protected routes**
   - Middleware checks authentication on every request
   - Unauthenticated users → redirected to `/login`
   - Authenticated users → can access app routes

5. **Sign out**
   - User clicks "Sign out" button
   - `signOut` Server Action clears session
   - Redirects to homepage

### 3. Route Protection

The middleware (`middleware.ts`) protects routes as follows:

- **Public routes**: `/`, `/login`
- **Protected routes**: `/dashboard`, `/games`, `/leaderboard`
- **Auth routes**: `/auth/callback` (bypasses auth check)

### 4. User Navigation

The protected app layout (`app/(app)/layout.tsx`) includes:
- User avatar and name (from Google)
- Navigation links (Dashboard, Games, Leaderboard)
- Sign out button
- Automatic redirect to login if not authenticated

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Production**: Change `NEXT_PUBLIC_SITE_URL` to your production domain.

## Supabase Configuration

### 1. Enable Google OAuth Provider

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

### 2. Configure Redirect URLs

Add the following URLs to **Authorized redirect URIs** in Google Cloud Console:

**Development**:
```
http://localhost:3000/auth/callback
```

**Production**:
```
https://your-domain.com/auth/callback
```

Also add these to Supabase **Authentication** → **URL Configuration** → **Redirect URLs**:
```
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

### 3. Site URL Configuration

In Supabase **Authentication** → **URL Configuration**:
- **Site URL**: `http://localhost:3000` (development) or your production URL

## Testing the Auth Flow

### 1. Start the development server
```bash
npm run dev
```

### 2. Test the complete flow

1. **Visit homepage** (`http://localhost:3000`)
   - Should see "Get Started" and "Sign In" buttons
   - Not authenticated yet

2. **Click "Get Started" or "Sign In"**
   - Redirected to `/login`
   - See Google OAuth button

3. **Click "Continue with Google"**
   - Redirected to Google OAuth consent screen
   - Choose your Google account
   - Grant permissions

4. **After OAuth consent**
   - Redirected back to `/auth/callback`
   - Callback exchanges code for session
   - Redirected to `/dashboard`

5. **Verify authentication**
   - See your Google avatar and name in nav bar
   - Can access `/dashboard`, `/games`, `/leaderboard`
   - Homepage now shows "Go to Dashboard" button

6. **Test route protection**
   - Open a new incognito window
   - Try to visit `http://localhost:3000/dashboard`
   - Should be redirected to `/login`

7. **Sign out**
   - Click "Sign out" button
   - Redirected to homepage
   - No longer have access to protected routes

## Security Best Practices

### Implemented

- ✅ **Server-only imports**: Auth helpers use `server-only` package
- ✅ **Proper cookie handling**: Uses `getAll`/`setAll` for SSR
- ✅ **Token refresh**: Middleware refreshes tokens on every request
- ✅ **Route protection**: Middleware enforces auth requirements
- ✅ **No service role exposure**: Service role key never sent to client
- ✅ **OAuth best practices**: Uses PKCE flow via Supabase

### Recommendations

- 🔒 Enable MFA in Supabase for admin accounts
- 🔒 Configure rate limiting in Supabase
- 🔒 Set up row-level security policies for database tables
- 🔒 Enable email verification if adding email/password auth
- 🔒 Add CSRF protection for sensitive operations
- 🔒 Implement session timeout and refresh token rotation

## Common Issues

### Issue: "Could not authenticate user" error

**Cause**: OAuth callback failed
**Solution**:
- Check that redirect URLs are configured correctly in both Google Cloud Console and Supabase
- Verify `NEXT_PUBLIC_SITE_URL` matches your actual domain
- Check Supabase logs for detailed error messages

### Issue: Infinite redirect loop

**Cause**: Middleware redirect logic conflict
**Solution**:
- Check that `/auth/callback` is excluded from auth checks
- Verify route protection logic in `lib/supabase/middleware.ts`

### Issue: "Session not found" after OAuth

**Cause**: Cookie not being set properly
**Solution**:
- Verify cookie domain settings
- Check browser developer tools → Application → Cookies
- Ensure `sameSite` and `secure` cookie attributes are correct

### Issue: User logged out unexpectedly

**Cause**: Token refresh failing
**Solution**:
- Check that middleware is running on all routes
- Verify Supabase project is not paused
- Check network tab for failed auth requests

## Next Steps

### Add Phone Authentication
1. Enable Phone provider in Supabase
2. Create phone login component
3. Add phone verification flow

### Enhance User Profile
1. Create profile page
2. Allow users to update display name, avatar
3. Store additional user metadata

### Implement Role-Based Access Control
1. Add user roles to database
2. Create authorization helpers
3. Protect specific features by role

### Add Session Management
1. Show active sessions
2. Allow users to revoke sessions
3. Implement "logout all devices"

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js 15 Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)
