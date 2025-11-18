import { Player } from './types';

export const K_FACTOR = 32; // Standard K-factor for recreational leagues
export const INITIAL_ELO = 1200;

export const MOCK_PLAYERS: Player[] = [
  {
    id: '1',
    name: 'Jordan',
    elo: 1450,
    wins: 24,
    losses: 5,
    gamesPlayed: 29,
    history: [{ date: '2023-10-01', elo: 1200 }, { date: '2023-10-15', elo: 1300 }, { date: '2023-11-01', elo: 1450 }],
  },
  {
    id: '2',
    name: 'LeBron',
    elo: 1420,
    wins: 20,
    losses: 8,
    gamesPlayed: 28,
    history: [{ date: '2023-10-01', elo: 1200 }, { date: '2023-11-01', elo: 1420 }],
  },
  {
    id: '3',
    name: 'Curry',
    elo: 1380,
    wins: 15,
    losses: 10,
    gamesPlayed: 25,
    history: [{ date: '2023-10-01', elo: 1200 }, { date: '2023-11-01', elo: 1380 }],
  },
  {
    id: '4',
    name: 'Shaq',
    elo: 1150,
    wins: 5,
    losses: 15,
    gamesPlayed: 20,
    history: [{ date: '2023-10-01', elo: 1200 }, { date: '2023-11-01', elo: 1150 }],
  },
  {
    id: '5',
    name: 'Kobe',
    elo: 1300,
    wins: 10,
    losses: 10,
    gamesPlayed: 20,
    history: [{ date: '2023-10-01', elo: 1200 }, { date: '2023-11-01', elo: 1300 }],
  }
];