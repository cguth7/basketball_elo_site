# Component Quick Reference

A quick cheat sheet for using Basketball ELO components.

## Import Patterns

```tsx
// From component index (recommended)
import { GameCard, PlayerCard, LeaderboardTable } from "@/components"

// Direct imports
import { GameCard } from "@/components/games/game-card"
import { Button } from "@/components/ui/button"
```

---

## Common Patterns

### Page Layout

```tsx
import { Container, PageHeader } from "@/components"

<Container>
  <PageHeader
    title="Page Title"
    description="Page description"
    action={<Button>Action</Button>}
  />

  <div className="mt-8">
    {/* Page content */}
  </div>
</Container>
```

### Loading States

```tsx
import { GameCardSkeleton } from "@/components"

{isLoading ? (
  <GameCardSkeleton />
) : (
  <GameCard game={game} />
)}
```

### Grid Layouts

```tsx
// 3 columns on desktop, 2 on tablet, 1 on mobile
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>

// 4 columns
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {stats.map(stat => <StatCard key={stat.label} />)}
</div>
```

---

## Component Snippets

### Display a Game

```tsx
<GameCard
  game={game}
  currentUserId={user.id}
  onJoin={() => handleJoin(game.id)}
  onView={() => router.push(`/games/${game.id}`)}
  onSubmitResult={() => setShowResultDialog(true)}
/>
```

### Display a Player

```tsx
// Full card
<PlayerCard
  player={player}
  rank={1}
  onViewProfile={() => router.push(`/players/${player.id}`)}
/>

// Compact card
<PlayerCard player={player} compact />

// Just avatar
<PlayerAvatar player={player} size="lg" showElo />
```

### Display Leaderboard

```tsx
<LeaderboardTable
  players={players}
  currentUserId={user.id}
  onPlayerClick={(id) => router.push(`/players/${id}`)}
/>
```

### Create Game Form

```tsx
<CreateGameForm
  onSubmit={async (data) => {
    await createGame(data.team_size)
  }}
  isLoading={isCreating}
/>
```

### Submit Game Result

```tsx
<GameResultForm
  gameId={game.id}
  teamAName="Team A"
  teamBName="Team B"
  onSubmit={async (data) => {
    await submitResult(game.id, data)
  }}
  isLoading={isSubmitting}
/>
```

### Show Player Stats

```tsx
import { PlayerStatsGrid } from "@/components"

<PlayerStatsGrid
  gamesPlayed={player.games_played}
  wins={player.wins}
  winRate={player.win_rate}
  eloRating={player.elo_rating}
  eloChange={player.elo_change}
/>
```

### Team Rosters

```tsx
<div className="grid gap-6 md:grid-cols-2">
  <TeamRoster
    teamName="Team A"
    players={game.team_a_players}
    teamSize={game.team_size}
    isWinner={game.winning_team === "team_a"}
  />
  <TeamRoster
    teamName="Team B"
    players={game.team_b_players}
    teamSize={game.team_size}
    isWinner={game.winning_team === "team_b"}
  />
</div>
```

---

## UI Components

### Buttons

```tsx
import { Button } from "@/components/ui/button"

<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Cards

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badges

```tsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Dialogs

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <div>Content</div>
    <DialogFooter>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Forms

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  name: z.string().min(1, "Required")
})

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Tables

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Value</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content 1
  </TabsContent>
  <TabsContent value="tab2">
    Content 2
  </TabsContent>
</Tabs>
```

### Select

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

<Select onValueChange={(value) => console.log(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

## Styling Utilities

### Common Tailwind Patterns

```tsx
// Spacing
className="space-y-4"          // Vertical spacing between children
className="gap-6"              // Grid/flex gap
className="p-6"                // Padding
className="mt-8"               // Margin top

// Responsive
className="md:grid-cols-2"     // 2 columns on medium screens
className="lg:flex-row"        // Row layout on large screens

// Colors
className="bg-primary"         // Basketball orange
className="text-muted-foreground"
className="border-border"

// Hover effects
className="hover:bg-accent"
className="hover:shadow-lg"
className="transition-colors"

// Flexbox
className="flex items-center justify-between"
className="flex flex-col gap-4"

// Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

### Common Component Classes

```tsx
// Container
className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"

// Card grid
className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"

// Stats grid
className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"

// Centered content
className="flex items-center justify-center min-h-screen"

// Text truncate
className="truncate"           // Single line
className="line-clamp-2"       // Two lines
```

---

## Color Reference

### Semantic Colors

```tsx
// Primary (Orange)
bg-primary text-primary-foreground

// Secondary
bg-secondary text-secondary-foreground

// Muted
bg-muted text-muted-foreground

// Destructive (Red)
bg-destructive text-destructive-foreground

// Accent
bg-accent text-accent-foreground
```

### Custom Colors

```tsx
// Success (Green)
bg-green-500 text-white

// Warning (Yellow)
bg-yellow-500 text-yellow-900

// Info (Blue)
bg-blue-500 text-white

// Basketball Orange
bg-orange-500 text-white
```

---

## Icons

Using lucide-react:

```tsx
import { Trophy, Medal, TrendingUp, Users, Calendar, Clock } from "lucide-react"

<Trophy className="h-4 w-4" />
<Users className="h-5 w-5 text-muted-foreground" />
```

---

## Server vs Client Components

### Server Components (default)
```tsx
// No "use client" directive
// Can use async/await
// Can access database directly
// Cannot use hooks or event handlers

export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}
```

### Client Components
```tsx
"use client"

// Can use hooks
// Can use event handlers
// Cannot be async
// Cannot access database directly

export default function Page() {
  const [state, setState] = useState()
  return <Component onClick={() => {}} />
}
```

---

## Common Patterns

### Fetch and Display

```tsx
// Server component
export default async function GamesPage() {
  const games = await getGames()

  return (
    <Container>
      <PageHeader title="Games" />
      <div className="grid gap-6 md:grid-cols-2">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </Container>
  )
}
```

### Form with Server Action

```tsx
// Server action
async function createGame(teamSize: number) {
  "use server"
  // Database logic
}

// Client component
"use client"
export default function CreateGame() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data) => {
    setIsLoading(true)
    await createGame(data.team_size)
    setIsLoading(false)
  }

  return <CreateGameForm onSubmit={handleSubmit} isLoading={isLoading} />
}
```

### Real-time Updates

```tsx
"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function RealtimeGames() {
  const [games, setGames] = useState([])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('games')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games'
      }, () => {
        fetchGames()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return <GamesList games={games} />
}
```

---

## Troubleshooting

### Common Issues

**Error: "use client" directive not found**
- Add `"use client"` at top of file for interactive components

**Error: Cannot use hooks in server component**
- Add `"use client"` to component or move to client component

**Type errors on component props**
- Check component prop types in source file
- Ensure all required props are provided

**Styling not applied**
- Check Tailwind class names
- Ensure globals.css is imported in layout
- Run `npm run dev` to rebuild

---

## Best Practices

1. **Use TypeScript**: All components are typed, use proper interfaces
2. **Server Components by default**: Only use client components when needed
3. **Loading states**: Always show loading skeletons
4. **Error handling**: Wrap components in error boundaries
5. **Accessibility**: Use proper ARIA labels and semantic HTML
6. **Mobile-first**: Design for mobile, enhance for desktop
7. **Consistent spacing**: Use Tailwind spacing scale (4, 6, 8, etc.)
8. **Color semantics**: Use semantic color names (primary, destructive, etc.)

---

For full documentation, see:
- `components/README.md` - Detailed component documentation
- `UI_COMPONENTS_SUMMARY.md` - Complete setup summary
