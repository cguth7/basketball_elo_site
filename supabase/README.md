# Basketball ELO Tracking - Database Schema

This directory contains all database migrations and schema documentation for the Basketball ELO tracking application.

## Directory Structure

```
supabase/
├── migrations/
│   ├── 20250118000000_initial_schema.sql  # Main schema, RLS policies, functions, triggers
│   └── 20250118000001_seed_data.sql       # Optional seed data for development/testing
└── README.md                               # This file
```

## Database Schema Overview

### Tables

#### `profiles`
Extends `auth.users` with player-specific data and ELO tracking.

**Key Columns:**
- `id` (UUID, PK): References auth.users(id)
- `display_name` (TEXT): Player's display name (1-50 chars)
- `avatar_url` (TEXT): Optional avatar URL
- `current_elo` (INTEGER): Current ELO rating (default: 1500)
- `peak_elo` (INTEGER): Highest ELO ever achieved
- `games_played`, `wins`, `losses` (INTEGER): Game statistics
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Indexes:**
- `idx_profiles_display_name`: For player search
- `idx_profiles_current_elo`: For leaderboard queries (DESC)
- `idx_profiles_games_played`: For filtering active players

---

#### `games`
Stores metadata for each basketball game.

**Key Columns:**
- `id` (UUID, PK): Game identifier
- `host_id` (UUID, FK → profiles): Game creator
- `status` (TEXT): `pending`, `in_progress`, `completed`, `cancelled`
- `team_size` (INTEGER): Players per team (1-5)
- `team_a_score`, `team_b_score` (INTEGER): Final scores
- `winning_team` (TEXT): `team_a`, `team_b`, or `draw`
- `created_at`, `started_at`, `completed_at` (TIMESTAMPTZ): Timestamps

**Constraints:**
- Completed games must have scores and a winner
- Winner must match score comparison
- Team size between 1-5

**Indexes:**
- `idx_games_host_id`: Find games by host
- `idx_games_status`: Filter by status
- `idx_games_created_at`: Chronological ordering
- `idx_games_completed_at`: Completed game history
- `idx_games_status_created`: Composite for pending game queries

---

#### `game_participants`
Links players to games and tracks individual ELO changes.

**Key Columns:**
- `id` (UUID, PK): Participant record identifier
- `game_id` (UUID, FK → games): Associated game
- `player_id` (UUID, FK → profiles): Player
- `team` (TEXT): `team_a` or `team_b`
- `elo_before` (INTEGER): ELO rating before game
- `elo_after` (INTEGER): ELO rating after game (NULL until game completes)
- `elo_change` (INTEGER): Change in ELO (calculated)
- `joined_at` (TIMESTAMPTZ): When player joined game

**Constraints:**
- Unique (game_id, player_id): Prevents duplicate entries
- ELO change must match: `elo_after - elo_before`

**Indexes:**
- `idx_game_participants_game_id`: Find participants by game
- `idx_game_participants_player_id`: Find games by player
- `idx_game_participants_team`: Filter by team
- `idx_game_participants_player_joined`: Player history chronologically

---

#### `elo_history`
Historical ELO ratings for tracking player progression over time.

**Key Columns:**
- `id` (UUID, PK): History record identifier
- `player_id` (UUID, FK → profiles): Player
- `game_id` (UUID, FK → games): Game that caused ELO change
- `elo_before`, `elo_after`, `elo_change` (INTEGER): ELO values
- `recorded_at` (TIMESTAMPTZ): When change was recorded

**Purpose:** Powers ELO progression graphs and historical analysis.

**Indexes:**
- `idx_elo_history_player_id`: Find history by player
- `idx_elo_history_player_recorded`: Chronological player history
- `idx_elo_history_recorded_at`: Time-based queries

---

### Functions

#### `calculate_expected_score(player_elo, opponent_avg_elo)`
Calculates the expected score (probability of winning) using the standard ELO formula:

```
Expected Score = 1 / (1 + 10^((opponent_elo - player_elo) / 400))
```

**Returns:** NUMERIC between 0 and 1

---

#### `update_elo_ratings(game_id)`
Main function to update ELO ratings after a game completes.

**Process:**
1. Validates game is completed and ELO not already calculated
2. Calculates average ELO for each team
3. For each player:
   - Calculates expected score vs opponent team average
   - Applies ELO formula: `new_elo = old_elo + K * (actual - expected)`
   - K-factor = 32 (standard)
4. Updates `game_participants` and `profiles` tables
5. Triggers automatically record ELO history

**Usage:**
```sql
SELECT update_elo_ratings('game-uuid-here');
```

**Important:** This function uses transactions to prevent race conditions.

---

### Triggers

