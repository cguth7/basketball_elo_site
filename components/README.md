# UI Components Documentation

This document provides an overview of all UI components created for the Basketball ELO tracking application.

## Component Organization

```
components/
├── ui/                      # shadcn/ui base components
├── layout/                  # Layout components
├── games/                   # Game-related components
├── players/                 # Player-related components
├── leaderboard/            # Leaderboard components
└── forms/                  # Form components
```

---

## UI Components (shadcn/ui)

### Base Components
Located in `/components/ui/`

- **Button**: Customizable button with variants (default, destructive, outline, secondary, ghost, link) and sizes
- **Card**: Card container with Header, Title, Description, Content, and Footer subcomponents
- **Table**: Table with Header, Body, Footer, Row, Head, Cell, and Caption subcomponents
- **Dialog**: Modal dialog with Trigger, Content, Header, Title, Description, and Footer
- **Input**: Standard text input field
- **Label**: Form label component
- **Select**: Dropdown select with trigger, content, item, and group subcomponents
- **Avatar**: Avatar with Image and Fallback subcomponents
- **Badge**: Small badge with variants (default, secondary, destructive, outline)
- **Tabs**: Tab navigation with List, Trigger, and Content subcomponents
- **Form**: Form components with field validation (uses react-hook-form)
- **DropdownMenu**: Dropdown menu with trigger, content, items, and separators
- **Skeleton**: Loading skeleton component
- **Loading Skeletons**: Pre-built skeleton components for games, players, leaderboards, and stats

---

## Layout Components

### Navbar (`/components/layout/navbar.tsx`)

**Purpose**: Main navigation bar with logo, links, and user menu

**Props**:
```typescript
interface NavbarProps {
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  } | null
  onLogout?: () => void
}
```

**Features**:
- Responsive design with mobile hamburger menu
- User avatar with dropdown menu (Profile, Settings, Logout)
- Basketball-themed logo
- Navigation links: Home, Games, Leaderboard, Players

**Usage**:
```tsx
import { Navbar } from "@/components/layout/navbar"

<Navbar user={user} onLogout={handleLogout} />
```

### PageHeader (`/components/layout/page-header.tsx`)

**Purpose**: Reusable page header with title, description, and optional action button

**Props**:
```typescript
interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}
```

**Usage**:
```tsx
import { PageHeader } from "@/components/layout/page-header"

<PageHeader
  title="Leaderboard"
  description="Top players ranked by ELO"
  action={<Button>Create Game</Button>}
/>
```

### Container (`/components/layout/container.tsx`)

**Purpose**: Max-width container wrapper for content

**Usage**:
```tsx
import { Container } from "@/components/layout/container"

<Container>
  <YourContent />
</Container>
```

---

## Game Components

### GameCard (`/components/games/game-card.tsx`)

**Purpose**: Display game information with teams, status, and actions

**Props**:
```typescript
interface GameCardProps {
  game: {
    id: string
    status: "pending" | "in_progress" | "completed"
    team_size: number
    team_a_score?: number | null
    team_b_score?: number | null
    winning_team?: "team_a" | "team_b" | null
    created_at: string
    played_at?: string | null
    team_a_players?: Array<{ id: string; full_name: string; elo_rating: number }>
    team_b_players?: Array<{ id: string; full_name: string; elo_rating: number }>
  }
  onJoin?: () => void
  onView?: () => void
  onSubmitResult?: () => void
  currentUserId?: string
}
```

**Features**:
- Shows team rosters with empty slots
- Displays final score for completed games
- Join button for pending games
- Submit result button for full games
- Status badge

**Usage**:
```tsx
import { GameCard } from "@/components/games/game-card"

<GameCard
  game={game}
  currentUserId={user.id}
  onJoin={() => handleJoin(game.id)}
  onView={() => router.push(`/games/${game.id}`)}
/>
```

### TeamRoster (`/components/games/team-roster.tsx`)

**Purpose**: Display team roster with player avatars and ELO ratings

**Props**:
```typescript
interface TeamRosterProps {
  teamName: string
  players: Array<{
    id: string
    full_name: string
    avatar_url?: string | null
    elo_rating: number
  }>
  teamSize: number
  isWinner?: boolean
}
```

**Usage**:
```tsx
import { TeamRoster } from "@/components/games/team-roster"

<TeamRoster
  teamName="Team A"
  players={teamAPlayers}
  teamSize={5}
  isWinner={game.winning_team === "team_a"}
/>
```

### CreateGameForm (`/components/games/create-game-form.tsx`)

**Purpose**: Form to create a new game with team size selection

**Props**:
```typescript
interface CreateGameFormProps {
  onSubmit: (data: { team_size: number }) => Promise<void>
  isLoading?: boolean
}
```

