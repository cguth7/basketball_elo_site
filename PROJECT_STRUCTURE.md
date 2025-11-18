# Project Structure

## 📁 Clean, Organized Directory Layout

```
basketball_elo_site/
│
├── 📄 README.md                      # Main project documentation
├── 📄 package.json                   # Dependencies and scripts
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 tailwind.config.ts             # Tailwind CSS configuration
├── 📄 next.config.ts                 # Next.js configuration
├── 📄 middleware.ts                  # Auth middleware
├── 📄 .env.example                   # Environment variables template
│
├── 📂 app/                           # Next.js App Router
│   ├── 📂 (app)/                    # Protected routes
│   │   ├── layout.tsx               # Protected layout with navbar
│   │   ├── 📂 dashboard/            # User dashboard
│   │   ├── 📂 games/                # Game management
│   │   └── 📂 leaderboard/          # Player rankings
│   │
│   ├── 📂 (auth)/                   # Public routes
│   │   └── 📂 login/                # Login page
│   │
│   ├── 📂 auth/
│   │   └── 📂 callback/             # OAuth callback
│   │
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Homepage
│   └── globals.css                  # Global styles
│
├── 📂 components/                    # React components
│   ├── 📂 ui/                       # shadcn/ui base (15 components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── ... (and more)
│   │
│   ├── 📂 layout/                   # Layout components
│   │   ├── navbar.tsx
│   │   ├── page-header.tsx
│   │   └── container.tsx
│   │
│   ├── 📂 games/                    # Game components
│   │   ├── game-card.tsx
│   │   ├── team-roster.tsx
│   │   ├── create-game-form.tsx
│   │   ├── join-game-button.tsx
│   │   └── game-status-badge.tsx
│   │
│   ├── 📂 players/                  # Player components
│   │   ├── player-card.tsx
│   │   ├── player-avatar.tsx
│   │   ├── elo-badge.tsx
│   │   └── stats-grid.tsx
│   │
│   ├── 📂 leaderboard/              # Leaderboard components
│   │   ├── leaderboard-table.tsx
│   │   └── rank-badge.tsx
│   │
│   ├── 📂 forms/                    # Form components
│   │   └── game-result-form.tsx
│   │
│   └── index.ts                     # Barrel exports
│
├── 📂 lib/                          # Utility libraries
│   ├── 📂 supabase/                 # Supabase clients
│   │   ├── client.ts                # Browser client
│   │   ├── server.ts                # Server client
│   │   └── middleware.ts            # Middleware client
│   │
│   ├── 📂 auth/                     # Auth helpers
│   │   ├── actions.ts               # Server Actions
│   │   └── helpers.ts               # Auth utilities
│   │
│   ├── 📂 elo/                      # ELO calculation engine
│   │   ├── constants.ts             # ELO constants
│   │   ├── types.ts                 # TypeScript types
│   │   ├── calculator.ts            # Core calculations
│   │   ├── team-ratings.ts          # Team game logic
│   │   ├── example-usage.ts         # Examples
│   │   ├── index.ts                 # Exports
│   │   ├── README.md                # Algorithm docs
│   │   └── 📂 __tests__/            # Test suite (73 tests)
│   │       ├── calculator.test.ts
│   │       └── team-ratings.test.ts
│   │
│   └── utils.ts                     # General utilities
│
├── 📂 supabase/                     # Database files
│   ├── 📂 migrations/               # SQL migrations
│   │   ├── 20250118000000_initial_schema.sql
│   │   └── 20250118000001_seed_data.sql
│   │
│   ├── useful_queries.sql           # Helper SQL queries
│   └── config.toml                  # Supabase config
│
├── 📂 docs/                         # 📚 Documentation (ORGANIZED!)
│   ├── README.md                    # Documentation index
│   ├── SETUP.md                     # Setup guide
│   ├── PARALLEL_AGENTS_SUMMARY.md   # Project build summary
│   │
│   ├── 📂 auth/                     # Authentication docs
│   │   ├── README_AUTH.md           # Quick start
│   │   ├── AUTH_SETUP.md            # Detailed setup
│   │   ├── AUTH_IMPLEMENTATION_SUMMARY.md
│   │   └── AUTH_TESTING_CHECKLIST.md
│   │
│   ├── 📂 database/                 # Database docs
│   │   ├── QUICKSTART.md            # Quick setup
│   │   ├── README.md                # Schema reference
│   │   ├── INTEGRATION_GUIDE.md     # TypeScript examples
│   │   └── SCHEMA_DIAGRAM.md        # Visual diagrams
│   │
│   └── 📂 components/               # UI component docs
│       ├── README.md                # Component reference
│       ├── COMPONENT_QUICK_REFERENCE.md
│       ├── COMPONENT_TREE.md
│       └── UI_COMPONENTS_SUMMARY.md
│
└── 📂 types/                        # TypeScript types
    └── (generated types go here)
```

## 📊 Statistics

### Code Files
- **App Pages**: 7 routes
- **Components**: 30+ reusable components
- **Library Functions**: 3 modules (supabase, auth, elo)
- **Tests**: 73 passing unit tests
- **Migrations**: 2 SQL files

### Documentation Files
- **Main README**: 1 comprehensive guide
- **Organized Docs**: 16 documentation files
- **Categories**: 4 (general, auth, database, components)

### Configuration Files
- TypeScript, ESLint, Tailwind configs
- Next.js, Vitest, PostCSS configs
- Supabase config
- Package management

## 🎯 Key Improvements

### Before
```
basketball_elo_site/
├── README.md
├── AUTH_SETUP.md
├── AUTH_IMPLEMENTATION_SUMMARY.md
├── AUTH_TESTING_CHECKLIST.md
├── README_AUTH.md
├── COMPONENT_QUICK_REFERENCE.md
├── COMPONENT_TREE.md
├── UI_COMPONENTS_SUMMARY.md
├── FILE_STRUCTURE.md
├── PARALLEL_AGENTS_SUMMARY.md
├── SETUP.md
├── package.json
├── ... (13 loose documentation files in root!)
```

### After
```
basketball_elo_site/
├── 📄 README.md (clean, comprehensive)
├── 📄 package.json
├── 📄 Essential config files only
│
└── 📂 docs/
    ├── 📂 auth/         (4 files)
    ├── 📂 database/     (4 files)
    ├── 📂 components/   (4 files)
    └── 📄 General docs  (3 files)
```

## 🚀 Navigation

### For Developers

**Starting the project?**
→ Read [`README.md`](README.md)

**Setting up database?**
→ Go to [`docs/database/QUICKSTART.md`](docs/database/QUICKSTART.md)

**Configuring auth?**
→ Go to [`docs/auth/AUTH_SETUP.md`](docs/auth/AUTH_SETUP.md)

**Using components?**
→ Go to [`docs/components/README.md`](docs/components/README.md)

**Understanding ELO?**
→ Go to [`lib/elo/README.md`](lib/elo/README.md)

**Full documentation index?**
→ Go to [`docs/README.md`](docs/README.md)

---

**Clean, organized, and ready for development!** 🎉
