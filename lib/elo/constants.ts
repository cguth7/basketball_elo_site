/**
 * ELO Rating System Constants
 *
 * These constants define the core parameters for the ELO rating system
 * used in basketball game tracking.
 */

/**
 * Initial ELO rating for new players
 * Standard starting point representing average skill level
 */
export const INITIAL_ELO = 1500;

/**
 * K-factor determines the maximum possible rating change per game
 * Higher K-factor = more volatile ratings (faster adjustment to true skill)
 * Lower K-factor = more stable ratings (slower adjustment)
 *
 * K=20 is typical for basketball and provides good balance between
 * responsiveness and stability
 */
export const K_FACTOR = 20;

/**
 * The divisor used in the ELO expected score calculation
 * This is a standard constant in the ELO formula
 * A difference of 400 rating points means the higher-rated player
 * has a 10x greater chance of winning (expected score of ~0.91)
 */
export const ELO_DIVISOR = 400;

/**
 * Base value for the exponential calculation in expected score
 * Standard mathematical constant for ELO calculations
 */
export const ELO_BASE = 10;

/**
 * Minimum allowed ELO rating to prevent extreme negative values
 * While technically ELO can go infinitely low, we cap it for practical reasons
 */
export const MIN_ELO_RATING = 100;

/**
 * Maximum allowed ELO rating to prevent extreme positive values
 * While technically ELO can go infinitely high, we cap it for practical reasons
 */
export const MAX_ELO_RATING = 3000;

/**
 * Maximum rating change allowed per game to prevent extreme swings
 * This caps the K-factor effect in edge cases
 */
export const MAX_RATING_CHANGE = 50;
