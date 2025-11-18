-- Basketball ELO Tracking System - Useful Development Queries
-- This file contains helpful SQL queries for development and debugging

-- ============================================================================
-- LEADERBOARD QUERIES
-- ============================================================================

-- Get top 10 players by ELO
SELECT
    display_name,
    current_elo,
    peak_elo,
    games_played,
    wins,
    losses,
    ROUND((wins::NUMERIC / NULLIF(games_played, 0)::NUMERIC) * 100, 1) as win_percentage
FROM profiles
WHERE games_played > 0
ORDER BY current_elo DESC
LIMIT 10;

-- Get leaderboard with recent activity
SELECT
    p.display_name,
    p.current_elo,
    p.games_played,
    p.wins,
    p.losses,
    MAX(g.completed_at) as last_game
FROM profiles p
LEFT JOIN game_participants gp ON p.id = gp.player_id
LEFT JOIN games g ON gp.game_id = g.id AND g.status = 'completed'
WHERE p.games_played > 0
GROUP BY p.id, p.display_name, p.current_elo, p.games_played, p.wins, p.losses
ORDER BY p.current_elo DESC;

-- ============================================================================
-- GAME QUERIES
-- ============================================================================

-- Get all pending games with participant counts
SELECT
    g.id,
    host.display_name as host_name,
    g.team_size,
    g.created_at,
    COUNT(DISTINCT gp.player_id) as current_players,
    g.team_size * 2 as needed_players,
    COUNT(DISTINCT CASE WHEN gp.team = 'team_a' THEN gp.player_id END) as team_a_count,
    COUNT(DISTINCT CASE WHEN gp.team = 'team_b' THEN gp.player_id END) as team_b_count
FROM games g
JOIN profiles host ON g.host_id = host.id
LEFT JOIN game_participants gp ON g.id = gp.game_id
WHERE g.status = 'pending'
GROUP BY g.id, host.display_name, g.team_size, g.created_at
ORDER BY g.created_at DESC;

-- Get recent completed games with scores and participants
SELECT
    g.id,
    g.team_a_score,
    g.team_b_score,
    g.winning_team,
    g.completed_at,
    STRING_AGG(
        CASE WHEN gp.team = 'team_a' THEN p.display_name END,
        ', '
    ) as team_a_players,
    STRING_AGG(
        CASE WHEN gp.team = 'team_b' THEN p.display_name END,
        ', '
    ) as team_b_players
FROM games g
LEFT JOIN game_participants gp ON g.id = gp.game_id
LEFT JOIN profiles p ON gp.player_id = p.id
WHERE g.status = 'completed'
GROUP BY g.id, g.team_a_score, g.team_b_score, g.winning_team, g.completed_at
ORDER BY g.completed_at DESC
LIMIT 10;

-- Get game details with ELO changes
SELECT
    g.id as game_id,
    g.completed_at,
    p.display_name,
    gp.team,
    gp.elo_before,
    gp.elo_after,
    gp.elo_change,
    CASE
        WHEN (gp.team = 'team_a' AND g.winning_team = 'team_a') OR
             (gp.team = 'team_b' AND g.winning_team = 'team_b')
        THEN 'Won'
        WHEN g.winning_team = 'draw'
        THEN 'Draw'
        ELSE 'Lost'
    END as result
FROM games g
JOIN game_participants gp ON g.id = gp.game_id
JOIN profiles p ON gp.player_id = p.id
WHERE g.status = 'completed'
ORDER BY g.completed_at DESC, gp.team, p.display_name;

-- ============================================================================
-- PLAYER QUERIES
-- ============================================================================

-- Get player profile with recent games (replace 'PLAYER_ID' with actual UUID)
SELECT
    p.display_name,
    p.current_elo,
    p.peak_elo,
    p.games_played,
    p.wins,
    p.losses,
    g.completed_at,
    g.team_a_score,
    g.team_b_score,
    gp.team,
    gp.elo_change,
    CASE
        WHEN (gp.team = 'team_a' AND g.winning_team = 'team_a') OR
             (gp.team = 'team_b' AND g.winning_team = 'team_b')
        THEN 'Won'
        WHEN g.winning_team = 'draw'
        THEN 'Draw'
        ELSE 'Lost'
    END as result
FROM profiles p
LEFT JOIN game_participants gp ON p.id = gp.player_id
LEFT JOIN games g ON gp.game_id = g.id AND g.status = 'completed'
WHERE p.id = 'PLAYER_ID'
ORDER BY g.completed_at DESC NULLS LAST
LIMIT 10;

-- Get player's ELO history for graphing
SELECT
    recorded_at,
    elo_after as elo,
    elo_change
FROM elo_history
WHERE player_id = 'PLAYER_ID'
ORDER BY recorded_at ASC;

