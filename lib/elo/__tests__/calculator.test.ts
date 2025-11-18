/**
 * Unit tests for core ELO calculator functions
 */

import { describe, it, expect } from "vitest";
import {
  calculateExpectedScore,
  calculateNewRating,
  calculateTeamRating,
  getInitialRating,
  isValidRating,
} from "../calculator";
import { INITIAL_ELO, K_FACTOR, MIN_ELO_RATING, MAX_ELO_RATING } from "../constants";

describe("calculateExpectedScore", () => {
  it("should return 0.5 for equally rated players", () => {
    const expected = calculateExpectedScore(1500, 1500);
    expect(expected).toBe(0.5);
  });

  it("should return > 0.5 when player A is higher rated", () => {
    const expected = calculateExpectedScore(1600, 1400);
    expect(expected).toBeGreaterThan(0.5);
    expect(expected).toBeCloseTo(0.76, 2);
  });

  it("should return < 0.5 when player A is lower rated", () => {
    const expected = calculateExpectedScore(1400, 1600);
    expect(expected).toBeLessThan(0.5);
    expect(expected).toBeCloseTo(0.24, 2);
  });

  it("should return ~0.91 for 400 point advantage", () => {
    const expected = calculateExpectedScore(1900, 1500);
    expect(expected).toBeCloseTo(0.909, 2);
  });

  it("should return ~0.09 for 400 point disadvantage", () => {
    const expected = calculateExpectedScore(1500, 1900);
    expect(expected).toBeCloseTo(0.091, 2);
  });

  it("should handle large rating differences", () => {
    const expected = calculateExpectedScore(2500, 1000);
    expect(expected).toBeGreaterThan(0.99);
  });

  it("should return complementary probabilities", () => {
    const expectedA = calculateExpectedScore(1600, 1400);
    const expectedB = calculateExpectedScore(1400, 1600);
    expect(expectedA + expectedB).toBeCloseTo(1, 10);
  });

  it("should throw error for non-finite ratings", () => {
    expect(() => calculateExpectedScore(NaN, 1500)).toThrow("finite numbers");
    expect(() => calculateExpectedScore(1500, Infinity)).toThrow("finite numbers");
  });

  it("should throw error for negative ratings", () => {
    expect(() => calculateExpectedScore(-100, 1500)).toThrow("non-negative");
    expect(() => calculateExpectedScore(1500, -200)).toThrow("non-negative");
  });
});

