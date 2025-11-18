# Database Schema Diagram

## Entity Relationship Diagram (Text Format)

```
┌─────────────────────────────────────────────────────────────────────┐
│                           auth.users (Supabase Auth)                │
│─────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                     │
│ • email                                                             │
│ • encrypted_password                                                │
│ • ... (other auth fields)                                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:1
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              profiles                               │
│─────────────────────────────────────────────────────────────────────│
│ • id (UUID, PK, FK → auth.users)                                   │
│ • display_name (TEXT, NOT NULL)                                    │
│ • avatar_url (TEXT)                                                │
│ • current_elo (INTEGER, DEFAULT 1500)                              │
│ • peak_elo (INTEGER, DEFAULT 1500)                                 │
│ • games_played (INTEGER, DEFAULT 0)                                │
│ • wins (INTEGER, DEFAULT 0)                                        │
│ • losses (INTEGER, DEFAULT 0)                                      │
│ • created_at (TIMESTAMPTZ)                                         │
│ • updated_at (TIMESTAMPTZ)                                         │
│                                                                     │
│ Indexes:                                                            │
│   - idx_profiles_display_name (display_name)                       │
│   - idx_profiles_current_elo (current_elo DESC)                    │
│   - idx_profiles_games_played (games_played DESC)                  │
│                                                                     │
│ Constraints:                                                        │
│   - display_name: 1-50 chars                                       │
│   - current_elo: 0-5000                                            │
│   - peak_elo: 0-5000                                               │
│   - wins + losses <= games_played                                  │
└─────────────────────────────────────────────────────────────────────┘
                │                                   │
                │ 1:N (host)                       │ 1:N
                ▼                                   ▼
┌──────────────────────────────┐    ┌──────────────────────────────────┐
│           games              │    │      game_participants           │
│──────────────────────────────│    │──────────────────────────────────│
│ • id (UUID, PK)              │◄───│ • id (UUID, PK)                  │
│ • host_id (UUID, FK)         │1:N │ • game_id (UUID, FK → games)     │
│ • status (TEXT)              │    │ • player_id (UUID, FK → profiles)│
│ • team_size (INTEGER)        │    │ • team (TEXT: a/b)               │
│ • team_a_score (INTEGER)     │    │ • elo_before (INTEGER)           │
│ • team_b_score (INTEGER)     │    │ • elo_after (INTEGER)            │
│ • winning_team (TEXT)        │    │ • elo_change (INTEGER)           │
│ • created_at (TIMESTAMPTZ)   │    │ • joined_at (TIMESTAMPTZ)        │
│ • started_at (TIMESTAMPTZ)   │    │                                  │
│ • completed_at (TIMESTAMPTZ) │    │ Indexes:                         │
│                              │    │   - idx_gp_game_id (game_id)     │
│ Indexes:                     │    │   - idx_gp_player_id (player_id) │
│   - idx_games_host_id        │    │   - idx_gp_team (team)           │
│   - idx_games_status         │    │   - idx_gp_player_joined         │
│   - idx_games_created_at     │    │                                  │
│   - idx_games_completed_at   │    │ Constraints:                     │
│   - idx_games_status_created │    │   - UNIQUE(game_id, player_id)   │
│                              │    │   - team IN ('team_a', 'team_b') │
│ Constraints:                 │    │   - elo_before: 0-5000           │
│   - status: pending/in_prog/ │    │   - elo_after: 0-5000            │
│     completed/cancelled      │    │   - elo_change calculated        │
│   - team_size: 1-5           │    └──────────────────────────────────┘
│   - scores >= 0              │                   │
│   - winner matches scores    │                   │ 1:N
│   - completed has scores     │                   ▼
└──────────────────────────────┘    ┌──────────────────────────────────┐
                │                   │         elo_history              │
                │ 1:N               │──────────────────────────────────│
                └───────────────────┤ • id (UUID, PK)                  │
                                    │ • player_id (UUID, FK → profiles)│
                                    │ • game_id (UUID, FK → games)     │
                                    │ • elo_before (INTEGER)           │
                                    │ • elo_after (INTEGER)            │
                                    │ • elo_change (INTEGER)           │
                                    │ • recorded_at (TIMESTAMPTZ)      │
                                    │                                  │
                                    │ Indexes:                         │
                                    │   - idx_eh_player_id (player_id) │
                                    │   - idx_eh_player_recorded       │
                                    │   - idx_eh_recorded_at           │
                                    │                                  │
                                    │ Constraints:                     │
                                    │   - elo_before: 0-5000           │
                                    │   - elo_after: 0-5000            │
                                    │   - elo_change calculated        │
                                    └──────────────────────────────────┘
```

