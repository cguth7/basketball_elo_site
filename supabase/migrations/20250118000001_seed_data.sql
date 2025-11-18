-- Basketball ELO Tracking System - Seed Data
-- Created: 2025-01-18
-- Description: Sample data for testing and development

-- NOTE: This seed data uses placeholder UUIDs for demonstration
-- In a real environment, these would be actual auth.users UUIDs
-- You may need to adjust these IDs based on your actual Supabase auth users

-- ============================================================================
-- SEED DATA WARNING
-- ============================================================================
-- This migration is optional and intended for development/testing only
-- Comment out or remove this file for production deployments
-- ============================================================================

DO $$
DECLARE
    -- Player IDs (these would normally come from auth.users)
    player1_id UUID := '11111111-1111-1111-1111-111111111111';
    player2_id UUID := '22222222-2222-2222-2222-222222222222';
    player3_id UUID := '33333333-3333-3333-3333-333333333333';
    player4_id UUID := '44444444-4444-4444-4444-444444444444';
    player5_id UUID := '55555555-5555-5555-5555-555555555555';
    player6_id UUID := '66666666-6666-6666-6666-666666666666';
    player7_id UUID := '77777777-7777-7777-7777-777777777777';
    player8_id UUID := '88888888-8888-8888-8888-888888888888';

    -- Game IDs
    game1_id UUID;
    game2_id UUID;
    game3_id UUID;
    game4_id UUID;