**Usage**:
```tsx
import { CreateGameForm } from "@/components/games/create-game-form"

<CreateGameForm onSubmit={handleCreateGame} isLoading={isCreating} />
```

### JoinGameButton (`/components/games/join-game-button.tsx`)

**Purpose**: Button with dialog to select and join a team

**Props**:
```typescript
interface JoinGameButtonProps {
  gameId: string
  teamAFull: boolean
  teamBFull: boolean
  onJoin: (team: "team_a" | "team_b") => Promise<void>
  isLoading?: boolean
}
```

**Usage**:
```tsx
import { JoinGameButton } from "@/components/games/join-game-button"

<JoinGameButton
  gameId={game.id}
  teamAFull={teamAPlayers.length === game.team_size}
  teamBFull={teamBPlayers.length === game.team_size}
  onJoin={handleJoinTeam}
/>
```

### GameStatusBadge (`/components/games/game-status-badge.tsx`)

**Purpose**: Color-coded badge showing game status

**Props**:
```typescript
interface GameStatusBadgeProps {
  status: "pending" | "in_progress" | "completed"
  className?: string
}
```

**Usage**:
```tsx
import { GameStatusBadge } from "@/components/games/game-status-badge"

<GameStatusBadge status={game.status} />
```

---

## Player Components

### PlayerCard (`/components/players/player-card.tsx`)

**Purpose**: Display player information card with stats

**Props**:
```typescript
interface PlayerCardProps {
  player: {
    id: string
    full_name: string
    avatar_url?: string | null
    elo_rating: number
    games_played?: number
    wins?: number
    win_rate?: number
  }
  rank?: number
  onViewProfile?: () => void
  compact?: boolean
}
```

**Features**:
- Full and compact modes
- Shows rank with special styling for top 3
- Displays games, wins, and win rate

**Usage**:
```tsx
import { PlayerCard } from "@/components/players/player-card"

<PlayerCard
  player={player}
  rank={1}
  onViewProfile={() => router.push(`/players/${player.id}`)}
/>

// Compact mode
<PlayerCard player={player} compact />
```

### PlayerAvatar (`/components/players/player-avatar.tsx`)

**Purpose**: Player avatar with optional ELO badge overlay

**Props**:
```typescript
interface PlayerAvatarProps {
  player: {
    full_name: string
    avatar_url?: string | null
    elo_rating: number
  }
  size?: "sm" | "md" | "lg"
  showElo?: boolean
  className?: string
}
```

**Usage**:
```tsx
import { PlayerAvatar } from "@/components/players/player-avatar"

<PlayerAvatar player={player} size="lg" showElo />
```

### EloBadge (`/components/players/elo-badge.tsx`)

**Purpose**: Color-coded ELO rating badge

**Props**:
```typescript
interface EloBadgeProps {
  elo: number
  className?: string
  showLabel?: boolean
}
```

**Features**:
- Color coding: Elite (1800+), Advanced (1600+), Intermediate (1400+), Beginner (1200+), Novice (<1200)

**Usage**:
```tsx
import { EloBadge } from "@/components/players/elo-badge"

<EloBadge elo={1500} showLabel />
```

### StatsGrid (`/components/players/stats-grid.tsx`)

**Purpose**: Grid layout for displaying stats

**Props**:
```typescript
interface StatsGridProps {
  stats: Array<{
    label: string
    value: string | number
    icon?: React.ReactNode
    trend?: "up" | "down" | "neutral"
    trendValue?: string
  }>
  columns?: 2 | 3 | 4
}
```

**Usage**:
```tsx
import { StatsGrid, PlayerStatsGrid } from "@/components/players/stats-grid"

// Custom stats
<StatsGrid stats={customStats} columns={4} />

// Pre-built player stats
<PlayerStatsGrid
  gamesPlayed={50}
  wins={30}
  winRate={60}
  eloRating={1650}
  eloChange={25}
/>
```

---

## Leaderboard Components

### LeaderboardTable (`/components/leaderboard/leaderboard-table.tsx`)

**Purpose**: Sortable table of players with rankings

**Props**:
```typescript
interface LeaderboardTableProps {
  players: Array<{
    id: string
    full_name: string
    avatar_url?: string | null
    elo_rating: number
    games_played: number
    wins: number
    win_rate: number
  }>
  currentUserId?: string
  onPlayerClick?: (playerId: string) => void
}
```

**Features**:
- Sortable columns (ELO, Games, Win Rate)
- Special styling for top 3 players (gold, silver, bronze)
- Highlights current user's row
- Win rate progress bar

**Usage**:
```tsx
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"

<LeaderboardTable
  players={players}
  currentUserId={user.id}
  onPlayerClick={(id) => router.push(`/players/${id}`)}
/>
```

### RankBadge (`/components/leaderboard/rank-badge.tsx`)

