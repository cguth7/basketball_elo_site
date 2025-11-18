# Basketball ELO Tracker 🏀

A lightweight web application for tracking basketball games and player ELO ratings at your local court. No app downloads required - just sign in with Google and start tracking your games.

## ✨ Features

- **Player Ratings**: Individual ELO ratings that update after each game
- **Team Games**: Supports 1v1 up to 5v5 (and handles uneven teams)
- **Game Management**: Create games, join teams, submit results
- **Leaderboard**: See how you rank against other players
- **Player Profiles**: View stats, ELO history, and game records
- **Smart Algorithm**: Works even when not all players use the app

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account (free tier works great)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd basketball_elo_site
npm install --legacy-peer-deps
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your credentials from Settings → API
3. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Run database migrations:
   - Open Supabase Dashboard → SQL Editor
   - Copy and run: `supabase/migrations/20250118000000_initial_schema.sql`
   - (Optional) Run seed data: `supabase/migrations/20250118000001_seed_data.sql`

5. Enable Google OAuth:
   - Dashboard → Authentication → Providers → Enable Google
   - Follow setup instructions in [`docs/auth/AUTH_SETUP.md`](docs/auth/AUTH_SETUP.md)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google!

## 📖 Documentation

### Getting Started
- **[Setup Guide](docs/SETUP.md)** - Detailed setup instructions
- **[Parallel Agents Summary](docs/PARALLEL_AGENTS_SUMMARY.md)** - How this project was built

### Database
- **[Database Quickstart](docs/database/QUICKSTART.md)** - Fast database setup (15 min)
- **[Schema Documentation](docs/database/README.md)** - Complete database reference
- **[Integration Guide](docs/database/INTEGRATION_GUIDE.md)** - TypeScript examples
- **[Schema Diagrams](docs/database/SCHEMA_DIAGRAM.md)** - Visual database structure

### Authentication
- **[Auth Quickstart](docs/auth/README_AUTH.md)** - Quick auth setup
- **[Auth Setup Guide](docs/auth/AUTH_SETUP.md)** - Detailed auth configuration
- **[Implementation Details](docs/auth/AUTH_IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[Testing Checklist](docs/auth/AUTH_TESTING_CHECKLIST.md)** - Verify auth works

### UI Components
- **[Component Reference](docs/components/README.md)** - All components with examples
- **[Quick Reference](docs/components/COMPONENT_QUICK_REFERENCE.md)** - Cheat sheet
- **[Component Tree](docs/components/COMPONENT_TREE.md)** - Visual hierarchy
- **[Summary](docs/components/UI_COMPONENTS_SUMMARY.md)** - Setup summary

### ELO Algorithm
- **[Algorithm Documentation](lib/elo/README.md)** - How ELO calculations work
- **[Example Usage](lib/elo/example-usage.ts)** - Executable examples

## 🏗️ Project Structure

```
basketball_elo_site/
├── app/                          # Next.js App Router pages
│   ├── (app)/                   # Protected routes
│   │   ├── dashboard/           # User dashboard
│   │   ├── games/               # Game management
│   │   └── leaderboard/         # Player rankings
│   ├── (auth)/                  # Public auth pages
│   │   └── login/               # Login page
│   └── auth/callback/           # OAuth callback
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui base components
│   ├── layout/                  # Layout components (navbar, etc)
│   ├── games/                   # Game-specific components
│   ├── players/                 # Player-specific components
│   ├── leaderboard/             # Leaderboard components
│   └── forms/                   # Form components
│
├── lib/                         # Utility libraries
│   ├── supabase/                # Supabase clients
│   ├── auth/                    # Auth helpers
│   ├── elo/                     # ELO calculation engine
│   └── utils.ts                 # General utilities
│
├── supabase/                    # Database files
│   ├── migrations/              # SQL migrations
│   ├── useful_queries.sql       # Helpful queries
│   └── config.toml              # Supabase config
│
├── docs/                        # Documentation
│   ├── auth/                    # Auth documentation
│   ├── database/                # Database documentation
│   └── components/              # Component documentation
│
└── types/                       # TypeScript types
```

## 🧪 Testing

```bash
# Run ELO algorithm tests
npm test

# Interactive test UI
npm run test:ui

# Coverage report
npm run test:coverage
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Hosting**: Vercel
- **Testing**: Vitest
- **Forms**: React Hook Form + Zod

## 📊 ELO System

This app uses a modified ELO rating system designed for team-based basketball games:

- **Starting Rating**: 1500
- **K-Factor**: 20 (standard for basketball)
- **Team Rating**: Average of all players' individual ratings
- **Rating Updates**: Each player's rating changes based on team performance

**Example**: In a 3v3 game, if Team A (avg 1600) beats Team B (avg 1500), each Team A player gains ~7 points and each Team B player loses ~7 points.

See [`lib/elo/README.md`](lib/elo/README.md) for detailed algorithm documentation.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables (same as `.env.local`)
4. Deploy!

Vercel automatically deploys on every push to main and creates preview deployments for PRs.

## 🗺️ Roadmap

### ✅ Completed (MVP)
- User authentication (Google OAuth)
- Database schema with ELO tracking
- Game creation and joining
- Result submission with ELO updates
- Leaderboard
- Player profiles
- UI component library

### 🚧 In Progress
- Integration of all components
- Real-time game updates
- Player profile pages with stats

### 📋 Planned
- Phone authentication
- ELO history graphs
- Game scheduling
- Win streaks and achievements
- Team statistics
- Export data

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Open an issue to discuss improvements.

## 📄 License

MIT

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Ready to track your court's rankings?** Follow the [Quick Start](#-quick-start) guide above!
