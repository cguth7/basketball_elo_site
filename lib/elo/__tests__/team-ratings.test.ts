/**
 * Unit tests for team-based ELO rating calculations
 */

import { describe, it, expect } from "vitest";
import {
  updateTeamRatings,
  createNewPlayer,
  analyzeRatingGap,
  simulateGameOutcomes,
} from "../team-ratings";
import { K_FACTOR } from "../constants";
import type { Player } from "../types";

describe("updateTeamRatings", () => {
  it("should update ratings for 1v1 game with equal players", () => {
    const team1: Player[] = [{ id: "1", name: "Alice", rating: 1500 }];
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1500 }];

    const result = updateTeamRatings(team1, team2, true);

    // Alice wins, should gain 10 points
    expect(result.team1Changes[0].newRating).toBe(1510);
    expect(result.team1Changes[0].ratingChange).toBe(10);

    // Bob loses, should lose 10 points
    expect(result.team2Changes[0].newRating).toBe(1490);
    expect(result.team2Changes[0].ratingChange).toBe(-10);

    // Expected scores should be 0.5 each
    expect(result.expectedScoreTeam1).toBe(0.5);
    expect(result.expectedScoreTeam2).toBe(0.5);
  });

  it("should update ratings for 3v3 game with equal teams", () => {
    const team1: Player[] = [
      { id: "1", name: "Alice", rating: 1500 },
      { id: "2", name: "Bob", rating: 1500 },
      { id: "3", name: "Carol", rating: 1500 },
    ];
    const team2: Player[] = [
      { id: "4", name: "Dave", rating: 1500 },
      { id: "5", name: "Eve", rating: 1500 },
      { id: "6", name: "Frank", rating: 1500 },
    ];

    const result = updateTeamRatings(team1, team2, true);

    // All team 1 players should gain 10 points
    result.team1Changes.forEach((change) => {
      expect(change.newRating).toBe(1510);
      expect(change.ratingChange).toBe(10);
    });

    // All team 2 players should lose 10 points
    result.team2Changes.forEach((change) => {
      expect(change.newRating).toBe(1490);
      expect(change.ratingChange).toBe(-10);
    });

    // Team averages should be 1500
    expect(result.team1AverageRating).toBe(1500);
    expect(result.team2AverageRating).toBe(1500);
  });

  it("should handle 5v5 game with mixed ratings", () => {
    const team1: Player[] = [
      { id: "1", name: "Player1", rating: 1600 },
      { id: "2", name: "Player2", rating: 1650 },
      { id: "3", name: "Player3", rating: 1700 },
      { id: "4", name: "Player4", rating: 1550 },
      { id: "5", name: "Player5", rating: 1500 },
    ];
    const team2: Player[] = [
      { id: "6", name: "Player6", rating: 1500 },
      { id: "7", name: "Player7", rating: 1450 },
      { id: "8", name: "Player8", rating: 1500 },
      { id: "9", name: "Player9", rating: 1450 },
      { id: "10", name: "Player10", rating: 1500 },
    ];

    const result = updateTeamRatings(team1, team2, false);

    // Team 1 average: 1600, Team 2 average: 1480
    expect(result.team1AverageRating).toBe(1600);
    expect(result.team2AverageRating).toBe(1480);

    // Team 1 was favored but lost - should lose more points
    result.team1Changes.forEach((change) => {
      expect(change.ratingChange).toBeLessThan(-10);
    });

    // Team 2 was underdog but won - should gain more points
    result.team2Changes.forEach((change) => {
      expect(change.ratingChange).toBeGreaterThan(10);
    });
  });

  it("should handle uneven teams (3v5)", () => {
    const team1: Player[] = [
      { id: "1", name: "Player1", rating: 1700 },
      { id: "2", name: "Player2", rating: 1650 },
      { id: "3", name: "Player3", rating: 1750 },
    ];
    const team2: Player[] = [
      { id: "4", name: "Player4", rating: 1500 },
      { id: "5", name: "Player5", rating: 1500 },
      { id: "6", name: "Player6", rating: 1500 },
      { id: "7", name: "Player7", rating: 1500 },
      { id: "8", name: "Player8", rating: 1500 },
    ];

    const result = updateTeamRatings(team1, team2, true);

    // Team 1: 3 high-skill players, avg 1700
    expect(result.team1AverageRating).toBe(1700);

    // Team 2: 5 average players, avg 1500
    expect(result.team2AverageRating).toBe(1500);

    // Team 1 is favored despite having fewer players
    expect(result.expectedScoreTeam1).toBeGreaterThan(0.7);

    // Team 1 wins as expected - small gain
    result.team1Changes.forEach((change) => {
      expect(change.ratingChange).toBeLessThan(10);
      expect(change.ratingChange).toBeGreaterThan(0);
    });
  });

  it("should handle uneven teams where the larger team has higher average", () => {
    const team1: Player[] = [
      { id: "1", name: "Player1", rating: 1400 },
      { id: "2", name: "Player2", rating: 1450 },
    ];
    const team2: Player[] = [
      { id: "3", name: "Player3", rating: 1600 },
      { id: "4", name: "Player4", rating: 1650 },
      { id: "5", name: "Player5", rating: 1700 },
      { id: "6", name: "Player6", rating: 1550 },
      { id: "7", name: "Player7", rating: 1500 },
    ];

    const result = updateTeamRatings(team1, team2, true);

    // Team 1: smaller team with lower average
    expect(result.team1AverageRating).toBe(1425);

    // Team 2: larger team with higher average (1600)
    expect(result.team2AverageRating).toBe(1600);

    // Team 1 is the underdog
    expect(result.expectedScoreTeam1).toBeLessThan(0.3);

    // Team 1 wins as underdog - large gain
    result.team1Changes.forEach((change) => {
      expect(change.ratingChange).toBeGreaterThan(10);
    });
  });

  it("should handle extreme rating differences", () => {
    const team1: Player[] = [
      { id: "1", name: "Master1", rating: 2500 },
      { id: "2", name: "Master2", rating: 2400 },
    ];
    const team2: Player[] = [
      { id: "3", name: "Beginner1", rating: 1000 },
      { id: "4", name: "Beginner2", rating: 1100 },
    ];

    const result = updateTeamRatings(team1, team2, true);

    // Masters win as expected - minimal gain
    result.team1Changes.forEach((change) => {
      expect(change.ratingChange).toBeLessThan(2);
      expect(change.ratingChange).toBeGreaterThan(0);
    });

    // Beginners lose as expected - minimal loss
    result.team2Changes.forEach((change) => {
      expect(change.ratingChange).toBeGreaterThan(-2);
      expect(change.ratingChange).toBeLessThan(0);
    });
  });

  it("should preserve total rating points in the system", () => {
    const team1: Player[] = [
      { id: "1", name: "Alice", rating: 1500 },
      { id: "2", name: "Bob", rating: 1600 },
    ];
    const team2: Player[] = [
      { id: "3", name: "Carol", rating: 1400 },
      { id: "4", name: "Dave", rating: 1500 },
    ];

    const result = updateTeamRatings(team1, team2, true);

    // Calculate total rating change for each team
    const team1TotalChange = result.team1Changes.reduce(
      (sum, change) => sum + change.ratingChange,
      0
    );
    const team2TotalChange = result.team2Changes.reduce(
      (sum, change) => sum + change.ratingChange,
      0
    );

    // Total points gained should equal total points lost
    expect(team1TotalChange + team2TotalChange).toBeCloseTo(0, 1);
  });

  it("should include all player information in changes", () => {
    const team1: Player[] = [{ id: "1", name: "Alice", rating: 1500 }];
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1500 }];

    const result = updateTeamRatings(team1, team2, true);

    // Check team 1 change structure
    expect(result.team1Changes[0].playerId).toBe("1");
    expect(result.team1Changes[0].playerName).toBe("Alice");
    expect(result.team1Changes[0].oldRating).toBe(1500);
    expect(result.team1Changes[0].newRating).toBe(1510);
    expect(result.team1Changes[0].ratingChange).toBe(10);

    // Check team 2 change structure
    expect(result.team2Changes[0].playerId).toBe("2");
    expect(result.team2Changes[0].playerName).toBe("Bob");
    expect(result.team2Changes[0].oldRating).toBe(1500);
    expect(result.team2Changes[0].newRating).toBe(1490);
    expect(result.team2Changes[0].ratingChange).toBe(-10);
  });

  it("should respect custom K-factor", () => {
    const team1: Player[] = [{ id: "1", name: "Alice", rating: 1500 }];
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1500 }];

    const result = updateTeamRatings(team1, team2, true, { kFactor: 40 });

    // With K=40, Alice should gain 20 points (double the default K=20)
    expect(result.team1Changes[0].ratingChange).toBe(20);
    expect(result.team2Changes[0].ratingChange).toBe(-20);
  });

  it("should throw error for empty team 1", () => {
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1500 }];
    expect(() => updateTeamRatings([], team2, true)).toThrow(
      "Team 1 must have at least one player"
    );
  });

  it("should throw error for empty team 2", () => {
    const team1: Player[] = [{ id: "1", name: "Alice", rating: 1500 }];
    expect(() => updateTeamRatings(team1, [], true)).toThrow(
      "Team 2 must have at least one player"
    );
  });

  it("should throw error for invalid player ID", () => {
    const team1: Player[] = [{ id: "", name: "Alice", rating: 1500 }];
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1500 }];
    expect(() => updateTeamRatings(team1, team2, true)).toThrow("Invalid player ID");
  });

  it("should throw error for invalid player name", () => {
    const team1: Player[] = [{ id: "1", name: "", rating: 1500 }];
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1500 }];
    expect(() => updateTeamRatings(team1, team2, true)).toThrow("Invalid player name");
  });

  it("should throw error for invalid rating", () => {
    const team1: Player[] = [{ id: "1", name: "Alice", rating: -100 }];
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1500 }];
    expect(() => updateTeamRatings(team1, team2, true)).toThrow("Invalid rating");
  });
});

