-- Fix any existing profiles with NULL ELO values
-- This can happen if profiles were created before the ensureUserProfile fix

UPDATE profiles
SET
    current_elo = COALESCE(current_elo, 1500),
    peak_elo = COALESCE(peak_elo, 1500),
    games_played = COALESCE(games_played, 0),
    wins = COALESCE(wins, 0),
    losses = COALESCE(losses, 0)
WHERE current_elo IS NULL
   OR peak_elo IS NULL
   OR games_played IS NULL
   OR wins IS NULL
   OR losses IS NULL;
