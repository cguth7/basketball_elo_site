# Quick Start Guide

Get your Basketball ELO database up and running in minutes.

## Prerequisites

- Supabase account (free tier works great)
- Supabase CLI installed: `npm install -g supabase`
- Node.js 18+ and npm/pnpm

## Option 1: Using Supabase CLI (Recommended)

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Initialize Supabase (if not already done)

```bash
cd /path/to/basketball_elo_site
supabase init
```

### Step 3: Link to Your Supabase Project

```bash
supabase link --project-ref your-project-ref
```

Get your project ref from: https://app.supabase.com/project/_/settings/general

### Step 4: Apply Migrations

```bash
# Apply all migrations
supabase db push

# Or if you want to start fresh
supabase db reset
```

### Step 5: Verify Migration

```bash
# Check migration status
supabase migration list

# Test the database
supabase db remote shell
```

In the SQL shell:
```sql
-- Should return empty (no profiles yet)
SELECT COUNT(*) FROM profiles;

-- Test the ELO calculation function
SELECT calculate_expected_score(1500, 1600);

-- Exit
\q
```

---

## Option 2: Using Supabase Dashboard

### Step 1: Copy Migration SQL

1. Go to: https://app.supabase.com/project/_/sql/new
2. Open `/supabase/migrations/20250118000000_initial_schema.sql`
3. Copy entire contents

### Step 2: Execute Migration

1. Paste SQL into the SQL Editor
2. Click "Run" button
3. Wait for completion (should take 2-3 seconds)

### Step 3: Optional - Add Seed Data

1. Open `/supabase/migrations/20250118000001_seed_data.sql`
2. Copy entire contents
3. Paste and run in SQL Editor

**Note:** Seed data uses placeholder UUIDs and will fail unless you have matching auth.users. Skip this for production.

### Step 4: Verify Tables

1. Go to: https://app.supabase.com/project/_/editor
2. You should see tables:
   - `profiles`
   - `games`
   - `game_participants`
   - `elo_history`

---

## Option 3: Local Development with Supabase

### Step 1: Start Local Supabase

```bash
supabase start
```

This will start:
- PostgreSQL database (port 54322)
- API server (port 54321)
- Studio (port 54323)
- Email testing (port 54324)

### Step 2: Apply Migrations

```bash
supabase db reset
```

### Step 3: Access Local Studio

Open: http://localhost:54323

You can now interact with your local database through the Studio UI.

### Step 4: Get Local Credentials

```bash
supabase status
```

Copy the `API URL` and `anon key` to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Next Steps

### 1. Set Up Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: https://app.supabase.com/project/_/settings/api

### 2. Install Supabase Client

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 3. Create Supabase Client

Create `/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 4. Generate TypeScript Types

```bash
supabase gen types typescript --project-id your-project-ref > types/supabase.ts
```

### 5. Test the Integration

Create a test page to verify everything works:

```typescript
// app/test/page.tsx
import { createClient } from '@/lib/supabase/client'

export default async function TestPage() {
  const supabase = createClient()

  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <h1>Database Test</h1>
      <p>Total profiles: {count}</p>
    </div>
  )
}
```

Visit: http://localhost:3000/test

---

## Testing the Schema

### Test 1: Create a Profile (via SQL)

```sql
-- Note: In production, profiles are created automatically on signup
-- This is just for testing

INSERT INTO profiles (id, display_name)
VALUES (
  gen_random_uuid(),
  'Test Player'
);

SELECT * FROM profiles;
```

### Test 2: Create a Game

```sql
-- Get a player ID
SELECT id FROM profiles LIMIT 1;

-- Create a game (replace UUID with actual player ID)
INSERT INTO games (host_id, team_size, status)
VALUES (
  'player-uuid-here',
  3,
  'pending'
);

SELECT * FROM games;
```

### Test 3: Add Participants

```sql
-- Get game and player IDs
SELECT id FROM games LIMIT 1;
SELECT id, current_elo FROM profiles LIMIT 2;

-- Add two participants (replace UUIDs)
INSERT INTO game_participants (game_id, player_id, team, elo_before)
VALUES
  ('game-uuid', 'player1-uuid', 'team_a', 1500),
  ('game-uuid', 'player2-uuid', 'team_b', 1500);

SELECT * FROM game_participants;
```

### Test 4: Complete Game and Calculate ELO

```sql
-- Complete the game (replace game-uuid)
UPDATE games
SET
  status = 'completed',
  team_a_score = 21,
  team_b_score = 18,
  winning_team = 'team_a',
  completed_at = NOW()
WHERE id = 'game-uuid';

-- Calculate ELO ratings
SELECT update_elo_ratings('game-uuid');

-- Check results
SELECT
  p.display_name,
  gp.team,
  gp.elo_before,
  gp.elo_after,
  gp.elo_change
FROM game_participants gp
JOIN profiles p ON gp.player_id = p.id
WHERE gp.game_id = 'game-uuid';

-- Check ELO history
SELECT * FROM elo_history;

-- Check updated profiles
SELECT display_name, current_elo, games_played, wins, losses
FROM profiles;
```

---

## Common Issues & Solutions

### Issue: "relation 'profiles' does not exist"
**Solution:** Migrations not applied. Run `supabase db push` or apply via dashboard.

### Issue: "permission denied for table profiles"
**Solution:** RLS policies are working. You need to be authenticated to write data.

### Issue: "insert or update on table violates foreign key constraint"
**Solution:** Trying to create a profile for a user that doesn't exist in auth.users. Sign up first.

### Issue: "ELO ratings already calculated for this game"
**Solution:** This is by design. You can't recalculate ELO for a completed game.

### Issue: Seed data fails with FK errors
**Solution:** Seed data expects auth.users to exist. Either create real users first or skip seed data.

---

## Verification Checklist

After setup, verify:

- [ ] All 4 tables exist (profiles, games, game_participants, elo_history)
- [ ] All 2 views exist (leaderboard, game_history_view)
- [ ] All 4 functions exist (calculate_expected_score, update_elo_ratings, etc.)
- [ ] All 3 triggers exist (update_profile_stats, record_elo_history, profiles_updated_at)
- [ ] RLS is enabled on all tables
- [ ] All indexes are created
- [ ] Can create a test profile
- [ ] Can create a test game
- [ ] Can add participants
- [ ] Can complete game and calculate ELO

### Quick Verification SQL

```sql
-- Check tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check views
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public';

-- Check functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public';

-- Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## What's Next?

1. **Enable Authentication**: Set up Supabase Auth for user signups
2. **Build UI Components**: Create forms for game creation, joining, etc.
3. **Implement Real-time**: Add subscriptions for live game updates
4. **Add Leaderboard**: Display top players using the leaderboard view
5. **Create Charts**: Visualize ELO progression using elo_history
6. **Add Search**: Implement player search functionality

---

## Resources

- **Schema Documentation**: `/supabase/README.md`
- **Integration Examples**: `/supabase/INTEGRATION_GUIDE.md`
- **Visual Diagram**: `/supabase/SCHEMA_DIAGRAM.md`
- **Useful Queries**: `/supabase/useful_queries.sql`
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## Support

For questions or issues:
1. Check the troubleshooting section in `/supabase/README.md`
2. Review the integration guide for code examples
3. Consult Supabase documentation
4. Check PostgreSQL documentation for SQL questions

Happy coding! 🏀
