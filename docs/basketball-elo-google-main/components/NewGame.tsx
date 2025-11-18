import React, { useState } from 'react';
import { Player, GamePrediction } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { predictMatch } from '../services/geminiService';
import { Users, Sparkles, ArrowRight, Check } from 'lucide-react';
import { getTeamElo } from '../utils/elo';

interface NewGameProps {
  players: Player[];
  onSubmit: (teamAIds: string[], teamBIds: string[], scoreA: number, scoreB: number) => void;
  onCancel: () => void;
}

export const NewGame: React.FC<NewGameProps> = ({ players, onSubmit, onCancel }) => {
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [scoreA, setScoreA] = useState<string>('');
  const [scoreB, setScoreB] = useState<string>('');
  const [prediction, setPrediction] = useState<GamePrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePlayerToggle = (playerId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      if (teamA.includes(playerId)) {
        setTeamA(prev => prev.filter(id => id !== playerId));
      } else {
        // Remove from B if present
        if (teamB.includes(playerId)) setTeamB(prev => prev.filter(id => id !== playerId));
        setTeamA(prev => [...prev, playerId]);
      }
    } else {
      if (teamB.includes(playerId)) {
        setTeamB(prev => prev.filter(id => id !== playerId));
      } else {
        // Remove from A if present
        if (teamA.includes(playerId)) setTeamA(prev => prev.filter(id => id !== playerId));
        setTeamB(prev => [...prev, playerId]);
      }
    }
    // Reset prediction when rosters change
    setPrediction(null);
  };

  const handlePredict = async () => {
    if (teamA.length === 0 || teamB.length === 0) return;
    setIsPredicting(true);
    
    const teamAPlayers = players.filter(p => teamA.includes(p.id));
    const teamBPlayers = players.filter(p => teamB.includes(p.id));
    
    const result = await predictMatch(teamAPlayers, teamBPlayers);
    setPrediction(result);
    setIsPredicting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamA.length && teamB.length && scoreA !== '' && scoreB !== '') {
      onSubmit(teamA, teamB, parseInt(scoreA), parseInt(scoreB));
    }
  };

  const teamAElo = Math.round(getTeamElo(teamA, players));
  const teamBElo = Math.round(getTeamElo(teamB, players));

  const unselectedPlayers = players.filter(p => !teamA.includes(p.id) && !teamB.includes(p.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Record New Game</h2>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Selection */}
        <Card title={`Team A (Avg ELO: ${teamAElo})`} className="border-t-4 border-t-brand-500">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {teamA.map(id => {
              const p = players.find(pl => pl.id === id)!;
              return (
                <div key={id} className="flex items-center justify-between p-2 bg-brand-50 rounded-md">
                  <span className="font-medium">{p.name}</span>
                  <button onClick={() => handlePlayerToggle(id, 'A')} className="text-slate-400 hover:text-red-500">
                    <Users className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            {teamA.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">Select players below</p>}
          </div>
        </Card>

        <Card title={`Team B (Avg ELO: ${teamBElo})`} className="border-t-4 border-t-slate-600">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {teamB.map(id => {
              const p = players.find(pl => pl.id === id)!;
              return (
                <div key={id} className="flex items-center justify-between p-2 bg-slate-100 rounded-md">
                  <span className="font-medium">{p.name}</span>
                  <button onClick={() => handlePlayerToggle(id, 'B')} className="text-slate-400 hover:text-red-500">
                    <Users className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
             {teamB.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">Select players below</p>}
          </div>
        </Card>
      </div>

      {/* Player Pool */}
      <Card title="Available Players">
        <div className="flex flex-wrap gap-2">
          {unselectedPlayers.map(p => (
            <div key={p.id} className="group relative inline-flex rounded-md shadow-sm">
              <button
                onClick={() => handlePlayerToggle(p.id, 'A')}
                className="px-3 py-2 text-sm font-medium text-brand-700 bg-white border border-brand-200 rounded-l-md hover:bg-brand-50 focus:z-10"
              >
                + A
              </button>
              <div className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border-t border-b border-slate-200 flex items-center min-w-[80px] justify-center">
                {p.name}
              </div>
              <button
                onClick={() => handlePlayerToggle(p.id, 'B')}
                className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-r-md hover:bg-slate-50 focus:z-10"
              >
                + B
              </button>
            </div>
          ))}
          {unselectedPlayers.length === 0 && <p className="text-sm text-slate-400">All players selected.</p>}
        </div>
      </Card>

      {/* Prediction & AI */}
      {teamA.length > 0 && teamB.length > 0 && (
        <div className="flex justify-center">
          {!prediction ? (
            <Button 
              onClick={handlePredict} 
              isLoading={isPredicting} 
              variant="secondary"
              icon={<Sparkles className="h-4 w-4 text-yellow-400" />}
              className="bg-slate-800"
            >
              Ask AI to Predict Winner
            </Button>
          ) : (
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] rounded-xl w-full">
               <div className="bg-white rounded-[11px] p-4">
                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Sparkles className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">
                        AI Prediction: Team {prediction.favoredTeam} ({prediction.winProbability}% Chance)
                      </h4>
                      <p className="text-sm text-slate-600 italic">"{prediction.reasoning}"</p>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Score Input */}
      <Card className="bg-slate-50 border-slate-200">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <label className="block text-xs font-bold text-brand-600 uppercase mb-1">Team A Score</label>
              <input 
                type="number" 
                value={scoreA} 
                onChange={e => setScoreA(e.target.value)} 
                className="w-20 h-16 text-3xl text-center font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="0"
              />
            </div>
            <span className="text-slate-300 font-bold text-2xl mt-4">-</span>
            <div className="text-center">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Team B Score</label>
              <input 
                type="number" 
                value={scoreB} 
                onChange={e => setScoreB(e.target.value)} 
                className="w-20 h-16 text-3xl text-center font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            size="lg" 
            className="w-full md:w-auto shadow-lg shadow-brand-500/30"
            icon={<Check className="h-5 w-5" />}
            disabled={!scoreA || !scoreB || teamA.length === 0 || teamB.length === 0}
          >
            Finalize Game
          </Button>
        </form>
      </Card>
    </div>
  );
};