## Views

```
┌─────────────────────────────────────────────────────────────────────┐
│                         leaderboard (VIEW)                          │
│─────────────────────────────────────────────────────────────────────│
│ SELECT from profiles:                                               │
│   • All profile columns                                             │
│   • win_percentage (calculated)                                     │
│ WHERE games_played > 0                                              │
│ ORDER BY current_elo DESC, games_played DESC                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     game_history_view (VIEW)                        │
│─────────────────────────────────────────────────────────────────────│
│ SELECT from games + profiles + game_participants:                   │
│   • All game columns                                                │
│   • host_name, host_id                                              │
│   • total_players                                                   │
│   • team_a_players, team_b_players                                  │
│ GROUP BY game, host                                                 │
│ ORDER BY created_at DESC                                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Functions

```
┌─────────────────────────────────────────────────────────────────────┐
│ calculate_expected_score(player_elo, opponent_avg_elo)             │
│─────────────────────────────────────────────────────────────────────│
│ Returns: NUMERIC (0-1)                                              │
│ Formula: 1 / (1 + 10^((opponent - player) / 400))                   │
│ Type: IMMUTABLE                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ update_elo_ratings(p_game_id)                                       │
│─────────────────────────────────────────────────────────────────────│
│ 1. Validates game is completed                                      │
│ 2. Calculates average ELO per team                                  │
│ 3. For each participant:                                            │
│    a. Calculate expected score vs opponent team avg                 │
│    b. Apply formula: new_elo = old + K*(actual - expected)          │
│    c. Update game_participants table                                │
│    d. Update profiles table (current_elo, peak_elo)                 │
│ 4. Triggers record elo_history automatically                        │
│                                                                     │
│ K-factor: 32                                                        │
│ Actual score: Win=1, Draw=0.5, Loss=0                               │
└─────────────────────────────────────────────────────────────────────┘
```

## Triggers

```
┌─────────────────────────────────────────────────────────────────────┐
│ trigger_update_profile_stats                                        │
│─────────────────────────────────────────────────────────────────────│
│ ON: games (AFTER UPDATE)                                            │
│ WHEN: status changes to 'completed'                                 │
│ ACTION: Update all participants' profiles:                          │
│   - Increment games_played                                          │
│   - Increment wins (if won) or losses (if lost)                     │
│   - Update updated_at timestamp                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ trigger_record_elo_history                                          │
│─────────────────────────────────────────────────────────────────────│
│ ON: game_participants (AFTER UPDATE)                                │
│ WHEN: elo_after changes from NULL to a value                        │
│ ACTION: Insert record into elo_history with:                        │
│   - player_id, game_id                                              │
│   - elo_before, elo_after, elo_change                               │
│   - recorded_at (current timestamp)                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ trigger_profiles_updated_at                                         │
│─────────────────────────────────────────────────────────────────────│
│ ON: profiles (BEFORE UPDATE)                                        │
│ ACTION: Set updated_at = NOW()                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Row Level Security (RLS) Policies

