/**
 * Example Usage of the ELO Rating System
 *
 * This file demonstrates how to use the ELO calculation library
 * in real-world scenarios.
 */

import {
  updateTeamRatings,
  createNewPlayer,
  analyzeRatingGap,
  simulateGameOutcomes,
  type Player,
} from './index';

// Example 1: Simple 1v1 game
console.log('=== Example 1: 1v1 Game (Equal Players) ===');
const player1: Player = { id: '1', name: 'Alice', rating: 1500 };
const player2: Player = { id: '2', name: 'Bob', rating: 1500 };

const result1v1 = updateTeamRatings([player1], [player2], true);
console.log('Alice wins:');
console.log(`  Alice: ${player1.rating} → ${result1v1.team1Changes[0].newRating} (${result1v1.team1Changes[0].ratingChange > 0 ? '+' : ''}${result1v1.team1Changes[0].ratingChange})`);
console.log(`  Bob: ${player2.rating} → ${result1v1.team2Changes[0].newRating} (${result1v1.team2Changes[0].ratingChange})`);
console.log();

// Example 2: 3v3 game with mixed skill levels
console.log('=== Example 2: 3v3 Game (Mixed Skills) ===');
const team1: Player[] = [
  { id: '1', name: 'Alice', rating: 1600 },
  { id: '2', name: 'Bob', rating: 1650 },
  { id: '3', name: 'Carol', rating: 1700 },
];

const team2: Player[] = [
  { id: '4', name: 'Dave', rating: 1500 },
  { id: '5', name: 'Eve', rating: 1450 },
  { id: '6', name: 'Frank', rating: 1500 },
];

console.log(`Team 1 Average: ${team1.map(p => p.rating).reduce((a, b) => a + b) / 3}`);
console.log(`Team 2 Average: ${team2.map(p => p.rating).reduce((a, b) => a + b) / 3}`);

// Analyze the matchup before the game
const analysis = analyzeRatingGap(1650, 1483.33);
console.log(`\nPre-game analysis:`);
console.log(`  Favored Team: ${analysis.favoredTeam}`);
console.log(`  Expected Win Probability: Team 1: ${(analysis.expectedScoreTeam1 * 100).toFixed(1)}%, Team 2: ${(analysis.expectedScoreTeam2 * 100).toFixed(1)}%`);
console.log(`  If Team 1 wins: ${analysis.team1MaxGain > 0 ? '+' : ''}${analysis.team1MaxGain.toFixed(1)} points`);
console.log(`  If Team 2 wins: ${analysis.team2MaxGain > 0 ? '+' : ''}${analysis.team2MaxGain.toFixed(1)} points`);

// Simulate both outcomes
const simulation = simulateGameOutcomes(team1, team2);
console.log(`\nSimulated outcomes:`);
console.log(`  If Team 1 wins: Team 1 gains ${simulation.team1Wins.team1Changes[0].ratingChange.toFixed(1)} points each`);
console.log(`  If Team 2 wins: Team 2 gains ${simulation.team2Wins.team2Changes[0].ratingChange.toFixed(1)} points each`);

// Team 2 wins (upset!)
const result3v3 = updateTeamRatings(team1, team2, false);
console.log('\nActual Result: Team 2 wins (upset!)');
console.log('Team 1 changes:');
result3v3.team1Changes.forEach(change => {
  console.log(`  ${change.playerName}: ${change.oldRating} → ${change.newRating} (${change.ratingChange.toFixed(1)})`);
});
console.log('Team 2 changes:');
result3v3.team2Changes.forEach(change => {
  console.log(`  ${change.playerName}: ${change.oldRating} → ${change.newRating} (${change.ratingChange > 0 ? '+' : ''}${change.ratingChange.toFixed(1)})`);
});
console.log();

// Example 3: Uneven teams (3v5)
console.log('=== Example 3: Uneven Teams (3v5) ===');
const team3Players: Player[] = [
  { id: '1', name: 'Pro1', rating: 1700 },
  { id: '2', name: 'Pro2', rating: 1650 },
  { id: '3', name: 'Pro3', rating: 1750 },
];

const team5Players: Player[] = [
  { id: '4', name: 'Player1', rating: 1500 },
  { id: '5', name: 'Player2', rating: 1500 },
  { id: '6', name: 'Player3', rating: 1500 },
  { id: '7', name: 'Player4', rating: 1500 },
  { id: '8', name: 'Player5', rating: 1500 },
];

const resultUneven = updateTeamRatings(team3Players, team5Players, false);
console.log(`3 skilled players (avg ${resultUneven.team1AverageRating}) vs 5 average players (avg ${resultUneven.team2AverageRating})`);
console.log(`Expected: Team 1 to win ${(resultUneven.expectedScoreTeam1 * 100).toFixed(1)}%`);
console.log(`\nActual: 5-player team wins!`);
console.log(`Rating changes: 3-player team loses ${resultUneven.team1Changes[0].ratingChange.toFixed(1)} each, 5-player team gains ${resultUneven.team2Changes[0].ratingChange > 0 ? '+' : ''}${resultUneven.team2Changes[0].ratingChange.toFixed(1)} each`);
console.log();

// Example 4: New player joining
console.log('=== Example 4: New Player Joining ===');
const newPlayer = createNewPlayer('999', 'Rookie');
console.log(`New player "${newPlayer.name}" starts at rating: ${newPlayer.rating}`);