**Purpose**: Display player rank with special styling for top 3

**Props**:
```typescript
interface RankBadgeProps {
  rank: number
  className?: string
  showIcon?: boolean
}
```

**Features**:
- Gold badge for #1 (with trophy icon)
- Silver badge for #2 (with medal icon)
- Bronze badge for #3 (with medal icon)
- Standard badge for others

**Usage**:
```tsx
import { RankBadge } from "@/components/leaderboard/rank-badge"

<RankBadge rank={1} showIcon />
```

---

## Form Components

### GameResultForm (`/components/forms/game-result-form.tsx`)

**Purpose**: Form to submit game results with confirmation dialog

**Props**:
```typescript
interface GameResultFormProps {
  gameId: string
  teamAName?: string
  teamBName?: string
  onSubmit: (data: {
    winning_team: "team_a" | "team_b"
    team_a_score?: number
    team_b_score?: number
  }) => Promise<void>
  isLoading?: boolean
}
```

**Features**:
- Winner selection
- Optional score input
- Confirmation dialog before submission
- Form validation

**Usage**:
```tsx
import { GameResultForm } from "@/components/forms/game-result-form"

<GameResultForm
  gameId={game.id}
  teamAName="Team A"
  teamBName="Team B"
  onSubmit={handleSubmitResult}
  isLoading={isSubmitting}
/>
```

---

## Loading States

### Skeleton Components (`/components/ui/loading-skeletons.tsx`)

Pre-built loading skeletons for different components:

**Available Skeletons**:
- `GameCardSkeleton`: Loading state for game cards
- `PlayerCardSkeleton`: Loading state for player cards (supports compact mode)
- `LeaderboardTableSkeleton`: Loading state for leaderboard table
- `StatsGridSkeleton`: Loading state for stats grid

**Usage**:
```tsx
import {
  GameCardSkeleton,
  PlayerCardSkeleton,
  LeaderboardTableSkeleton,
  StatsGridSkeleton
} from "@/components/ui/loading-skeletons"

// In your component
{isLoading ? (
  <>
    <GameCardSkeleton />
    <GameCardSkeleton />
    <GameCardSkeleton />
  </>
) : (
  games.map(game => <GameCard key={game.id} game={game} />)
)}
```

---

## Theming

The application uses a basketball-themed color scheme:

### Primary Color
- **Orange** (`hsl(24 100% 50%)`) - Basketball orange for primary actions and accents

### Color Variables
All colors are defined as CSS variables in `app/globals.css` and can be customized:
- `--primary`: Basketball orange
- `--secondary`: Gray tones
- `--accent`: Light orange tints
- `--destructive`: Red for errors
- `--muted`: Gray backgrounds
- `--border`: Border colors
- `--ring`: Focus ring color

### Dark Mode
Fully supports dark mode with adjusted color values.

---

## Best Practices

### Server vs Client Components
- **Server Components** (default): Layout components (Container, PageHeader)
- **Client Components** (`"use client"`): Interactive components (Navbar, forms, tables)

### Type Safety
All components are fully typed with TypeScript. Import types from component files or define in your pages.

### Accessibility
All components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader support

### Mobile Responsiveness
All components are mobile-first and responsive:
- Cards stack on mobile
- Tables are scrollable
- Navigation collapses to hamburger menu
- Forms adapt to screen size

---

## Integration Example

Here's a complete example of using multiple components together:

```tsx
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { GameCard } from "@/components/games/game-card"
import { GameCardSkeleton } from "@/components/ui/loading-skeletons"
import { Button } from "@/components/ui/button"

export default async function GamesPage() {
  const games = await fetchGames()

  return (
    <Container>
      <PageHeader
        title="Games"
        description="Join or create a basketball game"
        action={<Button>Create New Game</Button>}
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.length === 0 ? (
          <>
            <GameCardSkeleton />
            <GameCardSkeleton />
            <GameCardSkeleton />
          </>
        ) : (
          games.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onJoin={() => handleJoin(game.id)}
              onView={() => router.push(`/games/${game.id}`)}
            />
          ))
        )}
      </div>
    </Container>
  )
}
```

---

## Next Steps

After setting up all UI components, you should:

1. **Create database actions**: Server-side functions to fetch/mutate data
2. **Build pages**: Use components in Next.js app router pages
3. **Add authentication**: Integrate with Supabase Auth
4. **Implement real-time**: Add Supabase real-time subscriptions for live updates
5. **Add error handling**: Implement error boundaries and toast notifications
6. **Testing**: Add unit tests for components
7. **Optimization**: Add image optimization, caching, and performance improvements

---

## Support

For questions or issues:
- Check the shadcn/ui documentation: https://ui.shadcn.com/
- Review Next.js 15 documentation: https://nextjs.org/docs
- Check component source code for implementation details
