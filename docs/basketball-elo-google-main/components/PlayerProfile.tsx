
import React from 'react';
import { Player, Game } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trophy, XCircle, Activity, Calendar } from 'lucide-react';
import { Card } from './ui/Card';

interface PlayerProfileProps {
  player: Player;
  games: Game[];
  onClose: () => void;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, games, onClose }) => {
  const winRate = player.gamesPlayed > 0 
    ? Math.round((player.wins / player.gamesPlayed) * 100) 
    : 0;

  // Prepare chart data
  const chartData = player.history.map(h => ({
    date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    elo: h.elo
  }));

  // Add current state if not already in history for display purposes
  if (chartData.length === 0 || chartData[chartData.length - 1].elo !== player.elo) {
    chartData.push({
      date: 'Now',
      elo: player.elo
    });
  }

  // Filter games played by this player
  const playerGames = games
    .filter(g => g.status === 'completed' && (g.teamA.playerIds.includes(player.id) || g.teamB.playerIds.includes(player.id)))
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-2xl font-bold border-2 border-brand-200">
             {player.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{player.name}</h2>
            <p className="text-slate-500 flex items-center">
              <Activity className="h-4 w-4 mr-1" /> ELO Rating: <span className="font-mono font-bold text-brand-600 ml-1">{player.elo}</span>
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-900 underline">
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Wins</p>
              <p className="text-2xl font-bold text-slate-900">{player.wins}</p>
            </div>
            <Trophy className="h-8 w-8 text-green-100 text-green-500/20" />
          </div>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Losses</p>
              <p className="text-2xl font-bold text-slate-900">{player.losses}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-100 text-red-500/20" />
          </div>
        </Card>
        <Card className="border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Win Rate</p>
              <p className="text-2xl font-bold text-slate-900">{winRate}%</p>
            </div>
            <div className="h-8 w-8 rounded-full border-4 border-brand-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-brand-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Rating History" className="h-80">
        <div className="h-64 w-full">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="elo" 
                  stroke="#ea580c" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#ea580c', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Calendar className="h-12 w-12 mb-2 opacity-20" />
              <p>Not enough games played to show history.</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Match History">
        <div className="space-y-4">
          {playerGames.length === 0 && (
             <p className="text-slate-500 italic text-center py-4">No matches played yet.</p>
          )}
          {playerGames.map(game => {
            const isTeamA = game.teamA.playerIds.includes(player.id);
            const myScore = isTeamA ? game.teamA.score : game.teamB.score;
            const oppScore = isTeamA ? game.teamB.score : game.teamA.score;
            const isWin = (isTeamA && game.winner === 'A') || (!isTeamA && game.winner === 'B');
            
            return (
              <div key={game.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${isWin ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                       <p className="font-bold text-slate-900">{isWin ? 'Victory' : 'Defeat'}</p>
                       <p className="text-xs text-slate-500">{new Date(game.timestamp).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="font-mono text-xl font-bold text-slate-800">{myScore} - {oppScore}</span>
                 </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
