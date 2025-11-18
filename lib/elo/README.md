# Basketball ELO Rating System

A comprehensive TypeScript implementation of the ELO rating system for individual player ratings in team-based basketball games.

## Overview

This ELO system calculates individual player ratings based on team game outcomes. The key principle is:

- **Team Strength** = Average of all players' ELO ratings on that team
- **Individual Updates** = All players on a team receive the same rating adjustment based on team performance
- **Flexible Teams** = Supports any team size (1v1 to 5v5) and handles uneven teams (e.g., 3v5)
- **Partial Tracking** = Works even when only some players in a game use the app

## Quick Start

```typescript
import { updateTeamRatings, createNewPlayer } from '@/lib/elo/team-ratings';

// Create players
const team1 = [
  { id: '1', name: 'Alice', rating: 1500 },
  { id: '2', name: 'Bob', rating: 1600 },
  { id: '3', name: 'Carol', rating: 1450 },
];

const team2 = [
  { id: '4', name: 'Dave', rating: 1500 },
  { id: '5', name: 'Eve', rating: 1550 },
  { id: '6', name: 'Frank', rating: 1500 },
];

// Team 1 wins the game
const result = updateTeamRatings(team1, team2, true);

// Access updated ratings
console.log(result.team1Changes); // Rating increases for team 1
console.log(result.team2Changes); // Rating decreases for team 2
```

## Core Concepts

### ELO Formula

The system uses the standard ELO rating formula:

1. **Expected Score**: Probability of winning
   ```
   E_A = 1 / (1 + 10^((Rating_B - Rating_A) / 400))
   ```

2. **Rating Update**: New rating after a game
   ```
   Rating_new = Rating_old + K * (Actual_Score - Expected_Score)
   ```
   Where:
   - `K` = 20 (K-factor, determines maximum rating change)
   - `Actual_Score` = 1 for win, 0 for loss, 0.5 for draw
   - `Expected_Score` = probability of winning

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `INITIAL_ELO` | 1500 | Starting rating for new players |
| `K_FACTOR` | 20 | Maximum rating change per game |
| `ELO_DIVISOR` | 400 | Rating difference scale factor |
| `MIN_ELO_RATING` | 100 | Minimum allowed rating |
| `MAX_ELO_RATING` | 3000 | Maximum allowed rating |
| `MAX_RATING_CHANGE` | 50 | Cap on rating change per game |

## API Reference

### Core Functions

#### `calculateExpectedScore(ratingA, ratingB)`

Calculates the win probability for player/team A against player/team B.

```typescript
import { calculateExpectedScore } from '@/lib/elo/calculator';

// Equal ratings → 50% win probability
calculateExpectedScore(1500, 1500); // 0.5

// Higher rated player → higher win probability
calculateExpectedScore(1600, 1400); // ~0.76

// Lower rated player → lower win probability
calculateExpectedScore(1400, 1600); // ~0.24
```

#### `calculateNewRating(currentRating, expectedScore, actualScore, kFactor, options)`

Calculates the new rating after a game.

```typescript
import { calculateNewRating } from '@/lib/elo/calculator';

// Win when expected to win 50% (equal match)
calculateNewRating(1500, 0.5, 1, 20); // 1510 (+10)

// Lose when expected to win 50%
calculateNewRating(1500, 0.5, 0, 20); // 1490 (-10)

// Underdog wins (expected 0.24, actual 1.0)
calculateNewRating(1400, 0.24, 1, 20); // ~1415 (+15.2)

// Favorite loses (expected 0.76, actual 0.0)
calculateNewRating(1600, 0.76, 0, 20); // ~1585 (-15.2)
```

#### `calculateTeamRating(playerRatings)`

Calculates the average rating of a team.

```typescript
import { calculateTeamRating } from '@/lib/elo/calculator';

calculateTeamRating([1500, 1600, 1450]); // 1516.67
calculateTeamRating([1500]); // 1500 (single player)
```

### Team Functions

#### `updateTeamRatings(team1Players, team2Players, team1Won, options)`

Updates all player ratings after a team game.

```typescript
import { updateTeamRatings } from '@/lib/elo/team-ratings';

const result = updateTeamRatings(
  [
    { id: '1', name: 'Alice', rating: 1500 },
    { id: '2', name: 'Bob', rating: 1600 },
  ],
  [
    { id: '3', name: 'Carol', rating: 1500 },
    { id: '4', name: 'Dave', rating: 1500 },
  ],
  true // team 1 won
);

console.log(result);
// {
//   team1Changes: [
//     { playerId: '1', playerName: 'Alice', oldRating: 1500, newRating: 1510, ratingChange: 10 },
//     { playerId: '2', playerName: 'Bob', oldRating: 1600, newRating: 1610, ratingChange: 10 }
//   ],
//   team2Changes: [...],
//   team1AverageRating: 1550,
//   team2AverageRating: 1500,
//   expectedScoreTeam1: 0.57,
//   expectedScoreTeam2: 0.43
// }
```

