/**
 * Team-based ELO Rating Calculations
 *
 * This module handles ELO calculations for team-based basketball games,
 * including support for:
 * - Uneven teams (e.g., 3v5)
 * - Partial participation (only some players tracked in the system)
 * - Flexible team sizes (1v1 to 5v5)
 */

import {
  calculateExpectedScore,
  calculateNewRating,
  calculateTeamRating,
  getInitialRating,
} from "./calculator";
import { K_FACTOR } from "./constants";
import type {
  Player,
  PlayerRatingChange,
  TeamRatingsUpdateResult,
  EloCalculationOptions,
} from "./types";

/**
 * Updates ELO ratings for all players after a team game
 *
 * This function:
 * 1. Calculates average team ratings
 * 2. Determines expected scores for each team
 * 3. Updates each player's rating based on the actual outcome
 * 4. Returns detailed information about all rating changes
 *
 * All players on a team receive the same rating change, based on:
 * - Their team's average rating vs opponent's average rating
 * - Whether their team won or lost
 *
 * This handles edge cases like:
 * - Uneven teams (3v5): Each team's strength is still its average rating
 * - Very large rating gaps: The expected score formula naturally handles this
 * - New players: Should have INITIAL_ELO rating
 *
 * @param team1Players - Array of players on team 1 with their current ratings
 * @param team2Players - Array of players on team 2 with their current ratings
 * @param team1Won - True if team 1 won, false if team 2 won
 * @param options - Optional ELO calculation settings
 * @returns Detailed results including all rating changes and expected scores
 *
 * @example
 * // 3v3 game with evenly matched teams
 * const team1 = [
 *   { id: '1', name: 'Alice', rating: 1500 },
 *   { id: '2', name: 'Bob', rating: 1500 },
 *   { id: '3', name: 'Carol', rating: 1500 },
 * ];
 * const team2 = [
 *   { id: '4', name: 'Dave', rating: 1500 },
 *   { id: '5', name: 'Eve', rating: 1500 },
 *   { id: '6', name: 'Frank', rating: 1500 },
 * ];
 * const result = updateTeamRatings(team1, team2, true);
 * // Team 1 wins: each player gains ~10 points
 * // Team 2 loses: each player loses ~10 points
 *
 * @example
 * // Uneven game: 3v5, underdog wins
 * const team1 = [
 *   { id: '1', name: 'Alice', rating: 1600 },
 *   { id: '2', name: 'Bob', rating: 1650 },
 *   { id: '3', name: 'Carol', rating: 1700 },
 * ]; // avg: 1650
 * const team2 = [
 *   { id: '4', name: 'Dave', rating: 1500 },
 *   { id: '5', name: 'Eve', rating: 1500 },
 *   { id: '6', name: 'Frank', rating: 1500 },
 *   { id: '7', name: 'Grace', rating: 1500 },
 *   { id: '8', name: 'Henry', rating: 1500 },
 * ]; // avg: 1500
 * const result = updateTeamRatings(team1, team2, false);
 * // Team 2 (underdog) wins: large rating increase
 * // Team 1 (favorite) loses: large rating decrease
 */
export function updateTeamRatings(
  team1Players: Player[],
  team2Players: Player[],
  team1Won: boolean,
  options: EloCalculationOptions = {}
): TeamRatingsUpdateResult {
  // Validate inputs
  if (!Array.isArray(team1Players) || team1Players.length === 0) {
    throw new Error("Team 1 must have at least one player");
  }

  if (!Array.isArray(team2Players) || team2Players.length === 0) {
    throw new Error("Team 2 must have at least one player");
  }

  // Validate all players have required fields
  const validatePlayer = (player: Player, teamName: string) => {
    if (!player.id || typeof player.id !== "string") {
      throw new Error(`Invalid player ID in ${teamName}`);
    }
    if (!player.name || typeof player.name !== "string") {
      throw new Error(`Invalid player name in ${teamName}`);
    }
    if (!Number.isFinite(player.rating) || player.rating < 0) {
      throw new Error(`Invalid rating for player ${player.name} in ${teamName}`);
    }
  };

  team1Players.forEach((p) => validatePlayer(p, "Team 1"));
  team2Players.forEach((p) => validatePlayer(p, "Team 2"));

  // Extract K-factor from options
  const kFactor = options.kFactor ?? K_FACTOR;

  // Calculate average team ratings
  const team1Ratings = team1Players.map((p) => p.rating);
  const team2Ratings = team2Players.map((p) => p.rating);
  const team1AverageRating = calculateTeamRating(team1Ratings);
  const team2AverageRating = calculateTeamRating(team2Ratings);

  // Calculate expected scores
  const expectedScoreTeam1 = calculateExpectedScore(
    team1AverageRating,
    team2AverageRating
  );
  const expectedScoreTeam2 = calculateExpectedScore(
    team2AverageRating,
    team1AverageRating
  );

  // Determine actual scores (1 for win, 0 for loss)
  const actualScoreTeam1 = team1Won ? 1 : 0;
  const actualScoreTeam2 = team1Won ? 0 : 1;

  // Calculate new ratings for all players
  const team1Changes: PlayerRatingChange[] = team1Players.map((player) => {
    const newRating = calculateNewRating(
      player.rating,
      expectedScoreTeam1,
      actualScoreTeam1,
      kFactor,
      options
    );

    return {
      playerId: player.id,
      playerName: player.name,
      oldRating: player.rating,
      newRating,
      ratingChange: newRating - player.rating,
    };
  });

  const team2Changes: PlayerRatingChange[] = team2Players.map((player) => {
    const newRating = calculateNewRating(
      player.rating,
      expectedScoreTeam2,
      actualScoreTeam2,
      kFactor,
      options
    );

    return {
      playerId: player.id,
      playerName: player.name,
      oldRating: player.rating,
      newRating,
      ratingChange: newRating - player.rating,
    };
  });

  return {
    team1Changes,
    team2Changes,
    team1AverageRating,
    team2AverageRating,
    expectedScoreTeam1,
    expectedScoreTeam2,
  };
}

