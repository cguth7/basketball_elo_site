import { Player, Team } from '../types';
import { K_FACTOR } from '../constants';

/**
 * Calculates the expected score for a team based on their average ELO vs opponent average ELO.
 * Formula: E = 1 / (1 + 10 ^ ((Rb - Ra) / 400))
 */
export const getExpectedScore = (ratingA: number, ratingB: number): number => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

/**
 * Calculates the average ELO of a team.
 */
export const getTeamElo = (playerIds: string[], allPlayers: Player[]): number => {
  if (playerIds.length === 0) return 0;
  
  const totalElo = playerIds.reduce((sum, id) => {
    const player = allPlayers.find(p => p.id === id);
    return sum + (player ? player.elo : 1200);
  }, 0);
  
  return totalElo / playerIds.length;
};

/**
 * Calculates the ELO change for a match.
 * Returns the points to be added to the winner (and subtracted from the loser).
 */
export const calculateEloChange = (
  teamAIds: string[],
  teamBIds: string[],
  allPlayers: Player[],
  winner: 'A' | 'B'
): number => {
  const ratingA = getTeamElo(teamAIds, allPlayers);
  const ratingB = getTeamElo(teamBIds, allPlayers);

  const expectedA = getExpectedScore(ratingA, ratingB);
  
  // actualScore is 1 for win, 0 for loss
  const actualA = winner === 'A' ? 1 : 0;
  
  const change = Math.round(K_FACTOR * (actualA - expectedA));
  
  // If Team A won, change is positive. If Team A lost, change is negative.
  // We always return the absolute magnitude of change for the WINNER to gain.
  // Wait, let's be precise:
  // If A wins (1): change = K * (1 - E_A). Since E_A < 1, change is positive.
  // If A loses (0): change = K * (0 - E_A). Change is negative.
  
  // We will return the absolute value to apply to the winner, and subtract from loser.
  return Math.abs(change);
};