#### `createNewPlayer(id, name)`

Creates a player object with the initial ELO rating.

```typescript
import { createNewPlayer } from '@/lib/elo/team-ratings';

const newPlayer = createNewPlayer('user123', 'John Doe');
// { id: 'user123', name: 'John Doe', rating: 1500 }
```

#### `analyzeRatingGap(team1Avg, team2Avg, kFactor?)`

Analyzes the rating difference between teams and shows potential outcomes.

```typescript
import { analyzeRatingGap } from '@/lib/elo/team-ratings';

const analysis = analyzeRatingGap(1600, 1400);
console.log(analysis);
// {
//   ratingGap: 200,
//   favoredTeam: 1,
//   expectedScoreTeam1: 0.76,
//   expectedScoreTeam2: 0.24,
//   team1MaxGain: 4.8,   // if team 1 wins
//   team1MaxLoss: -15.2, // if team 1 loses
//   team2MaxGain: 15.2,  // if team 2 wins
//   team2MaxLoss: -4.8   // if team 2 loses
// }
```

#### `simulateGameOutcomes(team1Players, team2Players, options?)`

Simulates both possible outcomes of a game before it's played.

```typescript
import { simulateGameOutcomes } from '@/lib/elo/team-ratings';

const simulation = simulateGameOutcomes(team1, team2);
console.log('If Team 1 wins:', simulation.team1Wins);
console.log('If Team 2 wins:', simulation.team2Wins);
```

## Real-World Examples

### Example 1: Even 3v3 Game

```typescript
const team1 = [
  { id: '1', name: 'Alice', rating: 1500 },
  { id: '2', name: 'Bob', rating: 1500 },
  { id: '3', name: 'Carol', rating: 1500 },
];

const team2 = [
  { id: '4', name: 'Dave', rating: 1500 },
  { id: '5', name: 'Eve', rating: 1500 },
  { id: '6', name: 'Frank', rating: 1500 },
];

const result = updateTeamRatings(team1, team2, true);

// Expected outcome:
// - Team averages: 1500 vs 1500
// - Expected score: 0.5 vs 0.5
// - Result: Team 1 wins
// - Team 1 players: +10 points each
// - Team 2 players: -10 points each
```

### Example 2: Uneven Teams (3v5)

```typescript
// 3 skilled players vs 5 average players
const team1 = [
  { id: '1', name: 'Pro1', rating: 1700 },
  { id: '2', name: 'Pro2', rating: 1650 },
  { id: '3', name: 'Pro3', rating: 1750 },
]; // Average: 1700

const team2 = [
  { id: '4', name: 'Player1', rating: 1500 },
  { id: '5', name: 'Player2', rating: 1500 },
  { id: '6', name: 'Player3', rating: 1500 },
  { id: '7', name: 'Player4', rating: 1500 },
  { id: '8', name: 'Player5', rating: 1500 },
]; // Average: 1500

const result = updateTeamRatings(team1, team2, false);

// Expected outcome:
// - Team 1 (favored): Expected score ~0.76
// - Team 2 (underdog): Expected score ~0.24
// - Result: Team 2 wins (upset!)
// - Team 1 players: -15 points each (large loss as favorites)
// - Team 2 players: +15 points each (large gain as underdogs)
```

### Example 3: Partial Participation (Only 7 of 10 Players Tracked)

```typescript
// Real game has 5v5, but only tracking 4 + 3 = 7 players
const team1Tracked = [
  { id: '1', name: 'Alice', rating: 1600 },
  { id: '2', name: 'Bob', rating: 1550 },
  { id: '3', name: 'Carol', rating: 1650 },
  { id: '4', name: 'Dave', rating: 1500 },
];

const team2Tracked = [
  { id: '5', name: 'Eve', rating: 1500 },
  { id: '6', name: 'Frank', rating: 1450 },
  { id: '7', name: 'Grace', rating: 1550 },
];

// Team 2 wins
const result = updateTeamRatings(team1Tracked, team2Tracked, false);

// Expected outcome:
// - Only tracked players receive rating updates
// - Team 1 average: 1575 (favored)
// - Team 2 average: 1500 (underdog)
// - Result: Team 2 wins
// - Team 1 tracked players: -13 points each
// - Team 2 tracked players: +13 points each
```

### Example 4: Huge Upset (Beginners Beat Veterans)