BEGIN
    -- ============================================================================
    -- INSERT SAMPLE PLAYERS
    -- ============================================================================
    -- Note: In production, profiles are created when users sign up
    -- These INSERT statements would fail if the auth.users don't exist
    -- This is for development/testing only

    INSERT INTO profiles (id, display_name, avatar_url, current_elo, peak_elo, games_played, wins, losses, created_at)
    VALUES
        (player1_id, 'Michael Jordan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', 1650, 1650, 12, 9, 3, NOW() - INTERVAL '30 days'),
        (player2_id, 'LeBron James', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lebron', 1620, 1620, 11, 8, 3, NOW() - INTERVAL '28 days'),
        (player3_id, 'Kobe Bryant', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kobe', 1580, 1600, 10, 6, 4, NOW() - INTERVAL '25 days'),
        (player4_id, 'Stephen Curry', 'https://api.dicebear.com/7.x/avataaars/svg?seed=stephen', 1550, 1570, 9, 5, 4, NOW() - INTERVAL '22 days'),
        (player5_id, 'Kevin Durant', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin', 1520, 1540, 8, 4, 4, NOW() - INTERVAL '20 days'),
        (player6_id, 'Magic Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=magic', 1480, 1500, 7, 3, 4, NOW() - INTERVAL '18 days'),
        (player7_id, 'Larry Bird', 'https://api.dicebear.com/7.x/avataaars/svg?seed=larry', 1450, 1490, 6, 2, 4, NOW() - INTERVAL '15 days'),
        (player8_id, 'Tim Duncan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tim', 1520, 1550, 8, 4, 4, NOW() - INTERVAL '12 days')
    ON CONFLICT (id) DO NOTHING;

    -- ============================================================================
    -- INSERT SAMPLE COMPLETED GAMES
    -- ============================================================================

    -- Game 1: 3v3 game from 7 days ago
    game1_id := uuid_generate_v4();
    INSERT INTO games (id, host_id, status, team_size, team_a_score, team_b_score, winning_team, created_at, started_at, completed_at)
    VALUES (
        game1_id,
        player1_id,
        'completed',
        3,
        21,
        18,
        'team_a',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days' + INTERVAL '5 minutes',
        NOW() - INTERVAL '7 days' + INTERVAL '45 minutes'
    );

    -- Game 1 participants (snapshot ELO values from before the game)
    INSERT INTO game_participants (game_id, player_id, team, elo_before, elo_after, elo_change, joined_at)
    VALUES
        (game1_id, player1_id, 'team_a', 1500, 1516, 16, NOW() - INTERVAL '7 days'),
        (game1_id, player2_id, 'team_a', 1500, 1516, 16, NOW() - INTERVAL '7 days'),
        (game1_id, player3_id, 'team_a', 1500, 1516, 16, NOW() - INTERVAL '7 days'),
        (game1_id, player4_id, 'team_b', 1500, 1484, -16, NOW() - INTERVAL '7 days'),
        (game1_id, player5_id, 'team_b', 1500, 1484, -16, NOW() - INTERVAL '7 days'),
        (game1_id, player6_id, 'team_b', 1500, 1484, -16, NOW() - INTERVAL '7 days');

    -- Game 2: 2v2 game from 5 days ago
    game2_id := uuid_generate_v4();
    INSERT INTO games (id, host_id, status, team_size, team_a_score, team_b_score, winning_team, created_at, started_at, completed_at)
    VALUES (
        game2_id,
        player3_id,
        'completed',
        2,
        15,
        21,
        'team_b',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days' + INTERVAL '3 minutes',
        NOW() - INTERVAL '5 days' + INTERVAL '35 minutes'
    );

    INSERT INTO game_participants (game_id, player_id, team, elo_before, elo_after, elo_change, joined_at)
    VALUES
        (game2_id, player1_id, 'team_a', 1516, 1502, -14, NOW() - INTERVAL '5 days'),
        (game2_id, player7_id, 'team_a', 1500, 1486, -14, NOW() - INTERVAL '5 days'),
        (game2_id, player2_id, 'team_b', 1516, 1530, 14, NOW() - INTERVAL '5 days'),
        (game2_id, player8_id, 'team_b', 1500, 1514, 14, NOW() - INTERVAL '5 days');

    -- Game 3: 4v4 game from 3 days ago
    game3_id := uuid_generate_v4();
    INSERT INTO games (id, host_id, status, team_size, team_a_score, team_b_score, winning_team, created_at, started_at, completed_at)
    VALUES (
        game3_id,
        player2_id,
        'completed',
        4,
        25,
        23,
        'team_a',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days' + INTERVAL '10 minutes',
        NOW() - INTERVAL '3 days' + INTERVAL '55 minutes'
    );

    INSERT INTO game_participants (game_id, player_id, team, elo_before, elo_after, elo_change, joined_at)
    VALUES
        (game3_id, player1_id, 'team_a', 1502, 1520, 18, NOW() - INTERVAL '3 days'),
        (game3_id, player2_id, 'team_a', 1530, 1548, 18, NOW() - INTERVAL '3 days'),
        (game3_id, player3_id, 'team_a', 1516, 1534, 18, NOW() - INTERVAL '3 days'),
        (game3_id, player4_id, 'team_a', 1484, 1502, 18, NOW() - INTERVAL '3 days'),
        (game3_id, player5_id, 'team_b', 1484, 1466, -18, NOW() - INTERVAL '3 days'),
        (game3_id, player6_id, 'team_b', 1484, 1466, -18, NOW() - INTERVAL '3 days'),
        (game3_id, player7_id, 'team_b', 1486, 1468, -18, NOW() - INTERVAL '3 days'),
        (game3_id, player8_id, 'team_b', 1514, 1496, -18, NOW() - INTERVAL '3 days');

    -- Game 4: 5v5 game from 1 day ago (draw)
    game4_id := uuid_generate_v4();
    INSERT INTO games (id, host_id, status, team_size, team_a_score, team_b_score, winning_team, created_at, started_at, completed_at)
    VALUES (
        game4_id,
        player1_id,
        'completed',
        5,
        30,
        30,
        'draw',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day' + INTERVAL '8 minutes',
        NOW() - INTERVAL '1 day' + INTERVAL '60 minutes'
    );

    INSERT INTO game_participants (game_id, player_id, team, elo_before, elo_after, elo_change, joined_at)
    VALUES
        (game4_id, player1_id, 'team_a', 1520, 1520, 0, NOW() - INTERVAL '1 day'),
        (game4_id, player2_id, 'team_a', 1548, 1548, 0, NOW() - INTERVAL '1 day'),
        (game4_id, player3_id, 'team_a', 1534, 1534, 0, NOW() - INTERVAL '1 day'),
        (game4_id, player4_id, 'team_a', 1502, 1502, 0, NOW() - INTERVAL '1 day'),
        (game4_id, player8_id, 'team_a', 1496, 1496, 0, NOW() - INTERVAL '1 day'),
        (game4_id, player5_id, 'team_b', 1466, 1466, 0, NOW() - INTERVAL '1 day'),
        (game4_id, player6_id, 'team_b', 1466, 1466, 0, NOW() - INTERVAL '1 day'),
        (game4_id, player7_id, 'team_b', 1468, 1468, 0, NOW() - INTERVAL '1 day'),
        (game4_id, player1_id, 'team_b', 1520, 1520, 0, NOW() - INTERVAL '1 day');

    -- Note: The above draw game has player1 on both teams which is invalid
    -- Let me fix that
    DELETE FROM game_participants WHERE game_id = game4_id;

    INSERT INTO game_participants (game_id, player_id, team, elo_before, elo_after, elo_change, joined_at)
    VALUES
        (game4_id, player1_id, 'team_a', 1520, 1518, -2, NOW() - INTERVAL '1 day'),
        (game4_id, player2_id, 'team_a', 1548, 1546, -2, NOW() - INTERVAL '1 day'),
        (game4_id, player3_id, 'team_a', 1534, 1532, -2, NOW() - INTERVAL '1 day'),
        (game4_id, player4_id, 'team_a', 1502, 1500, -2, NOW() - INTERVAL '1 day'),
        (game4_id, player8_id, 'team_a', 1496, 1494, -2, NOW() - INTERVAL '1 day'),
        (game4_id, player5_id, 'team_b', 1466, 1468, 2, NOW() - INTERVAL '1 day'),
        (game4_id, player6_id, 'team_b', 1466, 1468, 2, NOW() - INTERVAL '1 day'),
        (game4_id, player7_id, 'team_b', 1468, 1470, 2, NOW() - INTERVAL '1 day');

    -- ============================================================================
    -- INSERT SAMPLE PENDING GAME
    -- ============================================================================

    -- Pending game waiting for players
    INSERT INTO games (id, host_id, status, team_size, created_at)
    VALUES (
        uuid_generate_v4(),
        player1_id,
        'pending',
        3,
        NOW() - INTERVAL '2 hours'
    );

    -- ============================================================================
    -- RECALCULATE PROFILE STATS TO MATCH GAME DATA
    -- ============================================================================
    -- Note: In production, these stats are automatically updated by triggers
    -- Here we're setting them manually to match our seed data

    UPDATE profiles SET
        games_played = (SELECT COUNT(*) FROM game_participants WHERE player_id = profiles.id),
        wins = (
            SELECT COUNT(*)
            FROM game_participants gp
            JOIN games g ON gp.game_id = g.id
            WHERE gp.player_id = profiles.id
            AND ((gp.team = 'team_a' AND g.winning_team = 'team_a')
                OR (gp.team = 'team_b' AND g.winning_team = 'team_b'))
        ),
        losses = (
            SELECT COUNT(*)
            FROM game_participants gp
            JOIN games g ON gp.game_id = g.id
            WHERE gp.player_id = profiles.id
            AND g.winning_team != 'draw'
            AND ((gp.team = 'team_a' AND g.winning_team = 'team_b')
                OR (gp.team = 'team_b' AND g.winning_team = 'team_a'))
        ),
        current_elo = (
            SELECT COALESCE(
                (SELECT elo_after
                 FROM game_participants
                 WHERE player_id = profiles.id
                 ORDER BY joined_at DESC
                 LIMIT 1),
                1500
            )
        ),
        peak_elo = (
            SELECT COALESCE(MAX(elo_after), 1500)
            FROM game_participants
            WHERE player_id = profiles.id
        );

    RAISE NOTICE 'Seed data inserted successfully';
    RAISE NOTICE 'Players: 8, Games: 4 (3 completed, 1 pending)';
    RAISE NOTICE 'Note: This is test data with placeholder UUIDs';
END $$;