```
┌─────────────────────────────────────────────────────────────────────┐
│ profiles                                                            │
│─────────────────────────────────────────────────────────────────────│
│ SELECT:  Everyone (true)                                            │
│ INSERT:  Users can create their own (auth.uid() = id)              │
│ UPDATE:  Users can update their own (auth.uid() = id)              │
│ DELETE:  Cascade from auth.users                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ games                                                               │
│─────────────────────────────────────────────────────────────────────│
│ SELECT:  Everyone (true)                                            │
│ INSERT:  Authenticated users (auth.uid() = host_id)                │
│ UPDATE:  Game host only (auth.uid() = host_id)                     │
│ DELETE:  Game host only, if not completed                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ game_participants                                                   │
│─────────────────────────────────────────────────────────────────────│
│ SELECT:  Everyone (true)                                            │
│ INSERT:  Game host only                                             │
│ UPDATE:  Game host only                                             │
│ DELETE:  Game host only                                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ elo_history                                                         │
│─────────────────────────────────────────────────────────────────────│
│ SELECT:  Everyone (true)                                            │
│ INSERT:  Triggers only (no policy)                                 │
│ UPDATE:  Not allowed (no policy)                                   │
│ DELETE:  Not allowed (no policy)                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Game Lifecycle

```
1. CREATE GAME
   ┌──────────────────┐
   │ User creates game│
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ INSERT into games│
   │ status: pending  │
   └──────────────────┘

2. PLAYERS JOIN
   ┌──────────────────────────┐
   │ Players join teams       │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ INSERT into              │
   │ game_participants        │
   │ with current elo_before  │
   └──────────────────────────┘

3. START GAME
   ┌──────────────────────────┐
   │ Host starts game         │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ UPDATE games             │
   │ status: in_progress      │
   │ started_at: NOW()        │
   └──────────────────────────┘

4. COMPLETE GAME
   ┌──────────────────────────┐
   │ Host submits final scores│
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ UPDATE games             │
   │ status: completed        │
   │ team_a_score, team_b_score│
   │ winning_team            │
   │ completed_at: NOW()      │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ TRIGGER:                 │
   │ update_profile_stats()   │
   │ - Increment games_played │
   │ - Increment wins/losses  │
   └──────────────────────────┘

5. CALCULATE ELO
   ┌──────────────────────────┐
   │ CALL update_elo_ratings()│
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ For each participant:    │
   │ - Calculate expected     │
   │ - Calculate actual       │
   │ - Compute ELO change     │
   │ - UPDATE game_participants│
   │ - UPDATE profiles        │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ TRIGGER:                 │
   │ record_elo_history()     │
   │ - INSERT into elo_history│
   └──────────────────────────┘
```

## Index Usage Examples

```sql
-- Leaderboard query (uses idx_profiles_current_elo)
SELECT * FROM profiles
WHERE games_played > 0
ORDER BY current_elo DESC;

-- Player search (uses idx_profiles_display_name)
SELECT * FROM profiles
WHERE display_name ILIKE '%jordan%';

-- Find pending games (uses idx_games_status_created)
SELECT * FROM games
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Player game history (uses idx_game_participants_player_joined)
SELECT * FROM game_participants
WHERE player_id = 'uuid'
ORDER BY joined_at DESC;

-- Player ELO progression (uses idx_elo_history_player_recorded)
SELECT * FROM elo_history
WHERE player_id = 'uuid'
ORDER BY recorded_at ASC;

-- Recent completed games (uses idx_games_completed_at)
SELECT * FROM games
WHERE status = 'completed'
ORDER BY completed_at DESC;
```

## Storage Estimates

Based on average usage:
- Profile: ~200 bytes per row
- Game: ~150 bytes per row
- Game Participant: ~100 bytes per row
- ELO History: ~80 bytes per row

Example for 1000 active players, 100 games/day:
- 1000 profiles: ~200 KB
- 36,500 games/year: ~5.5 MB
- 365,000 participants/year (avg 10 players/game): ~36.5 MB
- 365,000 ELO records/year: ~29.2 MB

Total: ~71 MB per year of data

With indexes: ~140-200 MB per year

This is very efficient and will scale well even to 10,000+ active players.

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Get Leaderboard | O(n log n) | Indexed on ELO, fast up to 100K players |
| Get Player Profile | O(1) | Primary key lookup |
| Get Player Games | O(log n) | Indexed on player_id + joined_at |
| Get Player ELO History | O(log n) | Indexed on player_id + recorded_at |
| Create Game | O(1) | Simple insert |
| Join Game | O(1) | Simple insert with FK check |
| Complete Game | O(n) | n = participants, typically 2-10 |
| Calculate ELO | O(n) | n = participants, typically 2-10 |
| Search Players | O(log n) | Indexed text search |

All operations are well-optimized and should perform sub-100ms even with millions of records.