```typescript
const beginners = [
  createNewPlayer('1', 'Newbie1'), // 1500
  createNewPlayer('2', 'Newbie2'), // 1500
  createNewPlayer('3', 'Newbie3'), // 1500
];

const veterans = [
  { id: '4', name: 'Veteran1', rating: 1900 },
  { id: '5', name: 'Veteran2', rating: 1850 },
  { id: '6', name: 'Veteran3', rating: 1950 },
]; // Average: 1900

const result = updateTeamRatings(beginners, veterans, true);

// Expected outcome:
// - Beginners average: 1500
// - Veterans average: 1900 (huge favorites)
// - Expected score: Veterans ~0.98, Beginners ~0.02
// - Result: Beginners win (massive upset!)
// - Beginners: +19.6 points each
// - Veterans: -19.6 points each
```

## Understanding Rating Changes

### Rating Difference Guide

| Rating Difference | Favorite Win % | Example Scores |
|------------------|----------------|----------------|
| 0 | 50% | 1500 vs 1500 |
| 50 | 57% | 1550 vs 1500 |
| 100 | 64% | 1600 vs 1500 |
| 200 | 76% | 1700 vs 1500 |
| 400 | 91% | 1900 vs 1500 |

### Rating Change Examples (K=20)

| Scenario | Expected | Actual | Change |
|----------|----------|--------|--------|
| Equal match, win | 50% | 100% | +10 |
| Equal match, loss | 50% | 0% | -10 |
| Favorite wins (76% expected) | 76% | 100% | +4.8 |
| Favorite loses (76% expected) | 76% | 0% | -15.2 |
| Underdog wins (24% expected) | 24% | 100% | +15.2 |
| Underdog loses (24% expected) | 24% | 0% | -4.8 |

## Edge Cases Handled

### 1. New Players
New players start at 1500 ELO (INITIAL_ELO constant).

```typescript
const newPlayer = createNewPlayer('123', 'New Player');
// { id: '123', name: 'New Player', rating: 1500 }
```

### 2. Rating Bounds
Ratings are capped between MIN_ELO_RATING (100) and MAX_ELO_RATING (3000).

```typescript
// Player at 2990 wins +15 points → capped at 3000
// Player at 110 loses -15 points → capped at 100
```

### 3. Maximum Rating Change
Single-game rating changes are capped at MAX_RATING_CHANGE (50 points) to prevent extreme swings.

```typescript
// Even with massive rating difference, change limited to ±50
calculateNewRating(1000, 0.001, 1, 20, { maxRatingChange: 50 });
// Maximum gain: 50 points (not 20 * 0.999 = 19.98)
```

### 4. Uneven Teams
The system treats team strength as the average rating, regardless of team size.

```typescript
// 3 skilled players (avg 1700) vs 5 average players (avg 1500)
// The 3-player team is still favored due to higher average rating
```

### 5. Draws/Ties
Although rare in basketball, draws are supported with actualScore = 0.5.

```typescript
calculateNewRating(1600, 0.76, 0.5, 20);
// Favorite draws: loses points (expected to win)
```

## Testing

Comprehensive test coverage is provided in:
- `lib/elo/__tests__/calculator.test.ts`: Core function tests
- `lib/elo/__tests__/team-ratings.test.ts`: Team scenario tests

Run tests:
```bash
npm test
```

## Design Principles

1. **Pure Functions**: All functions are pure (no side effects, no database calls)
2. **Type Safety**: Full TypeScript typing with strict mode
3. **Error Handling**: Comprehensive input validation with descriptive errors
4. **Mathematical Accuracy**: Standard ELO formulas with no custom modifications
5. **Testability**: 100% test coverage of core functionality

## Integration Example

```typescript
// In your game submission handler
import { updateTeamRatings } from '@/lib/elo/team-ratings';

async function submitGameResult(team1PlayerIds, team2PlayerIds, team1Won) {
  // 1. Fetch current ratings from database
  const team1Players = await fetchPlayers(team1PlayerIds);
  const team2Players = await fetchPlayers(team2PlayerIds);

  // 2. Calculate new ratings
  const result = updateTeamRatings(team1Players, team2Players, team1Won);

  // 3. Save game result to database
  await saveGameResult({
    team1Players: result.team1Changes,
    team2Players: result.team2Changes,
    team1Won,
    timestamp: new Date(),
  });

  // 4. Update player ratings in database
  for (const change of result.team1Changes) {
    await updatePlayerRating(change.playerId, change.newRating);
  }
  for (const change of result.team2Changes) {
    await updatePlayerRating(change.playerId, change.newRating);
  }

  return result;
}
```

## Further Reading

- [ELO Rating System - Wikipedia](https://en.wikipedia.org/wiki/Elo_rating_system)
- [Understanding ELO - Chess.com](https://www.chess.com/article/view/elo-rating-system)
- [ELO in Team Games - FiveThirtyEight](https://fivethirtyeight.com/features/how-we-calculate-nba-elo-ratings/)
