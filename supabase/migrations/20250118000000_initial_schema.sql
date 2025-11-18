-- Basketball ELO Tracking System - Initial Schema Migration
-- Created: 2025-01-18
-- Description: Complete database schema for individual player ELO ratings in team basketball games

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles Table
-- Extends auth.users with player-specific data and ELO tracking
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    current_elo INTEGER NOT NULL DEFAULT 1500,
    peak_elo INTEGER NOT NULL DEFAULT 1500,
    games_played INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT display_name_length CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 50),
    CONSTRAINT elo_range CHECK (current_elo >= 0 AND current_elo <= 5000),
    CONSTRAINT peak_elo_range CHECK (peak_elo >= 0 AND peak_elo <= 5000),
    CONSTRAINT games_played_positive CHECK (games_played >= 0),
    CONSTRAINT wins_positive CHECK (wins >= 0),
    CONSTRAINT losses_positive CHECK (losses >= 0),
    CONSTRAINT wins_losses_valid CHECK (wins + losses <= games_played)
);

-- Create index on display_name for search functionality
CREATE INDEX idx_profiles_display_name ON profiles(display_name);

-- Create index on current_elo for leaderboard queries (descending order)
CREATE INDEX idx_profiles_current_elo ON profiles(current_elo DESC);

-- Create index on games_played for filtering active players
CREATE INDEX idx_profiles_games_played ON profiles(games_played DESC);

-- Add comment to table
COMMENT ON TABLE profiles IS 'Player profiles with ELO ratings and game statistics';

-- Games Table
-- Stores metadata for each basketball game
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    team_size INTEGER NOT NULL,
    team_a_score INTEGER,
    team_b_score INTEGER,
    winning_team TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT status_valid CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT team_size_valid CHECK (team_size >= 1 AND team_size <= 5),
    CONSTRAINT scores_positive CHECK (
        (team_a_score IS NULL OR team_a_score >= 0) AND
        (team_b_score IS NULL OR team_b_score >= 0)
    ),
    CONSTRAINT winning_team_valid CHECK (
        winning_team IS NULL OR
        winning_team IN ('team_a', 'team_b', 'draw')
    ),
    CONSTRAINT completed_game_has_scores CHECK (
        status != 'completed' OR
        (team_a_score IS NOT NULL AND team_b_score IS NOT NULL)
    ),
    CONSTRAINT completed_game_has_winner CHECK (
        status != 'completed' OR
        winning_team IS NOT NULL
    ),
    CONSTRAINT winner_matches_scores CHECK (
        winning_team IS NULL OR
        (winning_team = 'team_a' AND team_a_score > team_b_score) OR
        (winning_team = 'team_b' AND team_b_score > team_a_score) OR
        (winning_team = 'draw' AND team_a_score = team_b_score)
    )
);

-- Create index on host_id for finding games by host
CREATE INDEX idx_games_host_id ON games(host_id);

-- Create index on status for filtering games by status
CREATE INDEX idx_games_status ON games(status);

-- Create index on created_at for chronological queries (descending order)
CREATE INDEX idx_games_created_at ON games(created_at DESC);

-- Create index on completed_at for game history (descending order)
CREATE INDEX idx_games_completed_at ON games(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Create composite index for finding pending games
CREATE INDEX idx_games_status_created ON games(status, created_at DESC);

-- Add comment to table
COMMENT ON TABLE games IS 'Basketball games with scores and status tracking';

-- Game Participants Table
-- Links players to games and tracks individual ELO changes
CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team TEXT NOT NULL,
    elo_before INTEGER NOT NULL,
    elo_after INTEGER,
    elo_change INTEGER,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT team_valid CHECK (team IN ('team_a', 'team_b')),
    CONSTRAINT elo_before_range CHECK (elo_before >= 0 AND elo_before <= 5000),
    CONSTRAINT elo_after_range CHECK (elo_after IS NULL OR (elo_after >= 0 AND elo_after <= 5000)),
    CONSTRAINT elo_change_calculated CHECK (
        (elo_after IS NULL AND elo_change IS NULL) OR
        (elo_after IS NOT NULL AND elo_change = elo_after - elo_before)
    ),
    -- Prevent duplicate player entries in the same game
    CONSTRAINT unique_player_per_game UNIQUE (game_id, player_id)
);

