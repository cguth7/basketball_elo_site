# Basketball ELO Tracker

A web application for tracking basketball games and player ELO ratings at your local court.

## Features

- Create and join games (1v1 to 5v5)
- Individual ELO rating system for team games
- Player profiles with stats and history
- Global leaderboard
- Game history tracking

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Hosting**: Vercel
- **Auth**: Google OAuth + Phone (via Supabase)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Set up environment variables (see `.env.example`)
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