-- Get player statistics
SELECT
    p.display_name,
    p.current_elo,
    p.peak_elo,
    p.games_played,
    p.wins,
    p.losses,
    ROUND((p.wins::NUMERIC / NULLIF(p.games_played, 0)::NUMERIC) * 100, 1) as win_percentage,
    p.peak_elo - p.current_elo as elo_drop_from_peak,
    COUNT(DISTINCT CASE WHEN g.status = 'pending' THEN g.id END) as pending_games
FROM profiles p
LEFT JOIN game_participants gp ON p.id = gp.player_id
LEFT JOIN games g ON gp.game_id = g.id
WHERE p.id = 'PLAYER_ID'
GROUP BY p.id;

-- ============================================================================
-- ELO ANALYSIS QUERIES
-- ============================================================================

-- Get ELO distribution
SELECT
    CASE
        WHEN current_elo < 1300 THEN '< 1300'
        WHEN current_elo < 1400 THEN '1300-1399'
        WHEN current_elo < 1500 THEN '1400-1499'
        WHEN current_elo < 1600 THEN '1500-1599'
        WHEN current_elo < 1700 THEN '1600-1699'
        ELSE '1700+'
    END as elo_range,
    COUNT(*) as player_count
FROM profiles
WHERE games_played > 0
GROUP BY elo_range
ORDER BY MIN(current_elo);

-- Get biggest ELO gains in single game
SELECT
    p.display_name,
    gp.elo_change,
    gp.elo_before,
    gp.elo_after,
    g.completed_at,
    gp.team,
    g.winning_team
FROM game_participants gp
JOIN profiles p ON gp.player_id = p.id
JOIN games g ON gp.game_id = g.id
WHERE gp.elo_change IS NOT NULL
ORDER BY gp.elo_change DESC
LIMIT 10;

-- Get biggest ELO losses in single game
SELECT
    p.display_name,
    gp.elo_change,
    gp.elo_before,
    gp.elo_after,
    g.completed_at,
    gp.team,
    g.winning_team
FROM game_participants gp
JOIN profiles p ON gp.player_id = p.id
JOIN games g ON gp.game_id = g.id
WHERE gp.elo_change IS NOT NULL
ORDER BY gp.elo_change ASC
LIMIT 10;

-- Get average ELO change by result
SELECT
    CASE
        WHEN (gp.team = 'team_a' AND g.winning_team = 'team_a') OR
             (gp.team = 'team_b' AND g.winning_team = 'team_b')
        THEN 'Win'
        WHEN g.winning_team = 'draw'
        THEN 'Draw'
        ELSE 'Loss'
    END as result,
    ROUND(AVG(gp.elo_change), 1) as avg_elo_change,
    ROUND(MIN(gp.elo_change), 1) as min_elo_change,
    ROUND(MAX(gp.elo_change), 1) as max_elo_change,
    COUNT(*) as occurrences
FROM game_participants gp
JOIN games g ON gp.game_id = g.id
WHERE gp.elo_change IS NOT NULL
GROUP BY result
ORDER BY avg_elo_change DESC;

-- ============================================================================
-- MATCHMAKING QUERIES
-- ============================================================================

-- Find players with similar ELO (±100 points) for a specific player
SELECT
    p.display_name,
    p.current_elo,
    ABS(p.current_elo - (SELECT current_elo FROM profiles WHERE id = 'PLAYER_ID')) as elo_difference,
    p.games_played,
    ROUND((p.wins::NUMERIC / NULLIF(p.games_played, 0)::NUMERIC) * 100, 1) as win_percentage
FROM profiles p
WHERE p.id != 'PLAYER_ID'
    AND p.games_played > 0
    AND ABS(p.current_elo - (SELECT current_elo FROM profiles WHERE id = 'PLAYER_ID')) <= 100
ORDER BY elo_difference ASC;

-- Get balanced team suggestions for pending game
-- This query helps balance teams by ELO
WITH game_players AS (
    SELECT
        gp.player_id,
        p.display_name,
        p.current_elo,
        gp.team
    FROM game_participants gp
    JOIN profiles p ON gp.player_id = p.id
    WHERE gp.game_id = 'GAME_ID'
)
SELECT
    team,
    STRING_AGG(display_name, ', ') as players,
    ROUND(AVG(current_elo), 0) as avg_elo,
    COUNT(*) as player_count
FROM game_players
GROUP BY team
ORDER BY team;

-- ============================================================================
-- STATISTICS QUERIES
-- ============================================================================

-- Get overall platform statistics
SELECT
    COUNT(DISTINCT p.id) as total_players,
    COUNT(DISTINCT CASE WHEN p.games_played > 0 THEN p.id END) as active_players,
    COUNT(DISTINCT g.id) as total_games,
    COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END) as completed_games,
    COUNT(DISTINCT CASE WHEN g.status = 'pending' THEN g.id END) as pending_games,
    ROUND(AVG(CASE WHEN p.games_played > 0 THEN p.current_elo END), 0) as avg_elo,
    ROUND(AVG(CASE WHEN p.games_played > 0 THEN p.games_played END), 1) as avg_games_per_player