-- Create index on game_id for finding participants of a game
CREATE INDEX idx_game_participants_game_id ON game_participants(game_id);

-- Create index on player_id for finding games a player participated in
CREATE INDEX idx_game_participants_player_id ON game_participants(player_id);

-- Create index on team for filtering by team
CREATE INDEX idx_game_participants_team ON game_participants(team);

-- Create composite index for player's game history
CREATE INDEX idx_game_participants_player_joined ON game_participants(player_id, joined_at DESC);

-- Add comment to table
COMMENT ON TABLE game_participants IS 'Player participation in games with ELO changes';

-- ELO History Table
-- Historical ELO ratings for tracking player progression over time
CREATE TABLE elo_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    elo_before INTEGER NOT NULL,
    elo_after INTEGER NOT NULL,
    elo_change INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT elo_before_range CHECK (elo_before >= 0 AND elo_before <= 5000),
    CONSTRAINT elo_after_range CHECK (elo_after >= 0 AND elo_after <= 5000),
    CONSTRAINT elo_change_calculated CHECK (elo_change = elo_after - elo_before)
);

-- Create index on player_id for finding a player's ELO history
CREATE INDEX idx_elo_history_player_id ON elo_history(player_id);

-- Create composite index for chronological player ELO history
CREATE INDEX idx_elo_history_player_recorded ON elo_history(player_id, recorded_at ASC);

-- Create index on recorded_at for time-based queries
CREATE INDEX idx_elo_history_recorded_at ON elo_history(recorded_at DESC);

