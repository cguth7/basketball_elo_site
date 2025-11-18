import React from 'react';
import { Player } from '../types';
import { Card } from './ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  onPlayerClick: (player: Player) => void;
  limit?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players, onPlayerClick, limit }) => {
  // Sort players by ELO descending
  const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);
  const displayPlayers = limit ? sortedPlayers.slice(0, limit) : sortedPlayers;

  const getRankChangeIcon = (player: Player, index: number) => {
    // Mock logic for rank change: randomness for demo visuals
    // In a real app, we'd compare to previous rank snapshot
    if (index === 0) return <Minus className="h-4 w-4 text-slate-400" />;
    if (player.wins > player.losses * 2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (player.losses > player.wins) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-medium">Rank</th>
              <th className="px-6 py-3 font-medium">Player</th>
              <th className="px-6 py-3 font-medium text-right">Rating</th>
              <th className="px-6 py-3 font-medium text-right">W - L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayPlayers.map((player, index) => (
              <tr 
                key={player.id} 
                onClick={() => onPlayerClick(player)}
                className="hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4 font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-slate-200 text-slate-700' : 
                      index === 2 ? 'bg-orange-100 text-orange-800' : 'text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                    {getRankChangeIcon(player, index)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold mr-3 border border-brand-100">
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                      {player.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                  {player.elo}
                </td>
                <td className="px-6 py-4 text-right text-slate-500">
                  <span className="text-green-600 font-medium">{player.wins}</span> - <span className="text-red-600 font-medium">{player.losses}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {limit && players.length > limit && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-500">And {players.length - limit} more players...</span>
        </div>
      )}
    </Card>
  );
};