describe("createNewPlayer", () => {
  it("should create player with initial rating", () => {
    const player = createNewPlayer("123", "John Doe");

    expect(player.id).toBe("123");
    expect(player.name).toBe("John Doe");
    expect(player.rating).toBe(1500);
  });

  it("should throw error for empty ID", () => {
    expect(() => createNewPlayer("", "John Doe")).toThrow(
      "Player ID must be a non-empty string"
    );
  });

  it("should throw error for non-string ID", () => {
    expect(() => createNewPlayer(123 as any, "John Doe")).toThrow(
      "Player ID must be a non-empty string"
    );
  });

  it("should throw error for empty name", () => {
    expect(() => createNewPlayer("123", "")).toThrow(
      "Player name must be a non-empty string"
    );
  });

  it("should throw error for non-string name", () => {
    expect(() => createNewPlayer("123", null as any)).toThrow(
      "Player name must be a non-empty string"
    );
  });
});

describe("analyzeRatingGap", () => {
  it("should analyze equal teams", () => {
    const analysis = analyzeRatingGap(1500, 1500);

    expect(analysis.ratingGap).toBe(0);
    expect(analysis.favoredTeam).toBeNull();
    expect(analysis.expectedScoreTeam1).toBe(0.5);
    expect(analysis.expectedScoreTeam2).toBe(0.5);
    expect(analysis.team1MaxGain).toBe(10);
    expect(analysis.team1MaxLoss).toBe(-10);
    expect(analysis.team2MaxGain).toBe(10);
    expect(analysis.team2MaxLoss).toBe(-10);
  });

  it("should identify team 1 as favored", () => {
    const analysis = analyzeRatingGap(1600, 1400);

    expect(analysis.ratingGap).toBe(200);
    expect(analysis.favoredTeam).toBe(1);
    expect(analysis.expectedScoreTeam1).toBeGreaterThan(0.7);
  });

  it("should identify team 2 as favored", () => {
    const analysis = analyzeRatingGap(1400, 1600);

    expect(analysis.ratingGap).toBe(-200);
    expect(analysis.favoredTeam).toBe(2);
    expect(analysis.expectedScoreTeam2).toBeGreaterThan(0.7);
  });

  it("should not identify favorite for small gaps", () => {
    const analysis = analyzeRatingGap(1525, 1500);

    expect(analysis.ratingGap).toBe(25);
    expect(analysis.favoredTeam).toBeNull(); // Less than 50 point threshold
  });

  it("should calculate correct max gains and losses", () => {
    const analysis = analyzeRatingGap(1600, 1400);

    // Team 1 is favored (expected ~0.76), so:
    // - Max gain if they win: 20 * (1 - 0.76) = ~4.8
    // - Max loss if they lose: 20 * (0 - 0.76) = ~-15.2
    expect(analysis.team1MaxGain).toBeCloseTo(4.8, 1);
    expect(analysis.team1MaxLoss).toBeCloseTo(-15.2, 1);

    // Team 2 is underdog (expected ~0.24), so:
    // - Max gain if they win: 20 * (1 - 0.24) = ~15.2
    // - Max loss if they lose: 20 * (0 - 0.24) = ~-4.8
    expect(analysis.team2MaxGain).toBeCloseTo(15.2, 1);
    expect(analysis.team2MaxLoss).toBeCloseTo(-4.8, 1);
  });

  it("should respect custom K-factor", () => {
    const analysis = analyzeRatingGap(1500, 1500, 40);

    expect(analysis.team1MaxGain).toBe(20); // 40 * 0.5
    expect(analysis.team1MaxLoss).toBe(-20);
  });
});

