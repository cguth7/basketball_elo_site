
import React, { useState, useEffect } from 'react';
import { Player, Game, ViewState } from './types';
import { MOCK_PLAYERS } from './constants';
import { calculateEloChange } from './utils/elo';
import { generateGameSummary } from './services/geminiService';
import { Leaderboard } from './components/Leaderboard';
import { RecentGames } from './components/RecentGames';
import { PlayerProfile } from './components/PlayerProfile';
import { GameLobby } from './components/GameLobby';
import { Button } from './components/ui/Button';
import { LayoutDashboard, Trophy, Plus, LogOut, MapPin, RefreshCw, History } from 'lucide-react';

const App: React.FC = () => {
  // -- State --
  const [view, setView] = useState<ViewState>('dashboard');
  const [currentUserId, setCurrentUserId] = useState<string>('1');
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'live' | 'history'>('live');

  const currentUser = players.find(p => p.id === currentUserId);

  // -- Init --
  useEffect(() => {
    const storedPlayers = localStorage.getItem('pottruck_players');
    const storedGames = localStorage.getItem('pottruck_games');

    if (storedPlayers) {
      setPlayers(JSON.parse(storedPlayers));
    } else {
      setPlayers(MOCK_PLAYERS);
      localStorage.setItem('pottruck_players', JSON.stringify(MOCK_PLAYERS));
    }

    if (storedGames) {
      setGames(JSON.parse(storedGames));
    }
  }, []);

  // -- Persistence --
  useEffect(() => {
    if (players.length > 0) localStorage.setItem('pottruck_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    if (games.length > 0) localStorage.setItem('pottruck_games', JSON.stringify(games));
  }, [games]);

  // -- Handlers --

  const handleCreateLobby = () => {
    const newGame: Game = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: 'live',
      creatorId: currentUserId,
      teamA: { playerIds: [], score: 0 },
      teamB: { playerIds: [], score: 0 },
      winner: null,
      eloChange: 0
    };
    setGames(prev => [newGame, ...prev]);
    setDashboardTab('live');
  };

  const handleJoinTeam = (gameId: string, team: 'A' | 'B') => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;

      const playerIdsA = g.teamA.playerIds.filter(id => id !== currentUserId);
      const playerIdsB = g.teamB.playerIds.filter(id => id !== currentUserId);

      if (team === 'A') {
        return {
          ...g,
          teamA: { ...g.teamA, playerIds: [...playerIdsA, currentUserId] },
          teamB: { ...g.teamB, playerIds: playerIdsB }
        };
      } else {
        return {
          ...g,
          teamA: { ...g.teamA, playerIds: playerIdsA },
          teamB: { ...g.teamB, playerIds: [...playerIdsB, currentUserId] }
        };
      }
    }));
  };

  const handleLeaveGame = (gameId: string) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      return {
        ...g,
        teamA: { ...g.teamA, playerIds: g.teamA.playerIds.filter(id => id !== currentUserId) },
        teamB: { ...g.teamB, playerIds: g.teamB.playerIds.filter(id => id !== currentUserId) }
      };
    }));
  };

  const handleDeleteLobby = (gameId: string) => {
    setGames(prev => prev.filter(g => g.id !== gameId));
  };

  const handleFinishGame = async (gameId: string, scoreA: number, scoreB: number) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const winner = scoreA > scoreB ? 'A' : 'B';
    const teamAIds = game.teamA.playerIds;
    const teamBIds = game.teamB.playerIds;

    // 1. Calculate ELO
    const eloChange = calculateEloChange(teamAIds, teamBIds, players, winner);

    // 2. Update Players
    const updatedPlayers = players.map(p => {
      const isTeamA = teamAIds.includes(p.id);
      const isTeamB = teamBIds.includes(p.id);
      
      if (!isTeamA && !isTeamB) return p;

      const isWinner = (isTeamA && winner === 'A') || (isTeamB && winner === 'B');
      const newElo = Math.round(p.elo + (isWinner ? eloChange : -eloChange));
      
      return {
        ...p,
        elo: newElo,
        wins: p.wins + (isWinner ? 1 : 0),
        losses: p.losses + (!isWinner ? 1 : 0),
        gamesPlayed: p.gamesPlayed + 1,
        history: [...p.history, { date: new Date().toISOString(), elo: newElo }]
      };
    });

    setPlayers(updatedPlayers);

    // 3. Update Game Record
    setGames(prev => prev.map(g => {
      if (g.id === gameId) {
        return {
          ...g,
          status: 'completed',
          teamA: { ...g.teamA, score: scoreA },
          teamB: { ...g.teamB, score: scoreB },
          winner,
          eloChange,
          summary: "Generating match report..."
        };
      }
      return g;
    }));

    // 4. Generate AI Summary (Async)
    setIsGeneratingSummary(true);
    
    const teamAObj = updatedPlayers.filter(p => teamAIds.includes(p.id));
    const teamBObj = updatedPlayers.filter(p => teamBIds.includes(p.id));

    const summary = await generateGameSummary(teamAObj, teamBObj, scoreA, scoreB, winner);
    
    setGames(prev => prev.map(g => 
      g.id === gameId ? { ...g, summary: summary || "Game completed." } : g
    ));
    setIsGeneratingSummary(false);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setView('profile');
  };

  // Filter games
  const liveGames = games.filter(g => g.status === 'live');
  const pastGames = games.filter(g => g.status === 'completed');

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#011F5B] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#990000]/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 text-center max-w-md mx-auto space-y-8">
          <div className="inline-flex p-4 bg-white/10 rounded-full backdrop-blur-sm mb-4 ring-1 ring-white/20 shadow-2xl">
            <MapPin className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-2">
              Pottruck<span className="text-red-500">King</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              University of Pennsylvania
            </p>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            The official ELO tracker for Pottruck courts. 
            Join lobbies, track stats, and find out who runs the gym.
          </p>
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <Button 
              size="lg" 
              className="w-full !bg-white !text-[#011F5B] hover:!bg-blue-50 font-bold border-none"
              onClick={() => setIsLoggedIn(true)}
            >
              Enter Gym
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-[#011F5B] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setView('dashboard')}
            >
              <MapPin className="h-5 w-5 text-red-500" />
              <span className="font-black text-lg tracking-tight">
                Pottruck<span className="text-red-500">King</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mock User Switcher for Testing */}
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Current User</span>
                <select 
                  className="bg-blue-900/50 text-xs border-none rounded text-white py-1 px-2 focus:ring-0 cursor-pointer"
                  value={currentUserId}
                  onChange={(e) => setCurrentUserId(e.target.value)}
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {currentUser && (
                <div 
                  className="flex items-center gap-2 px-3 py-1 bg-blue-800/50 rounded-full border border-blue-700 cursor-pointer hover:bg-blue-800 transition-colors"
                  onClick={() => handlePlayerClick(currentUser)}
                  title="View Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{currentUser.name}</span>
                </div>
              )}
              <button 
                onClick={() => setIsLoggedIn(false)} 
                className="p-2 text-blue-300 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Mobile User Switcher */}
          <div className="md:hidden mt-3 pt-3 border-t border-blue-800 flex justify-between items-center">
             <span className="text-xs text-blue-300">Playing as:</span>
             <select 
                className="bg-blue-900/50 text-xs border-none rounded text-white py-1 px-2 focus:ring-0 cursor-pointer"
                value={currentUserId}
                onChange={(e) => setCurrentUserId(e.target.value)}
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {view === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Dashboard Tabs */}
            <div className="flex p-1 bg-slate-200 rounded-xl mb-6">
              <button
                onClick={() => setDashboardTab('live')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  dashboardTab === 'live' 
                    ? 'bg-white text-[#011F5B] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${dashboardTab === 'live' ? 'animate-spin-slow' : ''}`} />
                Live Courts
                {liveGames.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                    {liveGames.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setDashboardTab('history')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  dashboardTab === 'history' 
                    ? 'bg-white text-[#011F5B] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <History className="h-4 w-4" />
                Past Games
              </button>
            </div>

            {dashboardTab === 'live' && (
              <div className="space-y-6">
                 {/* Action Bar */}
                <div className="bg-[#011F5B] rounded-xl p-6 text-white shadow-lg bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Who's got next?</h2>
                      <p className="text-blue-200 text-sm">Start a lobby and wait for players to join.</p>
                    </div>
                    <Button 
                      onClick={handleCreateLobby} 
                      className="bg-red-600 hover:bg-red-700 text-white border-none shadow-xl w-full md:w-auto"
                      icon={<Plus className="h-5 w-5" />}
                    >
                      Start New Game
                    </Button>
                  </div>
                </div>

                {/* Live Games */}
                <div className="space-y-4">
                  {liveGames.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                      <div className="inline-flex p-3 bg-slate-50 rounded-full mb-3">
                        <RefreshCw className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">Courts are empty</h3>
                      <p className="text-slate-500">Be the first to start a game!</p>
                    </div>
                  )}

                  {liveGames.map(game => (
                    <GameLobby 
                      key={game.id}
                      game={game}
                      players={players}
                      currentUserId={currentUserId}
                      onJoinTeam={handleJoinTeam}
                      onLeaveGame={handleLeaveGame}
                      onFinish={handleFinishGame}
                      onDelete={handleDeleteLobby}
                    />
                  ))}
                </div>
              </div>
            )}

            {dashboardTab === 'history' && (
              <div className="space-y-6">
                {isGeneratingSummary && (
                   <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3 animate-pulse">
                     <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
                     <span className="text-sm text-blue-800 font-medium">AI is analyzing the latest match...</span>
                   </div>
                )}
                <RecentGames games={pastGames} players={players} />
              </div>
            )}
          </div>
        )}

        {view === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-slate-800">
                  &larr; Back
               </button>
               <h2 className="text-2xl font-bold text-slate-900">Pottruck Leaders</h2>
            </div>
            <Leaderboard players={players} onPlayerClick={handlePlayerClick} />
          </div>
        )}

        {view === 'profile' && selectedPlayer && (
          <PlayerProfile 
            player={selectedPlayer}
            games={pastGames}
            onClose={() => setView('dashboard')} 
          />
        )}
      </main>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 md:hidden flex justify-around p-3 pb-6 z-40">
         <button 
           onClick={() => { setView('dashboard'); setDashboardTab('live'); }}
           className={`flex flex-col items-center gap-1 ${view === 'dashboard' && dashboardTab === 'live' ? 'text-red-600' : 'text-slate-400'}`}
         >
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-[10px] font-medium">Courts</span>
         </button>
         <div className="relative -top-6">
            <button 
              onClick={handleCreateLobby}
              className="h-14 w-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/40 ring-4 ring-slate-50"
            >
              <Plus className="h-7 w-7" />
            </button>
         </div>
         <button 
           onClick={() => setView('leaderboard')}
           className={`flex flex-col items-center gap-1 ${view === 'leaderboard' ? 'text-red-600' : 'text-slate-400'}`}
         >
            <Trophy className="h-6 w-6" />
            <span className="text-[10px] font-medium">Rank</span>
         </button>
      </div>
    </div>
  );
};

export default App;