#### `trigger_update_profile_stats`
Automatically updates player statistics when a game completes:
- Increments `games_played`
- Increments `wins` or `losses` based on outcome
- Updates `updated_at` timestamp

#### `trigger_record_elo_history`
Automatically inserts a record into `elo_history` when a player's ELO changes in `game_participants`.

#### `trigger_profiles_updated_at`
Automatically updates the `updated_at` timestamp on profile modifications.

---

### Row Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

#### Profiles
- ✅ **SELECT**: Everyone can view all profiles
- ✅ **INSERT**: Users can create their own profile
- ✅ **UPDATE**: Users can update their own profile
- ❌ **DELETE**: Not allowed (cascade from auth.users)

#### Games
- ✅ **SELECT**: Everyone can view all games
- ✅ **INSERT**: Authenticated users can create games
- ✅ **UPDATE**: Hosts can update their own games
- ✅ **DELETE**: Hosts can delete their own games (if not completed)

#### Game Participants
- ✅ **SELECT**: Everyone can view all participants
- ✅ **INSERT**: Game hosts can add participants
- ✅ **UPDATE**: Game hosts can update participants
- ✅ **DELETE**: Game hosts can remove participants

#### ELO History
- ✅ **SELECT**: Everyone can view history
- ❌ **INSERT/UPDATE/DELETE**: Only triggers can modify

---

### Views

#### `leaderboard`
Pre-calculated leaderboard with win percentages.

**Columns:**
- All profile fields
- `win_percentage`: Calculated as `(wins / games_played) * 100`

**Ordering:** By `current_elo DESC`, then `games_played DESC`

**Filtering:** Only includes players with `games_played > 0`

---

#### `game_history_view`
Game history with participant counts and host details.

**Columns:**
- All game fields
- `host_name`, `host_id`
- `total_players`, `team_a_players`, `team_b_players`

**Ordering:** By `created_at DESC`

---

## ELO Rating System

### Algorithm
This application uses the standard ELO rating system with modifications for team games:

1. **Expected Score Calculation:**
   ```
   E_a = 1 / (1 + 10^((R_b - R_a) / 400))
   ```
   Where:
   - `E_a` = Expected score for player A
   - `R_a` = Player A's rating
   - `R_b` = Average rating of opposing team

2. **Rating Update:**
   ```
   R_new = R_old + K * (S - E)
   ```
   Where:
   - `K` = K-factor (32)
   - `S` = Actual score (1 for win, 0.5 for draw, 0 for loss)
   - `E` = Expected score

3. **Team Games:**
   - Each player is rated individually
   - Expected score is calculated against the opposing team's average ELO
   - All players on the same team receive the same ELO change amount

### K-Factor
- **Value:** 32 (standard competitive rating)
- **Rationale:** Balances rating stability with responsiveness to performance

### Starting ELO
- **Default:** 1500
- **Range:** 0-5000 (enforced by constraints)

---

## Migration Guide

### Applying Migrations

#### Using Supabase CLI (Recommended)

1. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. **Apply migrations:**
   ```bash
   supabase db push
   ```

3. **Verify migration status:**
   ```bash
   supabase migration list
   ```

#### Using Supabase Dashboard

1. Go to your project's SQL Editor
2. Copy contents of migration file
3. Execute SQL
4. Verify in Table Editor

### Migration Files

#### `20250118000000_initial_schema.sql`
- **Required:** Yes
- **Description:** Core schema with all tables, functions, triggers, and RLS policies
- **Safe to run multiple times:** No (will error if objects exist)

#### `20250118000001_seed_data.sql`
- **Required:** No (development/testing only)
- **Description:** Sample players and games for testing
- **Safe to run multiple times:** Yes (uses `ON CONFLICT DO NOTHING`)
- **Production:** Remove or comment out this migration

---

## Development Workflow

### Creating a New Profile (On User Signup)

When a user signs up via Supabase Auth:

```typescript
// After successful signup
const { data: profile, error } = await supabase
  .from('profiles')
  .insert({
    id: user.id, // From auth.users
    display_name: 'Player Name',
    avatar_url: 'https://...' // Optional
  })
  .select()
  .single();
```

### Creating a Game

```typescript
const { data: game, error } = await supabase
  .from('games')
  .insert({
    host_id: user.id,
    team_size: 3, // 3v3 game
    status: 'pending'
  })
  .select()
  .single();
```

### Adding Players to Game

```typescript
const { error } = await supabase
  .from('game_participants')
  .insert([
    {
      game_id: gameId,
      player_id: playerId,
      team: 'team_a',
      elo_before: playerCurrentElo
    }
  ]);
```

### Completing a Game and Updating ELO

