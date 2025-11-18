/**
 * ELO Rating System for Basketball
 *
 * Main entry point for the ELO rating calculation library.
 * Exports all core functions, types, and constants.
 */

// Export all core calculator functions
export {
  calculateExpectedScore,
  calculateNewRating,
  calculateTeamRating,
  getInitialRating,
  isValidRating,
} from "./calculator";

// Export all team rating functions
export {
  updateTeamRatings,
  createNewPlayer,
  analyzeRatingGap,
  simulateGameOutcomes,
} from "./team-ratings";

// Export all constants
export {
  INITIAL_ELO,
  K_FACTOR,
  ELO_DIVISOR,
  ELO_BASE,
  MIN_ELO_RATING,
  MAX_ELO_RATING,
  MAX_RATING_CHANGE,
} from "./constants";

// Export all types
export type {
  Player,
  PlayerRatingChange,
  Team,
  TeamRatingsUpdateResult,
  EloCalculationOptions,
} from "./types";

export { GameOutcome } from "./types";