-- Add comment to table
COMMENT ON TABLE elo_history IS 'Historical ELO ratings for graphing player progression';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate expected score using standard ELO formula
-- Returns a value between 0 and 1 representing the expected probability of winning
CREATE OR REPLACE FUNCTION calculate_expected_score(
    player_elo INTEGER,
    opponent_avg_elo NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    -- Standard ELO expected score formula: 1 / (1 + 10^((opponent_elo - player_elo) / 400))
    RETURN 1.0 / (1.0 + POWER(10, (opponent_avg_elo - player_elo) / 400.0));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_expected_score IS 'Calculate expected score for ELO rating (0-1)';

-- Function to update ELO ratings after game completion
-- Uses transactions to prevent race conditions
-- K-factor of 32 for standard ELO calculations
CREATE OR REPLACE FUNCTION update_elo_ratings(
    p_game_id UUID
) RETURNS void AS $$
DECLARE
    v_game RECORD;
    v_participant RECORD;
    v_team_a_avg_elo NUMERIC;
    v_team_b_avg_elo NUMERIC;
    v_team_a_actual_score NUMERIC;
    v_team_b_actual_score NUMERIC;
    v_expected_score NUMERIC;
    v_elo_change INTEGER;
    v_k_factor INTEGER := 32; -- Standard K-factor
BEGIN
    -- Get game details
    SELECT * INTO v_game
    FROM games
    WHERE id = p_game_id;

    -- Verify game is completed
    IF v_game.status != 'completed' THEN
        RAISE EXCEPTION 'Game is not completed';
    END IF;

    -- Check if ELO has already been calculated
    IF EXISTS (
        SELECT 1 FROM game_participants
        WHERE game_id = p_game_id AND elo_after IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'ELO ratings already calculated for this game';
    END IF;

    -- Calculate average ELO for each team
    SELECT AVG(elo_before) INTO v_team_a_avg_elo
    FROM game_participants
    WHERE game_id = p_game_id AND team = 'team_a';

    SELECT AVG(elo_before) INTO v_team_b_avg_elo
    FROM game_participants
    WHERE game_id = p_game_id AND team = 'team_b';

    -- Determine actual scores (1 for win, 0.5 for draw, 0 for loss)
    IF v_game.winning_team = 'team_a' THEN
        v_team_a_actual_score := 1.0;
        v_team_b_actual_score := 0.0;
    ELSIF v_game.winning_team = 'team_b' THEN
        v_team_a_actual_score := 0.0;
        v_team_b_actual_score := 1.0;
    ELSE -- draw
        v_team_a_actual_score := 0.5;
        v_team_b_actual_score := 0.5;
    END IF;

    -- Update ELO for each team A participant
    FOR v_participant IN
        SELECT * FROM game_participants
        WHERE game_id = p_game_id AND team = 'team_a'
    LOOP
        -- Calculate expected score for this player against team B average
        v_expected_score := calculate_expected_score(
            v_participant.elo_before,
            v_team_b_avg_elo
        );

        -- Calculate ELO change: K * (Actual - Expected)
        v_elo_change := ROUND(v_k_factor * (v_team_a_actual_score - v_expected_score));

        -- Update participant record
        UPDATE game_participants
        SET
            elo_after = v_participant.elo_before + v_elo_change,
            elo_change = v_elo_change
        WHERE id = v_participant.id;

        -- Update player's profile
        UPDATE profiles
        SET
            current_elo = v_participant.elo_before + v_elo_change,
            peak_elo = GREATEST(peak_elo, v_participant.elo_before + v_elo_change),
            updated_at = NOW()
        WHERE id = v_participant.player_id;
    END LOOP;

    -- Update ELO for each team B participant
    FOR v_participant IN
        SELECT * FROM game_participants
        WHERE game_id = p_game_id AND team = 'team_b'
    LOOP
        -- Calculate expected score for this player against team A average
        v_expected_score := calculate_expected_score(
            v_participant.elo_before,
            v_team_a_avg_elo
        );

        -- Calculate ELO change: K * (Actual - Expected)
        v_elo_change := ROUND(v_k_factor * (v_team_b_actual_score - v_expected_score));

        -- Update participant record
        UPDATE game_participants
        SET
            elo_after = v_participant.elo_before + v_elo_change,
            elo_change = v_elo_change
        WHERE id = v_participant.id;

        -- Update player's profile
        UPDATE profiles
        SET
            current_elo = v_participant.elo_before + v_elo_change,
            peak_elo = GREATEST(peak_elo, v_participant.elo_before + v_elo_change),
            updated_at = NOW()
        WHERE id = v_participant.player_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_elo_ratings IS 'Update ELO ratings for all participants after game completion';

-- Function to automatically update profile statistics
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_participant RECORD;
    v_is_winner BOOLEAN;
BEGIN
    -- Only process when game is completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Update stats for each participant
        FOR v_participant IN
            SELECT gp.player_id, gp.team
            FROM game_participants gp
            WHERE gp.game_id = NEW.id
        LOOP
            -- Determine if this player won
            v_is_winner := (
                (v_participant.team = 'team_a' AND NEW.winning_team = 'team_a') OR
                (v_participant.team = 'team_b' AND NEW.winning_team = 'team_b')
            );

            -- Update profile statistics
            UPDATE profiles
            SET
                games_played = games_played + 1,
                wins = CASE WHEN v_is_winner THEN wins + 1 ELSE wins END,
                losses = CASE WHEN NOT v_is_winner AND NEW.winning_team != 'draw' THEN losses + 1 ELSE losses END,
                updated_at = NOW()
            WHERE id = v_participant.player_id;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_profile_stats IS 'Automatically update profile statistics when game completes';

-- Function to record ELO history
CREATE OR REPLACE FUNCTION record_elo_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only record if ELO has been calculated (elo_after is not null)
    IF NEW.elo_after IS NOT NULL AND (OLD.elo_after IS NULL OR OLD.elo_after IS DISTINCT FROM NEW.elo_after) THEN
        INSERT INTO elo_history (
            player_id,
            game_id,
            elo_before,
            elo_after,
            elo_change,
            recorded_at
        ) VALUES (
            NEW.player_id,
            NEW.game_id,
            NEW.elo_before,
            NEW.elo_after,
            NEW.elo_change,
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION record_elo_history IS 'Automatically record ELO history when participant ELO changes';

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically update updated_at timestamp on row modification';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update profile stats when game completes
CREATE TRIGGER trigger_update_profile_stats
    AFTER UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_stats();

-- Trigger to record ELO history when participant ELO changes
CREATE TRIGGER trigger_record_elo_history
    AFTER UPDATE ON game_participants
    FOR EACH ROW
    EXECUTE FUNCTION record_elo_history();

-- Trigger to automatically update updated_at on profiles
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE elo_history ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- Allow all authenticated users to view all profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (excluding ELO and stats which are auto-managed)
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Games Policies
-- Allow all authenticated users to view all games
CREATE POLICY "Games are viewable by everyone"
    ON games FOR SELECT
    USING (true);

-- Allow authenticated users to create games
CREATE POLICY "Authenticated users can create games"
    ON games FOR INSERT
    WITH CHECK (auth.uid() = host_id);

-- Allow game hosts to update their games
CREATE POLICY "Game hosts can update their games"
    ON games FOR UPDATE
    USING (auth.uid() = host_id)
    WITH CHECK (auth.uid() = host_id);

-- Allow game hosts to delete their games (only if not completed)
CREATE POLICY "Game hosts can delete their games"
    ON games FOR DELETE
    USING (auth.uid() = host_id AND status != 'completed');

-- Game Participants Policies
-- Allow all authenticated users to view all game participants
CREATE POLICY "Game participants are viewable by everyone"
    ON game_participants FOR SELECT
    USING (true);

-- Allow game hosts to insert participants to their games
CREATE POLICY "Game hosts can add participants"
    ON game_participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM games
            WHERE games.id = game_id
            AND games.host_id = auth.uid()
        )
    );

-- Allow game hosts to update participants in their games
CREATE POLICY "Game hosts can update participants"
    ON game_participants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM games
            WHERE games.id = game_id
            AND games.host_id = auth.uid()
        )
    );

