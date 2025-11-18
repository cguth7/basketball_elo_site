-- Fix ELO update function to run with elevated permissions
-- This allows the function to update all participants' profiles regardless of who calls it

-- Drop and recreate the function with SECURITY DEFINER
-- This makes it run with the permissions of the function owner (postgres/service role)
-- instead of the calling user
DROP FUNCTION IF EXISTS update_elo_ratings(UUID);

CREATE OR REPLACE FUNCTION update_elo_ratings(
    p_game_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with elevated permissions to bypass RLS
SET search_path = public
AS $$
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
$$;

COMMENT ON FUNCTION update_elo_ratings IS 'Update ELO ratings for all participants after game completion (runs with elevated permissions)';
