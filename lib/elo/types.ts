/**
 * Type definitions for the ELO rating system
 */

/**
 * Represents a player with their current ELO rating
 */
export interface Player {
  id: string;
  name: string;
  rating: number;
}

/**
 * Represents a player's rating before and after a game
 */
export interface PlayerRatingChange {
  playerId: string;
  playerName: string;
  oldRating: number;
  newRating: number;
  ratingChange: number;
}

/**
 * Represents a team in a game
 */
export interface Team {
  players: Player[];
  averageRating?: number;
}

/**
 * Result of a team ratings update
 */
export interface TeamRatingsUpdateResult {
  team1Changes: PlayerRatingChange[];
  team2Changes: PlayerRatingChange[];
  team1AverageRating: number;
  team2AverageRating: number;
  expectedScoreTeam1: number;
  expectedScoreTeam2: number;
}

/**
 * Game outcome from Team 1's perspective
 */
export enum GameOutcome {
  WIN = 1,
  LOSS = 0,
  DRAW = 0.5,
}

/**
 * Options for ELO calculation
 */
export interface EloCalculationOptions {
  kFactor?: number;
  minRating?: number;
  maxRating?: number;
  maxRatingChange?: number;
}