/**
 * Creates a new player object with the initial ELO rating
 *
 * This is a helper function for creating player objects for new players
 * who don't yet have a rating in the system.
 *
 * @param id - Unique player identifier
 * @param name - Player's display name
 * @returns Player object with initial rating
 *
 * @example
 * const newPlayer = createNewPlayer('player123', 'John Doe');
 * // returns { id: 'player123', name: 'John Doe', rating: 1500 }
 */
export function createNewPlayer(id: string, name: string): Player {
  if (!id || typeof id !== "string") {
    throw new Error("Player ID must be a non-empty string");
  }

  if (!name || typeof name !== "string") {
    throw new Error("Player name must be a non-empty string");
  }

  return {
    id,
    name,
    rating: getInitialRating(),
  };
}

/**
 * Calculates the rating difference impact between teams
 *
 * This helper function returns information about how the rating gap
 * affects the expected outcome and potential rating changes.
 *
 * @param team1AverageRating - Average rating of team 1
 * @param team2AverageRating - Average rating of team 2
 * @returns Object with rating gap analysis
 *
 * @example
 * const analysis = analyzeRatingGap(1600, 1400);
 * // returns {
 * //   ratingGap: 200,
 * //   favoredTeam: 1,
 * //   expectedScoreTeam1: 0.76,
 * //   expectedScoreTeam2: 0.24,
 * //   team1MaxGain: ~4.8 (if they win),
 * //   team1MaxLoss: ~15.2 (if they lose)
 * // }
 */
export function analyzeRatingGap(
  team1AverageRating: number,
  team2AverageRating: number,
  kFactor: number = K_FACTOR
): {
  ratingGap: number;
  favoredTeam: 1 | 2 | null;
  expectedScoreTeam1: number;
  expectedScoreTeam2: number;
  team1MaxGain: number;
  team1MaxLoss: number;
  team2MaxGain: number;
  team2MaxLoss: number;
} {
  const ratingGap = team1AverageRating - team2AverageRating;
  const expectedScoreTeam1 = calculateExpectedScore(
    team1AverageRating,
    team2AverageRating
  );
  const expectedScoreTeam2 = calculateExpectedScore(
    team2AverageRating,
    team1AverageRating
  );

  // Determine favored team (must be at least 50 point gap to be considered "favored")
  let favoredTeam: 1 | 2 | null = null;
  if (Math.abs(ratingGap) >= 50) {
    favoredTeam = ratingGap > 0 ? 1 : 2;
  }

  // Calculate maximum possible gains/losses
  const team1MaxGain = kFactor * (1 - expectedScoreTeam1);
  const team1MaxLoss = kFactor * (0 - expectedScoreTeam1);
  const team2MaxGain = kFactor * (1 - expectedScoreTeam2);
  const team2MaxLoss = kFactor * (0 - expectedScoreTeam2);

  return {
    ratingGap: Math.round(ratingGap * 100) / 100,
    favoredTeam,
    expectedScoreTeam1: Math.round(expectedScoreTeam1 * 1000) / 1000,
    expectedScoreTeam2: Math.round(expectedScoreTeam2 * 1000) / 1000,
    team1MaxGain: Math.round(team1MaxGain * 100) / 100,
    team1MaxLoss: Math.round(team1MaxLoss * 100) / 100,
    team2MaxGain: Math.round(team2MaxGain * 100) / 100,
    team2MaxLoss: Math.round(team2MaxLoss * 100) / 100,
  };
}

/**
 * Simulates rating changes for different game outcomes
 *
 * This is useful for showing players what their potential rating changes
 * would be before a game is played.
 *
 * @param team1Players - Players on team 1
 * @param team2Players - Players on team 2
 * @param options - Optional ELO calculation settings
 * @returns Simulated results for both team 1 win and team 2 win scenarios
 *
 * @example
 * const simulation = simulateGameOutcomes(team1, team2);
 * console.log('If Team 1 wins:', simulation.team1Wins);
 * console.log('If Team 2 wins:', simulation.team2Wins);
 */
export function simulateGameOutcomes(
  team1Players: Player[],
  team2Players: Player[],
  options: EloCalculationOptions = {}
): {
  team1Wins: TeamRatingsUpdateResult;
  team2Wins: TeamRatingsUpdateResult;
} {
  const team1Wins = updateTeamRatings(team1Players, team2Players, true, options);
  const team2Wins = updateTeamRatings(team1Players, team2Players, false, options);

  return {
    team1Wins,
    team2Wins,
  };
}
