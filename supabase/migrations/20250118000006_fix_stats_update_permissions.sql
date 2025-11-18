-- Fix profile stats update function to run with elevated permissions
-- This allows it to update all participants' stats regardless of RLS

DROP FUNCTION IF EXISTS update_profile_stats() CASCADE;

CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with elevated permissions to bypass RLS
SET search_path = public
AS $$
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
$$;

COMMENT ON FUNCTION update_profile_stats IS 'Automatically update profile statistics when game completes (runs with elevated permissions)';

-- Recreate the trigger
CREATE TRIGGER trigger_update_profile_stats
    AFTER UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_stats();
