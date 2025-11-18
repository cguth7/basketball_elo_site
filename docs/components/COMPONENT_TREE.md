# Component Hierarchy & Usage Tree

Visual guide showing how components fit together in the Basketball ELO application.

---

## Page Structure

```
┌─────────────────────────────────────────┐
│             Navbar                       │ ← User menu, navigation
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │        Container                   │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │     PageHeader               │  │ │ ← Title, description, action
│  │  └─────────────────────────────┘  │ │
│  │                                    │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │     Page Content             │  │ │
│  │  │  (Games/Players/Leaderboard) │  │ │
│  │  └─────────────────────────────┘  │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## Games Page Structure

```
Games Page
└── Container
    ├── PageHeader
    │   ├── title: "Games"
    │   ├── description: "Active basketball games"
    │   └── action: <Button>Create Game</Button>
    │
    └── Grid (3 columns)
        ├── GameCard #1
        │   ├── GameStatusBadge
        │   ├── Team rosters (simplified)
        │   ├── Score display (if completed)
        │   └── Actions
        │       ├── JoinGameButton → Dialog → Select team
        │       └── View Details Button
        │
        ├── GameCard #2
        └── GameCard #3
```

**Loading State**:
```
Games Page (Loading)
└── Container
    ├── PageHeader
    └── Grid
        ├── GameCardSkeleton
        ├── GameCardSkeleton
        └── GameCardSkeleton
```

---

## Game Detail Page Structure

```
Game Detail Page
└── Container
    ├── PageHeader
    │   ├── title: "Game #123"
    │   ├── description: "5v5 • Pending"
    │   └── action: <GameStatusBadge />
    │
    ├── Teams Grid (2 columns)
    │   ├── TeamRoster (Team A)
    │   │   ├── Winner badge (if applicable)
    │   │   └── Players list
    │   │       ├── PlayerAvatar + name + ELO
    │   │       ├── PlayerAvatar + name + ELO
    │   │       └── Empty slots
    │   │
    │   └── TeamRoster (Team B)
    │       └── (same structure)
    │
    └── Actions
        └── GameResultForm (if game ready)
            ├── Select winner
            ├── Optional scores
            └── Dialog confirmation
