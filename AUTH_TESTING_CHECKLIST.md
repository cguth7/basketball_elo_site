# Authentication Testing Checklist

Use this checklist to verify the authentication flow is working correctly.

## Prerequisites Setup

- [ ] Created Supabase project
- [ ] Enabled Google OAuth provider in Supabase
- [ ] Created Google OAuth credentials in Google Cloud Console
- [ ] Added Google Client ID and Secret to Supabase
- [ ] Configured redirect URLs in both Supabase and Google Cloud Console
- [ ] Created `.env.local` file with all required variables
- [ ] Installed dependencies (`npm install`)
- [ ] Started dev server (`npm run dev`)

## Environment Variables Checklist

Verify your `.env.local` file contains:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Redirect URLs Checklist

### In Supabase (Authentication → URL Configuration)
- [ ] Site URL: `http://localhost:3000`
- [ ] Redirect URLs: `http://localhost:3000/auth/callback`

### In Google Cloud Console (OAuth 2.0 Client → Authorized redirect URIs)
- [ ] `http://localhost:3000/auth/callback`
- [ ] For production: `https://your-domain.com/auth/callback`

## Functional Testing

### 1. Unauthenticated User Flow

- [ ] Visit `http://localhost:3000`
  - [ ] Homepage loads successfully
  - [ ] See "Get Started" button
  - [ ] See "Sign In" button
  - [ ] See three feature cards (Track Stats, Compete, Improve)

- [ ] Try to access protected routes directly
  - [ ] Visit `http://localhost:3000/dashboard` → Redirected to `/login`
  - [ ] Visit `http://localhost:3000/games` → Redirected to `/login`
  - [ ] Visit `http://localhost:3000/leaderboard` → Redirected to `/login`

- [ ] Visit login page
  - [ ] Visit `http://localhost:3000/login`
  - [ ] Page displays "Basketball ELO Tracker" title
  - [ ] Page displays "Welcome back" heading
  - [ ] "Continue with Google" button is visible
  - [ ] Google logo is displayed on button

### 2. Google OAuth Flow

- [ ] Click "Continue with Google" button
  - [ ] Redirected to Google OAuth consent screen
  - [ ] URL starts with `https://accounts.google.com`

- [ ] Select Google account
  - [ ] Account selection screen appears
  - [ ] Can select an account

- [ ] Grant permissions (first time only)
  - [ ] Permission screen shows app name
  - [ ] Can grant permissions

- [ ] After OAuth consent
  - [ ] Redirected back to your app
  - [ ] URL briefly shows `/auth/callback?code=...`
  - [ ] Automatically redirected to `/dashboard`
  - [ ] No errors in browser console

### 3. Authenticated User Experience

- [ ] Dashboard page
  - [ ] Dashboard loads successfully
  - [ ] See "Welcome back, [Your Name]!" greeting
  - [ ] See four stat cards (Current ELO, Games Played, Win Rate, Rank)
  - [ ] See "Recent Games" section
  - [ ] "Record a Game" button is visible

- [ ] Navigation bar
  - [ ] Navigation bar is visible at top
  - [ ] "Basketball ELO" logo/text is visible
  - [ ] "Dashboard" link is visible
  - [ ] "Games" link is visible
  - [ ] "Leaderboard" link is visible
  - [ ] User avatar is displayed (from Google)
  - [ ] User name is displayed
  - [ ] User email is displayed
  - [ ] "Sign out" button is visible

- [ ] Navigate to other protected routes
  - [ ] Click "Games" → Navigates to `/games`
  - [ ] Click "Leaderboard" → Navigates to `/leaderboard`
  - [ ] Click "Dashboard" → Navigates to `/dashboard`
  - [ ] All pages load without errors

- [ ] Games page
  - [ ] Page title "Games" is visible
  - [ ] "Record New Game" button is visible
  - [ ] "No games recorded" placeholder is visible

- [ ] Leaderboard page
  - [ ] Page title "Leaderboard" is visible
  - [ ] "No players yet" placeholder is visible

