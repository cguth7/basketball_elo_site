
import React, { useState } from 'react';
import { Game, Player, GamePrediction } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { predictMatch } from '../services/geminiService';
import { Users, Trash2, Check, Sparkles, UserMinus, UserPlus, Trophy } from 'lucide-react';
import { getTeamElo } from '../utils/elo';

interface GameLobbyProps {
  game: Game;
  players: Player[];
  currentUserId: string;
  onJoinTeam: (gameId: string, team: 'A' | 'B') => void;
  onLeaveGame: (gameId: string) => void;
  onFinish: (gameId: string, scoreA: number, scoreB: number) => void;
  onDelete: (gameId: string) => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ 
  game, 
  players, 
  currentUserId,
  onJoinTeam, 
  onLeaveGame,
  onFinish, 
  onDelete 
}) => {
  const [scoreA, setScoreA] = useState<string>('');
  const [scoreB, setScoreB] = useState<string>('');
  const [prediction, setPrediction] = useState<GamePrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const isCreator = game.creatorId === currentUserId;
  const teamAPlayers = game.teamA.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
  const teamBPlayers = game.teamB.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
  
  const userTeam = game.teamA.playerIds.includes(currentUserId) ? 'A' : game.teamB.playerIds.includes(currentUserId) ? 'B' : null;

  const teamAElo = Math.round(getTeamElo(game.teamA.playerIds, players));
  const teamBElo = Math.round(getTeamElo(game.teamB.playerIds, players));

  const handlePredict = async () => {
    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) return;
    setIsPredicting(true);
    const result = await predictMatch(teamAPlayers, teamBPlayers);
    setPrediction(result);
    setIsPredicting(false);
  };

  const handleSubmitScore = () => {
    if (scoreA && scoreB) {
      onFinish(game.id, parseInt(scoreA), parseInt(scoreB));
    }
  };

  return (
    <Card className="border-l-4 border-l-brand-500 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-visible">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
             <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Live Game</span>
             <span className="text-xs text-slate-400">• {new Date(game.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Pottruck Court #{game.id.slice(-2)}</h3>
        </div>
        
        {isCreator && (
          <Button 
            onClick={() => onDelete(game.id)} 
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 self-end md:self-auto"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Cancel
          </Button>
        )}
      </div>

      {/* Prediction Area */}
      {(teamAPlayers.length > 0 && teamBPlayers.length > 0) && (
        <div className="mb-6">
          {!prediction ? (
             <button 
               onClick={handlePredict}
               disabled={isPredicting}
               className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:underline mx-auto"
             >
               <Sparkles className={`h-3 w-3 ${isPredicting ? 'animate-spin' : ''}`} />
               {isPredicting ? 'Consulting the stars...' : 'Get AI Win Probability'}
             </button>
          ) : (
            <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-900 flex gap-2 items-start">
               <Sparkles className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
               <div>
                 <span className="font-bold">AI Predicts: Team {prediction.favoredTeam} ({prediction.winProbability}%)</span>
                 <p className="opacity-80 italic mt-1">"{prediction.reasoning}"</p>
               </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8">
        {/* TEAM A */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h4 className="font-black text-slate-900">TEAM A</h4>
            <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">ELO: {teamAElo}</span>
          </div>
          
          <div className="space-y-2 min-h-[80px]">
            {teamAPlayers.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-brand-50 border border-brand-100 p-2 rounded-lg shadow-sm">
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-brand-700 border border-brand-200">
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-900 truncate">{p.name}</span>
              </div>
            ))}
            {teamAPlayers.length === 0 && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-400 italic">Empty</span>
              </div>
            )}
          </div>

          {userTeam === 'A' ? (
            <Button 
              onClick={() => onLeaveGame(game.id)}
              variant="outline" 
              size="sm" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              icon={<UserMinus className="h-3 w-3" />}
            >
              Leave
            </Button>
          ) : (
            <Button 
              onClick={() => onJoinTeam(game.id, 'A')}
              disabled={!!userTeam}
              variant="outline" 
              size="sm" 
              className="w-full hover:border-brand-500 hover:text-brand-600"
              icon={<UserPlus className="h-3 w-3" />}
            >
              Join Team A
            </Button>
          )}
        </div>

        {/* TEAM B */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h4 className="font-black text-slate-900">TEAM B</h4>
            <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">ELO: {teamBElo}</span>
          </div>
          
          <div className="space-y-2 min-h-[80px]">
            {teamBPlayers.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-slate-100 border border-slate-200 p-2 rounded-lg shadow-sm">
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-700 border border-slate-200">
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-900 truncate">{p.name}</span>
              </div>
            ))}
            {teamBPlayers.length === 0 && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-400 italic">Empty</span>
              </div>
            )}
          </div>

          {userTeam === 'B' ? (
            <Button 
              onClick={() => onLeaveGame(game.id)}
              variant="outline" 
              size="sm" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              icon={<UserMinus className="h-3 w-3" />}
            >
              Leave
            </Button>
          ) : (
            <Button 
              onClick={() => onJoinTeam(game.id, 'B')}
              disabled={!!userTeam}
              variant="outline" 
              size="sm" 
              className="w-full hover:border-slate-500 hover:text-slate-700"
              icon={<UserPlus className="h-3 w-3" />}
            >
              Join Team B
            </Button>
          )}
        </div>
      </div>

      {/* Host Controls */}
      {isCreator && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-400 uppercase text-center">Record Final Score</label>
            <div className="flex items-center justify-center gap-3">
               <input 
                  type="number" 
                  value={scoreA}
                  onChange={(e) => setScoreA(e.target.value)}
                  placeholder="A" 
                  className="w-16 h-12 text-center font-bold text-xl border border-slate-300 rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
               />
               <span className="font-bold text-slate-300">-</span>
               <input 
                  type="number" 
                  value={scoreB}
                  onChange={(e) => setScoreB(e.target.value)}
                  placeholder="B" 
                  className="w-16 h-12 text-center font-bold text-xl border border-slate-300 rounded-lg focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none"
               />
               <Button 
                 onClick={handleSubmitScore}
                 disabled={!scoreA || !scoreB}
                 className="ml-2"
                 icon={<Trophy className="h-4 w-4" />}
               >
                 Submit
               </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