```

---

## Leaderboard Page Structure

```
Leaderboard Page
└── Container
    ├── PageHeader
    │   ├── title: "Leaderboard"
    │   └── description: "Top players by ELO"
    │
    └── LeaderboardTable
        ├── Table Header (sortable)
        │   ├── Rank
        │   ├── Player
        │   ├── ELO ↕
        │   ├── Games ↕
        │   └── Win Rate ↕
        │
        └── Table Body
            ├── Row #1 (Gold highlight)
            │   ├── RankBadge (🏆 #1)
            │   ├── PlayerAvatar + name
            │   ├── EloBadge
            │   ├── Games + wins
            │   └── Win rate + progress bar
            │
            ├── Row #2 (Silver highlight)
            ├── Row #3 (Bronze highlight)
            └── Rows #4-N
```

**Loading State**:
```
Leaderboard Page (Loading)
└── Container
    ├── PageHeader
    └── LeaderboardTableSkeleton (10 rows)
```

---

## Players Page Structure

```
Players Page
└── Container
    ├── PageHeader
    │   ├── title: "Players"
    │   └── description: "All registered players"
    │
    └── Grid (3 columns)
        ├── PlayerCard #1 (compact)
        │   ├── Rank badge
        │   ├── PlayerAvatar (small)
        │   ├── Name
        │   ├── EloBadge
        │   └── Games count
        │
        ├── PlayerCard #2
        └── PlayerCard #3
```

---

## Player Profile Page Structure

```
Player Profile Page
└── Container
    ├── PageHeader
    │   ├── PlayerAvatar (large)
    │   ├── Name + EloBadge
    │   └── RankBadge
    │
    ├── PlayerStatsGrid (4 columns)
    │   ├── Stat: Games Played
    │   ├── Stat: Wins
    │   ├── Stat: Win Rate (with trend)
    │   └── Stat: ELO (with trend)
    │
    ├── Tabs
    │   ├── Recent Games Tab
    │   │   └── Game history (list of GameCards)
    │   │
    │   └── Performance Tab
    │       └── Charts/graphs
    │
    └── Actions
        └── Buttons (Edit Profile, etc.)
```

**Loading State**:
```
Player Profile (Loading)
└── Container
    ├── PageHeader (skeleton)
    ├── StatsGridSkeleton (4 columns)
    └── Content skeletons
```

---

## Create Game Flow

```
Create Game Dialog/Page
└── Dialog or Page
    ├── DialogHeader / PageHeader
    │   ├── title: "Create New Game"
    │   └── description: "Select game type"
    │
    └── CreateGameForm
        ├── Form field: Team size
        │   └── Select (3v3, 4v4, 5v5)
        │
        └── Submit Button
            ↓
        (Creates game, redirects to game page)
```

---

## Join Game Flow

```
Join Game
└── JoinGameButton
    ├── Button: "Join Game"
    │   ↓ (click)
    └── Dialog
        ├── DialogHeader
        │   ├── title: "Join Game"
        │   └── description: "Select team"
        │
        ├── Select team
        │   ├── Option: Team A (if not full)
        │   └── Option: Team B (if not full)
        │
        └── Actions
            ├── Cancel Button
            └── Join Button
                ↓
            (Adds player to team)
```

---

## Submit Result Flow

```
Submit Game Result
└── GameResultForm
    ├── Form field: Winning team
    │   ├── Option: Team A
    │   └── Option: Team B
    │
    ├── Form field: Scores (optional)
    │   ├── Team A score
    │   └── Team B score
    │
    └── Submit Button
        ↓
    Dialog Confirmation
    ├── DialogHeader
    │   ├── title: "Confirm Result"
    │   └── warning message
    │
    ├── Result preview
    │   ├── Winner: Team A
    │   └── Score: 21-15 (if provided)
    │
    └── Actions
        ├── Cancel Button
        └── Confirm Button
            ↓
        (Updates game, recalculates ELO)
```

---

## Component Dependencies

### Core UI Components (shadcn/ui)
```
button ← (no deps)
card ← (no deps)
badge ← (no deps)
avatar ← (no deps)
skeleton ← (no deps)

input ← label
select ← button, dropdown-menu
dialog ← button
form ← label, input (uses react-hook-form, zod)
table ← (no deps)
tabs ← (no deps)
dropdown-menu ← button
```

### Custom Components

**Layout**:
```
navbar
├── avatar
├── dropdown-menu
└── button

page-header
└── (no UI deps)

container
└── (no UI deps)
```

**Games**:
```
game-card
├── card
├── badge (via game-status-badge)
└── button

team-roster
├── card
├── avatar
└── badge

create-game-form
├── form
├── select
└── button

join-game-button
├── button
├── dialog
└── select

game-status-badge
└── badge
```

**Players**:
```
player-card
├── card
├── player-avatar
│   ├── avatar
│   └── elo-badge
└── button

player-avatar
├── avatar
└── elo-badge
    └── badge

elo-badge
└── badge

stats-grid
└── card
```

**Leaderboard**:
```
leaderboard-table
├── table
├── avatar
├── rank-badge
│   └── badge
└── elo-badge
    └── badge

rank-badge
└── badge
```

**Forms**:
```
game-result-form
├── form
├── input
├── select
├── button
└── dialog
```

---

## Data Flow

### Typical Server → Client Flow

```
Server Component (async)
    ↓
Database Query
    ↓
Data Transform
    ↓
Props to Client Component
    ↓
Render UI Components
    ↓
User Interaction
    ↓
Client Event Handler
    ↓
Server Action
    ↓
Database Mutation
    ↓
Revalidate/Redirect
    ↓
Re-render
```

### Example: Join Game

```
1. User clicks "Join Game" button
   → JoinGameButton (client)

2. Opens dialog, selects Team A
   → Dialog with Select

3. Clicks "Join Team"
   → onJoin handler called

4. Handler calls server action
   → joinGame(gameId, "team_a")

5. Server action updates database
   → INSERT into game_players

6. Revalidate page
   → revalidatePath("/games/[id]")

7. Page re-renders with updated data
   → GameCard shows user in Team A
```

---

## Styling Patterns

### Component Wrapper Pattern
```tsx
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
    ...
  </CardHeader>
  ...
</Card>
```

### Grid Pattern
```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Flex Pattern
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Avatar />
    <div>...</div>
  </div>
  <Badge />
</div>
```

### Responsive Pattern
```tsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between">
  <div>Title</div>
  <div className="mt-4 md:mt-0">Action</div>
</div>
```

---

## State Management Patterns

### Server Component (No State)
```tsx
// Fetch on server, pass to client
async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}
```

### Client Component (Local State)
```tsx
"use client"
function Component() {
  const [isOpen, setIsOpen] = useState(false)
  return <Dialog open={isOpen} onOpenChange={setIsOpen} />
}
```

### Form State (React Hook Form)
```tsx
"use client"
function FormComponent() {
  const form = useForm({ resolver: zodResolver(schema) })
  return <Form {...form}>...</Form>
}
```

### Loading State
```tsx
"use client"
function Component() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleAction() {
    setIsLoading(true)
    await serverAction()
    setIsLoading(false)
  }

  return isLoading ? <Skeleton /> : <Content />
}
```

---

## Component Composition Examples

### Nested Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Game Details</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Team A</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Team roster */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Team B</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Team roster */}
        </CardContent>
      </Card>
    </div>
  </CardContent>
</Card>
```

### Form in Dialog
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Create Game</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>New Game</DialogTitle>
    </DialogHeader>
    <CreateGameForm onSubmit={handleSubmit} />
  </DialogContent>
</Dialog>
```

### Tabs with Cards
```tsx
<Tabs defaultValue="active">
  <TabsList>
    <TabsTrigger value="active">Active Games</TabsTrigger>
    <TabsTrigger value="completed">Completed</TabsTrigger>
  </TabsList>
  <TabsContent value="active">
    <div className="grid gap-6 md:grid-cols-2">
      {activeGames.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  </TabsContent>
  <TabsContent value="completed">
    {/* Completed games */}
  </TabsContent>
</Tabs>
```

---

This tree shows how components work together to build the Basketball ELO application. Each component is designed to be composable, reusable, and follows consistent patterns.