FROM profiles p
CROSS JOIN games g;

-- Get daily game statistics
SELECT
    DATE(completed_at) as date,
    COUNT(*) as games_completed,
    ROUND(AVG(team_a_score + team_b_score), 1) as avg_total_points,
    COUNT(CASE WHEN winning_team = 'draw' THEN 1 END) as draws
FROM games
WHERE status = 'completed'
    AND completed_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(completed_at)
ORDER BY date DESC;

-- Get team size distribution
SELECT
    team_size,
    COUNT(*) as game_count,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*)::NUMERIC FROM games WHERE status = 'completed') * 100, 1) as percentage
FROM games
WHERE status = 'completed'
GROUP BY team_size
ORDER BY team_size;

-- ============================================================================
-- DATA INTEGRITY CHECKS
-- ============================================================================

-- Check for orphaned game participants (shouldn't exist due to FK constraints)
SELECT gp.*
FROM game_participants gp
LEFT JOIN games g ON gp.game_id = g.id
WHERE g.id IS NULL;

-- Check for profiles with invalid stats
SELECT
    display_name,
    games_played,
    wins,
    losses,
    wins + losses as total_decided
FROM profiles
WHERE wins + losses > games_played;

-- Check for completed games without ELO calculations
SELECT
    g.id,
    g.completed_at,
    COUNT(CASE WHEN gp.elo_after IS NULL THEN 1 END) as missing_elo_count
FROM games g
LEFT JOIN game_participants gp ON g.id = gp.game_id
WHERE g.status = 'completed'
GROUP BY g.id, g.completed_at
HAVING COUNT(CASE WHEN gp.elo_after IS NULL THEN 1 END) > 0;

-- Check for games with unbalanced teams
SELECT
    g.id,
    g.team_size,
    COUNT(CASE WHEN gp.team = 'team_a' THEN 1 END) as team_a_count,
    COUNT(CASE WHEN gp.team = 'team_b' THEN 1 END) as team_b_count
FROM games g
LEFT JOIN game_participants gp ON g.id = gp.game_id
WHERE g.status IN ('in_progress', 'completed')
GROUP BY g.id, g.team_size
HAVING
    COUNT(CASE WHEN gp.team = 'team_a' THEN 1 END) != g.team_size OR
    COUNT(CASE WHEN gp.team = 'team_b' THEN 1 END) != g.team_size;

-- ============================================================================
-- TESTING QUERIES
-- ============================================================================

-- Test ELO calculation for a completed game (without actually updating)
-- Replace 'GAME_ID' with actual game UUID
WITH game_info AS (
    SELECT
        id,
        winning_team,
        team_a_score,
        team_b_score
    FROM games
    WHERE id = 'GAME_ID'
),
team_averages AS (
    SELECT
        'team_a' as team,
        AVG(elo_before) as avg_elo
    FROM game_participants
    WHERE game_id = 'GAME_ID' AND team = 'team_a'
    UNION ALL
    SELECT
        'team_b' as team,
        AVG(elo_before) as avg_elo
    FROM game_participants
    WHERE game_id = 'GAME_ID' AND team = 'team_b'
),
participant_calcs AS (
    SELECT
        p.display_name,
        gp.team,
        gp.elo_before,
        ta.avg_elo as opponent_avg_elo,
        CASE
            WHEN (gp.team = 'team_a' AND gi.winning_team = 'team_a') OR
                 (gp.team = 'team_b' AND gi.winning_team = 'team_b')
            THEN 1.0
            WHEN gi.winning_team = 'draw'
            THEN 0.5
            ELSE 0.0
        END as actual_score,
        calculate_expected_score(
            gp.elo_before,
            ta.avg_elo
        ) as expected_score
    FROM game_participants gp
    JOIN profiles p ON gp.player_id = p.id
    JOIN game_info gi ON TRUE
    JOIN team_averages ta ON ta.team != gp.team
    WHERE gp.game_id = 'GAME_ID'
)
SELECT
    display_name,
    team,
    elo_before,
    ROUND(expected_score::NUMERIC, 3) as expected_score,
    actual_score,
    ROUND(32 * (actual_score - expected_score)) as calculated_elo_change,
    elo_before + ROUND(32 * (actual_score - expected_score)) as new_elo
FROM participant_calcs
ORDER BY team, display_name;

-- ============================================================================
-- CLEANUP QUERIES (USE WITH CAUTION)
-- ============================================================================

-- Delete all pending games older than 24 hours
-- DELETE FROM games
-- WHERE status = 'pending'
--   AND created_at < NOW() - INTERVAL '24 hours';

-- Reset a player's ELO to 1500 (for testing)
-- WARNING: This will not update game history
-- UPDATE profiles
-- SET current_elo = 1500, peak_elo = 1500
-- WHERE id = 'PLAYER_ID';

-- Cancel a game (sets status to cancelled)
-- UPDATE games
-- SET status = 'cancelled'
-- WHERE id = 'GAME_ID';
