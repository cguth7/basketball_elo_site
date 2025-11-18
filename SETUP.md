# Setup Guide

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - **Name**: basketball-elo-tracker (or your choice)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for MVP
5. Wait for project to be provisioned (~2 minutes)

### 2. Get API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 3. Configure Environment Variables

1. Create a `.env.local` file in the project root
2. Add your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Set Up Google OAuth (Optional for now)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Follow instructions to create OAuth client in Google Cloud Console
4. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret to Supabase settings

### 5. Database Schema

The database migrations will be created by the Database Schema Engineer agent and can be run once the schema files are ready.

## Vercel Deployment (Later)

1. Push code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables from `.env.local`
5. Deploy!

Vercel will automatically set up preview deployments for PRs and deploy on every push to main.

## Next Steps

Once you have your `.env.local` file configured with Supabase credentials:

1. Run `npm run dev` to start the development server
2. The parallel agents will set up the database schema, auth, ELO logic, and UI components
3. After agents complete, we'll integrate everything together