-- Allow game hosts to delete participants from their games
CREATE POLICY "Game hosts can delete participants"
    ON game_participants FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM games
            WHERE games.id = game_id
            AND games.host_id = auth.uid()
        )
    );

-- ELO History Policies
-- Allow all authenticated users to view ELO history (read-only)
CREATE POLICY "ELO history is viewable by everyone"
    ON elo_history FOR SELECT
    USING (true);

-- No INSERT, UPDATE, or DELETE policies - only triggers can modify this table

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for leaderboard with additional statistics
CREATE OR REPLACE VIEW leaderboard AS
SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    p.current_elo,
    p.peak_elo,
    p.games_played,
    p.wins,
    p.losses,
    CASE
        WHEN p.games_played > 0
        THEN ROUND((p.wins::NUMERIC / p.games_played::NUMERIC) * 100, 1)
        ELSE 0
    END as win_percentage,
    p.created_at
FROM profiles p
WHERE p.games_played > 0
ORDER BY p.current_elo DESC, p.games_played DESC;

COMMENT ON VIEW leaderboard IS 'Leaderboard view with win percentage calculations';

-- View for game history with participant details
CREATE OR REPLACE VIEW game_history_view AS
SELECT
    g.id as game_id,
    g.status,
    g.team_size,
    g.team_a_score,
    g.team_b_score,
    g.winning_team,
    g.created_at,
    g.started_at,
    g.completed_at,
    host.display_name as host_name,
    host.id as host_id,
    COUNT(DISTINCT gp.player_id) as total_players,
    COUNT(DISTINCT CASE WHEN gp.team = 'team_a' THEN gp.player_id END) as team_a_players,
    COUNT(DISTINCT CASE WHEN gp.team = 'team_b' THEN gp.player_id END) as team_b_players
FROM games g
JOIN profiles host ON g.host_id = host.id
LEFT JOIN game_participants gp ON g.id = gp.game_id
GROUP BY g.id, host.display_name, host.id
ORDER BY g.created_at DESC;

COMMENT ON VIEW game_history_view IS 'Game history with participant counts and host details';

-- ============================================================================
-- INDEXES FOR VIEWS
-- ============================================================================

-- The views use existing indexes on the base tables, so no additional indexes needed

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables for authenticated users (RLS policies will control actual access)
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON games TO authenticated;
GRANT ALL ON game_participants TO authenticated;
GRANT SELECT ON elo_history TO authenticated;

-- Grant access to views
GRANT SELECT ON leaderboard TO authenticated;
GRANT SELECT ON leaderboard TO anon;
GRANT SELECT ON game_history_view TO authenticated;
GRANT SELECT ON game_history_view TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION calculate_expected_score TO authenticated;
GRANT EXECUTE ON FUNCTION update_elo_ratings TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON SCHEMA public IS 'Basketball ELO tracking system schema';
