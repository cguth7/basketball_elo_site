import React, { useState } from 'react';
import { Game, Player, GamePrediction } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { predictMatch } from '../services/geminiService';
import { Check, Sparkles, Trophy } from 'lucide-react';
import { getTeamElo } from '../utils/elo';

interface ActiveGameProps {
  game: Game;
  players: Player[];
  onFinish: (gameId: string, scoreA: number, scoreB: number) => void;
}

export const ActiveGame: React.FC<ActiveGameProps> = ({ game, players, onFinish }) => {
  const [scoreA, setScoreA] = useState<string>('');
  const [scoreB, setScoreB] = useState<string>('');
  const [prediction, setPrediction] = useState<GamePrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const teamAPlayers = game.teamA.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
  const teamBPlayers = game.teamB.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];

  const handlePredict = async () => {
    setIsPredicting(true);
    const result = await predictMatch(teamAPlayers, teamBPlayers);
    setPrediction(result);
    setIsPredicting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreA && scoreB) {
      onFinish(game.id, parseInt(scoreA), parseInt(scoreB));
    }
  };

  const teamAElo = Math.round(getTeamElo(game.teamA.playerIds, players));
  const teamBElo = Math.round(getTeamElo(game.teamB.playerIds, players));

  return (
    <Card className="border-2 border-brand-500 shadow-xl">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <h2 className="font-bold text-slate-900 uppercase tracking-wider">Live Match</h2>
        </div>
        <div className="text-xs font-mono text-slate-400">ID: {game.id.slice(-4)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Team A */}
        <div className="text-center">
          <h3 className="font-black text-2xl text-brand-600 mb-1">Team A</h3>
          <p className="text-xs font-bold text-slate-400 uppercase mb-4">AVG ELO: {teamAElo}</p>
          <div className="space-y-2">
            {teamAPlayers.map(p => (
              <div key={p.id} className="bg-brand-50 text-brand-900 py-2 px-4 rounded-lg font-medium border border-brand-100">
                {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* Team B */}
        <div className="text-center">
          <h3 className="font-black text-2xl text-slate-700 mb-1">Team B</h3>
          <p className="text-xs font-bold text-slate-400 uppercase mb-4">AVG ELO: {teamBElo}</p>
          <div className="space-y-2">
            {teamBPlayers.map(p => (
              <div key={p.id} className="bg-slate-100 text-slate-900 py-2 px-4 rounded-lg font-medium border border-slate-200">
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Prediction */}
      <div className="mb-8 flex justify-center">
        {!prediction ? (
          <Button 
            onClick={handlePredict} 
            isLoading={isPredicting} 
            size="sm"
            variant="secondary"
            icon={<Sparkles className="h-3 w-3 text-yellow-400" />}
            className="bg-slate-800 text-xs"
          >
            Odds & Prediction
          </Button>
        ) : (
          <div className="bg-slate-800 text-white p-4 rounded-xl text-center max-w-md">
             <div className="flex items-center justify-center gap-2 mb-2">
               <Sparkles className="h-4 w-4 text-yellow-400" />
               <span className="font-bold text-yellow-400">Gemini Prediction</span>
             </div>
             <p className="font-medium text-lg">Favored: Team {prediction.favoredTeam} ({prediction.winProbability}%)</p>
             <p className="text-sm text-slate-400 italic mt-1">"{prediction.reasoning}"</p>
          </div>
        )}
      </div>

      {/* Scoring */}
      <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h4 className="text-center text-sm font-bold text-slate-500 uppercase mb-4">Report Final Score</h4>
        <div className="flex items-center justify-center gap-4 mb-6">
          <input 
            type="number" 
            value={scoreA} 
            onChange={e => setScoreA(e.target.value)} 
            className="w-24 h-20 text-4xl text-center font-black text-brand-600 bg-white rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-0 outline-none transition-all"
            placeholder="0"
            autoFocus
          />
          <span className="text-slate-300 font-bold text-2xl">:</span>
          <input 
            type="number" 
            value={scoreB} 
            onChange={e => setScoreB(e.target.value)} 
            className="w-24 h-20 text-4xl text-center font-black text-slate-700 bg-white rounded-xl border-2 border-slate-200 focus:border-slate-500 focus:ring-0 outline-none transition-all"
            placeholder="0"
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          className="w-full font-bold text-lg"
          disabled={!scoreA || !scoreB}
          icon={<Trophy className="h-5 w-5" />}
        >
          Finish Game & Update ELO
        </Button>
      </form>
    </Card>
  );
};