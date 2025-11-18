import React from 'react';
import { Game, Player } from '../types';
import { Card } from './ui/Card';
import { Calendar } from 'lucide-react';

interface RecentGamesProps {
  games: Game[];
  players: Player[];
}

export const RecentGames: React.FC<RecentGamesProps> = ({ games, players }) => {
  const sortedGames = [...games].sort((a, b) => b.timestamp - a.timestamp);

  if (sortedGames.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
          <Calendar className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No games recorded yet</h3>
        <p className="text-slate-500 mt-1">Start a new game to track ELO ratings!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedGames.map(game => {
        const teamANames = game.teamA.playerIds.map(id => players.find(p => p.id === id)?.name).join(', ');
        const teamBNames = game.teamB.playerIds.map(id => players.find(p => p.id === id)?.name).join(', ');
        
        const isAWin = game.teamA.score > game.teamB.score;

        return (
          <Card key={game.id} className="hover:shadow-md transition-shadow duration-200">
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div className="flex-1">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {new Date(game.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-brand-50 text-brand-700 rounded-full">
                      ELO Impact: ±{game.eloChange}
                    </span>
                 </div>
                 
                 <div className="flex items-center justify-between gap-8">
                   <div className={`flex-1 text-right ${isAWin ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                     {teamANames}
                   </div>
                   <div className="flex items-center gap-3 font-mono font-bold text-xl">
                     <span className={isAWin ? 'text-brand-600' : 'text-slate-400'}>{game.teamA.score}</span>
                     <span className="text-slate-300">:</span>
                     <span className={!isAWin ? 'text-brand-600' : 'text-slate-400'}>{game.teamB.score}</span>
                   </div>
                   <div className={`flex-1 text-left ${!isAWin ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                     {teamBNames}
                   </div>
                 </div>
                 
                 {game.summary && (
                   <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 italic">
                     "{game.summary}"
                   </div>
                 )}
               </div>
             </div>
          </Card>
        );
      })}
    </div>
  );
};