- [ ] Homepage as authenticated user
  - [ ] Visit `http://localhost:3000`
  - [ ] See "Go to Dashboard" button (instead of login buttons)
  - [ ] Clicking button navigates to `/dashboard`

- [ ] Try to access login page while authenticated
  - [ ] Visit `http://localhost:3000/login`
  - [ ] Automatically redirected to `/dashboard`

### 4. Sign Out Flow

- [ ] Click "Sign out" button
  - [ ] Redirected to homepage (`/`)
  - [ ] Navigation bar is no longer visible
  - [ ] See "Get Started" and "Sign In" buttons again

- [ ] Verify session is cleared
  - [ ] Try to visit `/dashboard` → Redirected to `/login`
  - [ ] Try to visit `/games` → Redirected to `/login`
  - [ ] Try to visit `/leaderboard` → Redirected to `/login`

### 5. Session Persistence

- [ ] Sign in again
- [ ] Refresh the page
  - [ ] Still authenticated
  - [ ] Dashboard still accessible
  - [ ] User info still displayed

- [ ] Open app in new tab
  - [ ] Visit `http://localhost:3000/dashboard`
  - [ ] Still authenticated
  - [ ] Dashboard loads correctly

- [ ] Close browser completely
- [ ] Reopen browser and visit app
  - [ ] Should still be authenticated (session persists)
  - [ ] Dashboard accessible without re-login

## Browser Console Checks

- [ ] No JavaScript errors during any flow
- [ ] No failed network requests (check Network tab)
- [ ] Cookies are being set correctly (check Application → Cookies)
  - [ ] Should see Supabase auth cookies
  - [ ] Cookies should have proper domain and path

## Edge Cases

- [ ] Test with browser cookies disabled
  - [ ] Should show appropriate error or message

- [ ] Test incognito/private browsing
  - [ ] Auth flow should work
  - [ ] Session should not persist after closing incognito window

- [ ] Test with ad blockers enabled
  - [ ] OAuth flow should still work
  - [ ] If blocked, user should see clear error

## Error Scenarios

- [ ] Test with invalid Supabase URL
  - [ ] Should show connection error

- [ ] Test with invalid API keys
  - [ ] Should show authentication error

- [ ] Cancel OAuth flow
  - [ ] Click Google OAuth, then cancel
  - [ ] Should return to login page
  - [ ] Should show appropriate message or error

## Performance Checks

- [ ] Initial page load is fast (< 2 seconds)
- [ ] OAuth redirect is smooth (no long delays)
- [ ] Protected pages load quickly after authentication
- [ ] Navigation between pages is instant

## Mobile Responsive (Optional)

- [ ] Test on mobile viewport
  - [ ] Login page is mobile-friendly
  - [ ] Navigation is responsive
  - [ ] Dashboard is readable on mobile
  - [ ] OAuth flow works on mobile

## Production Checklist (Before Deployment)

- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Add production redirect URL to Supabase
- [ ] Add production redirect URL to Google Cloud Console
- [ ] Test complete flow in production environment
- [ ] Verify HTTPS is enabled
- [ ] Check that cookies work across www and non-www domains
- [ ] Set appropriate cookie security settings

## Common Issues & Solutions

### Issue: "Could not authenticate user" error
- Check redirect URLs are configured correctly
- Verify `NEXT_PUBLIC_SITE_URL` matches actual domain
- Check Supabase logs for detailed error

### Issue: Infinite redirect loop
- Verify `/auth/callback` is excluded from auth checks in middleware
- Check middleware redirect logic

### Issue: Session not persisting
- Check browser cookies are enabled
- Verify Supabase cookies are being set
- Check cookie domain settings

### Issue: OAuth popup blocked
- Enable popups for your domain
- Try using redirect flow instead of popup

## Notes

- All tests should pass before considering auth implementation complete
- Document any issues encountered and their solutions
- Keep this checklist updated as new features are added
