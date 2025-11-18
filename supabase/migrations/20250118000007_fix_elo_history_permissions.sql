-- Fix ELO history recording function to run with elevated permissions
-- This ensures ELO history is recorded for all players

DROP FUNCTION IF EXISTS record_elo_history() CASCADE;

CREATE OR REPLACE FUNCTION record_elo_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with elevated permissions to bypass RLS
SET search_path = public
AS $$
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
$$;

COMMENT ON FUNCTION record_elo_history IS 'Automatically record ELO history when participant ELO changes (runs with elevated permissions)';

-- Recreate the trigger
CREATE TRIGGER trigger_record_elo_history
    AFTER UPDATE ON game_participants
    FOR EACH ROW
    EXECUTE FUNCTION record_elo_history();