describe("calculateNewRating", () => {
  it("should increase rating when winning as expected (50/50 match)", () => {
    const newRating = calculateNewRating(1500, 0.5, 1, 20);
    expect(newRating).toBe(1510); // +10 points
  });

  it("should decrease rating when losing as expected (50/50 match)", () => {
    const newRating = calculateNewRating(1500, 0.5, 0, 20);
    expect(newRating).toBe(1490); // -10 points
  });

  it("should give large increase when underdog wins", () => {
    // Underdog (1400) vs Favorite (1600)
    const expectedScore = calculateExpectedScore(1400, 1600); // ~0.24
    const newRating = calculateNewRating(1400, expectedScore, 1, 20);
    expect(newRating).toBeGreaterThan(1410); // significant gain
    expect(newRating).toBeCloseTo(1415.2, 0);
  });

  it("should give large decrease when favorite loses", () => {
    // Favorite (1600) vs Underdog (1400)
    const expectedScore = calculateExpectedScore(1600, 1400); // ~0.76
    const newRating = calculateNewRating(1600, expectedScore, 0, 20);
    expect(newRating).toBeLessThan(1590); // significant loss
    expect(newRating).toBeCloseTo(1584.8, 0);
  });

  it("should give small increase when favorite wins", () => {
    // Favorite (1600) vs Underdog (1400)
    const expectedScore = calculateExpectedScore(1600, 1400); // ~0.76
    const newRating = calculateNewRating(1600, expectedScore, 1, 20);
    expect(newRating).toBeCloseTo(1604.8, 0); // small gain
  });

  it("should give small decrease when underdog loses", () => {
    // Underdog (1400) vs Favorite (1600)
    const expectedScore = calculateExpectedScore(1400, 1600); // ~0.24
    const newRating = calculateNewRating(1400, expectedScore, 0, 20);
    expect(newRating).toBeCloseTo(1395.2, 0); // small loss
  });

  it("should handle draw/tie (actualScore = 0.5)", () => {
    const expectedScore = calculateExpectedScore(1600, 1400);
    const newRating = calculateNewRating(1600, expectedScore, 0.5, 20);
    expect(newRating).toBeLessThan(1600); // should lose points for draw as favorite
    expect(newRating).toBeCloseTo(1594.8, 0);
  });

  it("should respect custom K-factor", () => {
    const rating1 = calculateNewRating(1500, 0.5, 1, 20);
    const rating2 = calculateNewRating(1500, 0.5, 1, 40);
    expect(rating2 - 1500).toBeCloseTo(2 * (rating1 - 1500), 1);
  });

  it("should cap rating at MAX_ELO_RATING", () => {
    const newRating = calculateNewRating(2990, 0.5, 1, 20, { maxRating: 3000 });
    expect(newRating).toBeLessThanOrEqual(3000);
  });

  it("should cap rating at MIN_ELO_RATING", () => {
    const newRating = calculateNewRating(110, 0.5, 0, 20, { minRating: 100 });
    expect(newRating).toBeGreaterThanOrEqual(100);
  });

  it("should cap maximum rating change", () => {
    // Very lopsided match where underdog wins
    const expectedScore = calculateExpectedScore(1000, 2500); // ~0.001
    const newRating = calculateNewRating(1000, expectedScore, 1, 20, {
      maxRatingChange: 30,
    });
    expect(newRating - 1000).toBeLessThanOrEqual(30);
  });

  it("should round to 2 decimal places", () => {
    const newRating = calculateNewRating(1500.123, 0.5, 1, 20);
    const decimals = (newRating.toString().split(".")[1] || "").length;
    expect(decimals).toBeLessThanOrEqual(2);
  });

  it("should throw error for invalid expected score", () => {
    expect(() => calculateNewRating(1500, 1.5, 1, 20)).toThrow("between 0 and 1");
    expect(() => calculateNewRating(1500, -0.1, 1, 20)).toThrow("between 0 and 1");
    expect(() => calculateNewRating(1500, NaN, 1, 20)).toThrow("between 0 and 1");
  });

  it("should throw error for invalid actual score", () => {
    expect(() => calculateNewRating(1500, 0.5, 0.3, 20)).toThrow(
      "must be 0 (loss), 0.5 (draw), or 1 (win)"
    );
    expect(() => calculateNewRating(1500, 0.5, 2, 20)).toThrow(
      "must be 0 (loss), 0.5 (draw), or 1 (win)"
    );
  });

  it("should throw error for invalid K-factor", () => {
    expect(() => calculateNewRating(1500, 0.5, 1, 0)).toThrow("positive number");
    expect(() => calculateNewRating(1500, 0.5, 1, -10)).toThrow("positive number");
    expect(() => calculateNewRating(1500, 0.5, 1, NaN)).toThrow("positive number");
  });

  it("should throw error for invalid current rating", () => {
    expect(() => calculateNewRating(NaN, 0.5, 1, 20)).toThrow("finite number");
    expect(() => calculateNewRating(Infinity, 0.5, 1, 20)).toThrow("finite number");
  });
});

describe("calculateTeamRating", () => {
  it("should return the rating for a single player", () => {
    const teamRating = calculateTeamRating([1500]);
    expect(teamRating).toBe(1500);
  });

  it("should calculate average for multiple players", () => {
    const teamRating = calculateTeamRating([1400, 1500, 1600]);
    expect(teamRating).toBe(1500);
  });

  it("should handle uneven averages", () => {
    const teamRating = calculateTeamRating([1500, 1600, 1450, 1550, 1500]);
    expect(teamRating).toBe(1520);
  });

  it("should round to 2 decimal places", () => {
    const teamRating = calculateTeamRating([1500, 1501, 1502]);
    const decimals = (teamRating.toString().split(".")[1] || "").length;
    expect(decimals).toBeLessThanOrEqual(2);
  });

  it("should throw error for empty array", () => {
    expect(() => calculateTeamRating([])).toThrow("must not be empty");
  });

  it("should throw error for non-array input", () => {
    expect(() => calculateTeamRating(null as any)).toThrow("must not be empty");
  });

  it("should throw error for invalid ratings", () => {
    expect(() => calculateTeamRating([1500, NaN, 1600])).toThrow(
      "non-negative finite numbers"
    );
    expect(() => calculateTeamRating([1500, -100, 1600])).toThrow(
      "non-negative finite numbers"
    );
  });
});

describe("getInitialRating", () => {
  it("should return INITIAL_ELO constant", () => {
    expect(getInitialRating()).toBe(INITIAL_ELO);
    expect(getInitialRating()).toBe(1500);
  });
});

