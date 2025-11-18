-- Allow users to join games by adding themselves to game_participants
-- This policy allows authenticated users to insert themselves as participants
CREATE POLICY "Users can join games"
    ON game_participants
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- User can only add themselves
        player_id = auth.uid()
        -- Optional: Only join games that are pending or in_progress
        AND EXISTS (
            SELECT 1 FROM games
            WHERE games.id = game_id
            AND games.status IN ('pending', 'in_progress')
        )
    );

-- Allow users to remove themselves from games
CREATE POLICY "Users can leave games"
    ON game_participants
    FOR DELETE
    TO authenticated
    USING (
        -- User can only delete their own participation
        player_id = auth.uid()
        -- Optional: Only leave games that haven't been completed
        AND EXISTS (
            SELECT 1 FROM games
            WHERE games.id = game_id
            AND games.status IN ('pending', 'in_progress')
        )
    );
