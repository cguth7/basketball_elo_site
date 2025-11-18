/**
 * Core ELO Rating Calculation Functions
 *
 * This module implements the standard ELO rating system formulas
 * for calculating expected scores and updating ratings based on game outcomes.
 *
 * The ELO system is a method for calculating the relative skill levels of players
 * in competitor-versus-competitor games such as basketball.
 */

import {
  INITIAL_ELO,
  K_FACTOR,
  ELO_DIVISOR,
  ELO_BASE,
  MIN_ELO_RATING,
  MAX_ELO_RATING,
  MAX_RATING_CHANGE,
} from "./constants";
import type { EloCalculationOptions } from "./types";

/**
 * Calculates the expected score (win probability) for player/team A against player/team B
 *
 * The expected score represents the probability that A will win against B.
 * It ranges from 0 to 1, where:
 * - 0.5 means both players/teams are equally likely to win
 * - Values > 0.5 mean A is favored to win
 * - Values < 0.5 mean B is favored to win
 *
 * Formula: E_A = 1 / (1 + 10^((Rating_B - Rating_A) / 400))
 *
 * The 400 divisor is a constant that determines the scale of rating differences:
 * - A 400-point difference means the higher-rated player has a ~91% win probability
 * - A 200-point difference means the higher-rated player has a ~76% win probability
 * - A 100-point difference means the higher-rated player has a ~64% win probability
 *
 * @param ratingA - Current ELO rating of player/team A
 * @param ratingB - Current ELO rating of player/team B
 * @returns Expected score for player/team A (probability of winning, between 0 and 1)
 *
 * @example
 * // Two equally rated players
 * calculateExpectedScore(1500, 1500) // returns 0.5
 *
 * @example
 * // Higher-rated player (1600) vs lower-rated player (1400)
 * calculateExpectedScore(1600, 1400) // returns ~0.76
 *
 * @example
 * // Lower-rated player (1400) vs higher-rated player (1600)
 * calculateExpectedScore(1400, 1600) // returns ~0.24
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  // Validate inputs
  if (!Number.isFinite(ratingA) || !Number.isFinite(ratingB)) {
    throw new Error("Ratings must be finite numbers");
  }

  if (ratingA < 0 || ratingB < 0) {
    throw new Error("Ratings must be non-negative");
  }

  // Calculate expected score using the standard ELO formula
  const exponent = (ratingB - ratingA) / ELO_DIVISOR;
  const expectedScore = 1 / (1 + Math.pow(ELO_BASE, exponent));

  return expectedScore;
}

/**
 * Calculates the new ELO rating after a game
 *
 * This function implements the core ELO update formula:
 * Rating_new = Rating_old + K * (Actual_Score - Expected_Score)
 *
 * Where:
 * - K (K-factor) determines the maximum possible rating change
 * - Actual_Score is 1 for a win, 0 for a loss, 0.5 for a draw
 * - Expected_Score is the probability of winning (from calculateExpectedScore)
 *
 * The K-factor determines how quickly ratings adjust:
 * - Higher K = faster adjustment, more volatile ratings
 * - Lower K = slower adjustment, more stable ratings
 * - Typical values: 20-40 for basketball
 *
 * @param currentRating - Current ELO rating of the player/team
 * @param expectedScore - Expected score (win probability) from calculateExpectedScore
 * @param actualScore - Actual game outcome (1 for win, 0 for loss, 0.5 for draw)
 * @param kFactor - K-factor determining maximum rating change (default: 20)
 * @param options - Optional settings for min/max ratings and rating change limits
 * @returns New ELO rating after the game
 *
 * @example
 * // Player with 1500 rating wins against equally-rated opponent
 * calculateNewRating(1500, 0.5, 1, 20) // returns 1510
 *
 * @example
 * // Underdog (1400) wins against favorite (1600), expected to lose
 * const expected = calculateExpectedScore(1400, 1600) // ~0.24
 * calculateNewRating(1400, expected, 1, 20) // returns ~1415
 *
 * @example
 * // Favorite (1600) loses to underdog (1400), expected to win
 * const expected = calculateExpectedScore(1600, 1400) // ~0.76
 * calculateNewRating(1600, expected, 0, 20) // returns ~1585
 */