describe("isValidRating", () => {
  it("should return true for valid ratings", () => {
    expect(isValidRating(1500)).toBe(true);
    expect(isValidRating(100)).toBe(true);
    expect(isValidRating(3000)).toBe(true);
    expect(isValidRating(1750.5)).toBe(true);
  });

  it("should return false for ratings below minimum", () => {
    expect(isValidRating(50)).toBe(false);
    expect(isValidRating(-100)).toBe(false);
  });

  it("should return false for ratings above maximum", () => {
    expect(isValidRating(3500)).toBe(false);
    expect(isValidRating(10000)).toBe(false);
  });

  it("should return false for non-finite values", () => {
    expect(isValidRating(NaN)).toBe(false);
    expect(isValidRating(Infinity)).toBe(false);
    expect(isValidRating(-Infinity)).toBe(false);
  });

  it("should respect custom min/max options", () => {
    expect(isValidRating(50, { minRating: 0, maxRating: 100 })).toBe(true);
    expect(isValidRating(150, { minRating: 0, maxRating: 100 })).toBe(false);
  });
});

describe("Integration: Full game scenarios", () => {
  it("should handle a typical 1v1 game between equal players", () => {
    // Both players start at 1500
    const player1Rating = 1500;
    const player2Rating = 1500;

    // Calculate expected scores
    const expected1 = calculateExpectedScore(player1Rating, player2Rating);
    const expected2 = calculateExpectedScore(player2Rating, player1Rating);

    expect(expected1).toBe(0.5);
    expect(expected2).toBe(0.5);

    // Player 1 wins
    const newRating1 = calculateNewRating(player1Rating, expected1, 1, K_FACTOR);
    const newRating2 = calculateNewRating(player2Rating, expected2, 0, K_FACTOR);

    expect(newRating1).toBe(1510);
    expect(newRating2).toBe(1490);

    // Rating points should be conserved (winner gains what loser loses)
    expect(newRating1 - player1Rating).toBe(-(newRating2 - player2Rating));
  });

  it("should handle a typical 5v5 game", () => {
    // Team 1: stronger team
    const team1Ratings = [1600, 1650, 1700, 1550, 1500];
    const team1Avg = calculateTeamRating(team1Ratings); // 1600

    // Team 2: weaker team
    const team2Ratings = [1500, 1450, 1500, 1450, 1500];
    const team2Avg = calculateTeamRating(team2Ratings); // 1480

    // Calculate expected scores
    const expected1 = calculateExpectedScore(team1Avg, team2Avg);
    const expected2 = calculateExpectedScore(team2Avg, team1Avg);

    expect(expected1).toBeGreaterThan(0.6); // Team 1 favored

    // Team 2 (underdog) wins!
    const ratingChange1 = K_FACTOR * (0 - expected1);
    const ratingChange2 = K_FACTOR * (1 - expected2);

    expect(ratingChange1).toBeLessThan(-10); // Team 1 loses more than 10 points
    expect(ratingChange2).toBeGreaterThan(10); // Team 2 gains more than 10 points
  });

  it("should handle uneven teams (3v5)", () => {
    // Team 1: 3 high-skill players
    const team1Ratings = [1700, 1650, 1750];
    const team1Avg = calculateTeamRating(team1Ratings); // 1700

    // Team 2: 5 average players
    const team2Ratings = [1500, 1500, 1500, 1500, 1500];
    const team2Avg = calculateTeamRating(team2Ratings); // 1500

    // The 3-player team is still favored due to higher average
    const expected1 = calculateExpectedScore(team1Avg, team2Avg);
    expect(expected1).toBeGreaterThan(0.7);

    // Calculate new ratings for various outcomes
    const team1WinsRating = calculateNewRating(team1Avg, expected1, 1, K_FACTOR);
    const team2WinsRating = calculateNewRating(team2Avg, 1 - expected1, 1, K_FACTOR);

    // If team 1 wins, small gain (expected)
    expect(team1WinsRating - team1Avg).toBeLessThan(10);

    // If team 2 wins, large gain (upset)
    expect(team2WinsRating - team2Avg).toBeGreaterThan(10);
  });

  it("should handle extreme rating differences", () => {
    const masterRating = 2500;
    const beginnerRating = 1000;

    const expectedMaster = calculateExpectedScore(masterRating, beginnerRating);
    expect(expectedMaster).toBeGreaterThan(0.99);

    // Master wins (as expected) - minimal gain
    const masterWins = calculateNewRating(masterRating, expectedMaster, 1, K_FACTOR);
    expect(masterWins - masterRating).toBeLessThan(1);

    // Master loses (huge upset) - large loss (but capped)
    const masterLoses = calculateNewRating(
      masterRating,
      expectedMaster,
      0,
      K_FACTOR,
      { maxRatingChange: 50 }
    );
    expect(masterRating - masterLoses).toBeLessThanOrEqual(50);
  });
});