describe("simulateGameOutcomes", () => {
  it("should simulate both win scenarios", () => {
    const team1: Player[] = [{ id: "1", name: "Alice", rating: 1600 }];
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1400 }];

    const simulation = simulateGameOutcomes(team1, team2);

    // Check team 1 wins scenario
    expect(simulation.team1Wins.team1Changes[0].ratingChange).toBeGreaterThan(0);
    expect(simulation.team1Wins.team2Changes[0].ratingChange).toBeLessThan(0);

    // Check team 2 wins scenario
    expect(simulation.team2Wins.team1Changes[0].ratingChange).toBeLessThan(0);
    expect(simulation.team2Wins.team2Changes[0].ratingChange).toBeGreaterThan(0);
  });

  it("should show complementary outcomes", () => {
    const team1: Player[] = [{ id: "1", name: "Alice", rating: 1500 }];
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1500 }];

    const simulation = simulateGameOutcomes(team1, team2);

    // Rating changes should be opposite
    expect(simulation.team1Wins.team1Changes[0].ratingChange).toBe(10);
    expect(simulation.team2Wins.team1Changes[0].ratingChange).toBe(-10);
  });

  it("should use custom options", () => {
    const team1: Player[] = [{ id: "1", name: "Alice", rating: 1500 }];
    const team2: Player[] = [{ id: "2", name: "Bob", rating: 1500 }];

    const simulation = simulateGameOutcomes(team1, team2, { kFactor: 40 });

    // With K=40, rating change should be double
    expect(simulation.team1Wins.team1Changes[0].ratingChange).toBe(20);
  });
});

