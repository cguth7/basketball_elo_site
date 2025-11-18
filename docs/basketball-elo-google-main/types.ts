
export interface Player {
  id: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  avatar?: string;
  history: { date: string; elo: number }[];
}

export interface Team {
  playerIds: string[];
  score: number;
}

export type GameStatus = 'live' | 'completed';

export interface Game {
  id: string;
  timestamp: number;
  status: GameStatus;
  creatorId: string;
  
  // Teams are populated immediately upon creation/joining
  teamA: Team;
  teamB: Team;
  
  winner: 'A' | 'B' | null; 
  eloChange: number; 
  summary?: string; 
}

export interface GamePrediction {
  favoredTeam: 'A' | 'B';
  winProbability: number;
  reasoning: string;
}

export type ViewState = 'dashboard' | 'leaderboard' | 'profile';