```typescript
// 1. Update game with final scores
const { error: gameError } = await supabase
  .from('games')
  .update({
    status: 'completed',
    team_a_score: 21,
    team_b_score: 18,
    winning_team: 'team_a',
    completed_at: new Date().toISOString()
  })
  .eq('id', gameId);

// 2. Calculate ELO ratings
const { error: eloError } = await supabase
  .rpc('update_elo_ratings', { p_game_id: gameId });

// Triggers will automatically:
// - Update profile stats (games_played, wins, losses)
// - Record ELO history for graphing
```

### Fetching Leaderboard

```typescript
const { data: leaderboard, error } = await supabase
  .from('leaderboard')
  .select('*')
  .limit(50);
```

### Fetching Player ELO History

```typescript
const { data: history, error } = await supabase
  .from('elo_history')
  .select('*')
  .eq('player_id', playerId)
  .order('recorded_at', { ascending: true });
```

---

## Performance Considerations

### Indexes
All critical queries are indexed:
- Leaderboard queries: `idx_profiles_current_elo`
- Player search: `idx_profiles_display_name`
- Game history: `idx_games_completed_at`
- Player game history: `idx_game_participants_player_joined`
- ELO progression: `idx_elo_history_player_recorded`

### Query Optimization Tips

1. **Leaderboard:** Use the `leaderboard` view instead of raw `profiles` table
2. **Game History:** Use `game_history_view` for summary data
3. **Player Stats:** Profile data is denormalized (games_played, wins, losses) for fast access
4. **ELO History:** Indexed by player and time for efficient graph queries

---

## Security Notes

### RLS Policies
- All tables have RLS enabled
- Public read access for game data (required for leaderboards)
- Write access restricted to authenticated users
- Users can only modify their own profiles
- Game hosts control their own games

### Data Integrity
- Foreign key constraints prevent orphaned records
- Check constraints validate data ranges
- Triggers maintain data consistency automatically
- Unique constraints prevent duplicate participants

### Best Practices
1. **Never disable RLS** in production
2. **Use transactions** when modifying related tables
3. **Validate input** on the client before database calls
4. **Use the provided functions** (`update_elo_ratings`) instead of manual updates
5. **Monitor ELO history** for anomalies (rapid changes may indicate issues)

---

## Troubleshooting

### Common Issues

#### "Permission denied for table profiles"
- **Cause:** RLS policy not allowing access
- **Solution:** Ensure user is authenticated, check RLS policies

#### "ELO ratings already calculated for this game"
- **Cause:** Attempting to recalculate ELO for completed game
- **Solution:** This is by design to prevent double-counting

#### "Game is not completed"
- **Cause:** Trying to calculate ELO before marking game as completed
- **Solution:** Update game status and scores first

#### "Constraint violation: unique_player_per_game"
- **Cause:** Attempting to add same player twice to one game
- **Solution:** Check existing participants before adding

### Database Reset (Development Only)

To reset the database and start fresh:

```bash
supabase db reset
```

**Warning:** This will delete all data!

---

## Testing

### Test Queries

#### Verify Profile Creation
```sql
SELECT * FROM profiles LIMIT 5;
```

#### Check Game Participant Counts
```sql
SELECT
  g.id,
  g.status,
  COUNT(gp.player_id) as player_count
FROM games g
LEFT JOIN game_participants gp ON g.id = gp.game_id
GROUP BY g.id;
```

#### Validate ELO Calculations
```sql
SELECT
  p.display_name,
  gp.elo_before,
  gp.elo_after,
  gp.elo_change,
  g.winning_team,
  gp.team
FROM game_participants gp
JOIN profiles p ON gp.player_id = p.id
JOIN games g ON gp.game_id = g.id
WHERE g.status = 'completed'
ORDER BY gp.joined_at DESC;
```

#### Check ELO History
```sql
SELECT
  p.display_name,
  eh.elo_before,
  eh.elo_after,
  eh.elo_change,
  eh.recorded_at
FROM elo_history eh
JOIN profiles p ON eh.player_id = p.id
ORDER BY eh.recorded_at DESC
LIMIT 20;
```

---

## Future Enhancements

Potential schema improvements for future versions:

1. **Seasons/Leagues:** Add tables for organizing games into seasons
2. **Achievements:** Track milestones (win streaks, ELO peaks, etc.)
3. **Player Stats:** Detailed statistics (points scored, shooting %, etc.)
4. **Team Chemistry:** Track performance with specific teammates
5. **ELO Decay:** Implement rating decay for inactive players
6. **Rating Deviation:** Add confidence intervals (Glicko-2 system)
7. **Match History:** Detailed play-by-play tracking
8. **Notifications:** Game invites and result notifications

---

## Support

For issues or questions about the database schema:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Consult PostgreSQL documentation for SQL questions

---

## License

This database schema is part of the Basketball ELO Tracking application.