export function calculateNewRating(
  currentRating: number,
  expectedScore: number,
  actualScore: number,
  kFactor: number = K_FACTOR,
  options: EloCalculationOptions = {}
): number {
  // Validate inputs
  if (!Number.isFinite(currentRating)) {
    throw new Error("Current rating must be a finite number");
  }

  if (!Number.isFinite(expectedScore) || expectedScore < 0 || expectedScore > 1) {
    throw new Error("Expected score must be between 0 and 1");
  }

  if (![0, 0.5, 1].includes(actualScore)) {
    throw new Error("Actual score must be 0 (loss), 0.5 (draw), or 1 (win)");
  }

  if (!Number.isFinite(kFactor) || kFactor <= 0) {
    throw new Error("K-factor must be a positive number");
  }

  // Extract options with defaults
  const {
    minRating = MIN_ELO_RATING,
    maxRating = MAX_ELO_RATING,
    maxRatingChange = MAX_RATING_CHANGE,
  } = options;

  // Calculate raw rating change
  let ratingChange = kFactor * (actualScore - expectedScore);

  // Cap the rating change to prevent extreme swings
  if (Math.abs(ratingChange) > maxRatingChange) {
    ratingChange = Math.sign(ratingChange) * maxRatingChange;
  }

  // Calculate new rating
  let newRating = currentRating + ratingChange;

  // Clamp rating to min/max bounds
  newRating = Math.max(minRating, Math.min(maxRating, newRating));

  // Round to 2 decimal places for cleaner numbers
  return Math.round(newRating * 100) / 100;
}

/**
 * Calculates the average rating of a team (or group of players)
 *
 * The team's strength is represented by the average of all players' ratings.
 * This average is used as the "team rating" when calculating expected scores
 * and rating changes.
 *
 * @param playerRatings - Array of individual player ELO ratings
 * @returns Average rating of the team
 * @throws Error if the array is empty or contains invalid ratings
 *
 * @example
 * // Team of 5 players with various ratings
 * calculateTeamRating([1500, 1600, 1450, 1550, 1500]) // returns 1520
 *
 * @example
 * // 1v1 game (single player per "team")
 * calculateTeamRating([1500]) // returns 1500
 *
 * @example
 * // Uneven teams: 3v5 scenario
 * const team1 = calculateTeamRating([1600, 1650, 1700]) // returns 1650
 * const team2 = calculateTeamRating([1500, 1500, 1500, 1500, 1500]) // returns 1500
 */
export function calculateTeamRating(playerRatings: number[]): number {
  // Validate input
  if (!Array.isArray(playerRatings) || playerRatings.length === 0) {
    throw new Error("Player ratings array must not be empty");
  }

  // Validate all ratings are valid numbers
  for (const rating of playerRatings) {
    if (!Number.isFinite(rating) || rating < 0) {
      throw new Error("All player ratings must be non-negative finite numbers");
    }
  }

  // Calculate average
  const sum = playerRatings.reduce((acc, rating) => acc + rating, 0);
  const average = sum / playerRatings.length;

  // Round to 2 decimal places
  return Math.round(average * 100) / 100;
}

/**
 * Gets the initial ELO rating for new players
 *
 * @returns The initial ELO rating (1500 by default)
 *
 * @example
 * const newPlayerRating = getInitialRating() // returns 1500
 */
export function getInitialRating(): number {
  return INITIAL_ELO;
}

/**
 * Validates that a rating is within acceptable bounds
 *
 * @param rating - The rating to validate
 * @param options - Optional custom min/max bounds
 * @returns true if valid, false otherwise
 *
 * @example
 * isValidRating(1500) // returns true
 * isValidRating(-100) // returns false
 * isValidRating(5000) // returns false
 */
export function isValidRating(
  rating: number,
  options: Pick<EloCalculationOptions, "minRating" | "maxRating"> = {}
): boolean {
  const { minRating = MIN_ELO_RATING, maxRating = MAX_ELO_RATING } = options;

  return (
    Number.isFinite(rating) &&
    rating >= minRating &&
    rating <= maxRating
  );
}