describe("Real-world scenarios", () => {
  it("should handle pickup game where only 7 of 10 players use app", () => {
    // 4 tracked players on team 1
    const team1: Player[] = [
      { id: "1", name: "Alice", rating: 1600 },
      { id: "2", name: "Bob", rating: 1550 },
      { id: "3", name: "Carol", rating: 1650 },
      { id: "4", name: "Dave", rating: 1500 },
    ];

    // 3 tracked players on team 2 (other 3 players not in system)
    const team2: Player[] = [
      { id: "5", name: "Eve", rating: 1500 },
      { id: "6", name: "Frank", rating: 1450 },
      { id: "7", name: "Grace", rating: 1550 },
    ];

    // Team 2 wins
    const result = updateTeamRatings(team1, team2, false);

    // Only tracked players get rating updates
    expect(result.team1Changes.length).toBe(4);
    expect(result.team2Changes.length).toBe(3);

    // All tracked players on winning team gain points
    result.team2Changes.forEach((change) => {
      expect(change.ratingChange).toBeGreaterThan(0);
    });
  });

  it("should handle beginner vs experienced matchup", () => {
    // New players (all at 1500)
    const beginners: Player[] = [
      { id: "1", name: "Newbie1", rating: 1500 },
      { id: "2", name: "Newbie2", rating: 1500 },
      { id: "3", name: "Newbie3", rating: 1500 },
    ];

    // Experienced players
    const veterans: Player[] = [
      { id: "4", name: "Veteran1", rating: 1800 },
      { id: "5", name: "Veteran2", rating: 1750 },
      { id: "6", name: "Veteran3", rating: 1850 },
    ];

    // Beginners win (huge upset)
    const result = updateTeamRatings(beginners, veterans, true);

    // Beginners should gain significant points
    result.team1Changes.forEach((change) => {
      expect(change.ratingChange).toBeGreaterThan(15);
    });

    // Veterans should lose significant points
    result.team2Changes.forEach((change) => {
      expect(change.ratingChange).toBeLessThan(-15);
    });
  });

  it("should handle close game between well-matched teams", () => {
    const team1: Player[] = [
      { id: "1", name: "Player1", rating: 1595 },
      { id: "2", name: "Player2", rating: 1610 },
      { id: "3", name: "Player3", rating: 1588 },
    ];

    const team2: Player[] = [
      { id: "4", name: "Player4", rating: 1602 },
      { id: "5", name: "Player5", rating: 1590 },
      { id: "6", name: "Player6", rating: 1605 },
    ];

    const result = updateTeamRatings(team1, team2, true);

    // Very close average ratings, so expected scores should be near 0.5
    expect(Math.abs(result.expectedScoreTeam1 - 0.5)).toBeLessThan(0.1);

    // Rating changes should be moderate
    result.team1Changes.forEach((change) => {
      expect(Math.abs(change.ratingChange)).toBeLessThan(15);
    });
  });
});
