import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../hooks/useGame';
import Board from '../components/Board';
import LoadingScreen from '../components/LoadingScreen';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const {
    game,
    gameState,
    players,
    myPlayer,
    loading,
    error,
    loadGame,
    startGame,
    performAction,
    leaveGame,
  } = useGame(user?.id ?? null);

  useEffect(() => {
    if (gameId) {
      loadGame(gameId);
    }
  }, [gameId, loadGame]);

  function handleLeave() {
    leaveGame();
    navigate('/lobby');
  }

  if (loading && !game) {
    return <LoadingScreen />;
  }

  if (error && !game) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/lobby')}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Waiting room (game not started yet)
  if (game?.status === 'waiting') {
    const isHost = game.host_id === user?.id;

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(160deg, #0c3547 0%, #0e4060 50%, #0a2d40 100%)' }}
      >
        <div
          className="rounded-2xl p-8 max-w-md w-full shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(201,135,12,0.30)',
          }}
        >
          {/* Title */}
          <h2 className="font-cinzel font-bold text-[#f0a830] text-xl uppercase tracking-[0.18em] mb-1">
            Waiting Room
          </h2>

          {/* Room code */}
          <p className="text-white/50 text-xs font-cinzel uppercase tracking-widest mb-1">Room Code</p>
          <p className="font-cinzel font-bold text-[#f0a830] text-3xl tracking-[0.3em] mb-6">
            {game.room_code}
          </p>

          {/* Players */}
          <div className="mb-6">
            <p className="font-cinzel text-[10px] text-[#c9870c]/60 uppercase tracking-[0.22em] mb-2">
              Players ({players.length}/{game.max_players})
            </p>
            <ul className="space-y-1.5">
              {players.map((p) => {
                const isMe = p.user_id === user?.id;
                const name = isMe
                  ? `${profile?.username ?? 'You'} (You)`
                  : `Player ${p.seat_order + 1}`;
                const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-cinzel font-bold text-[11px] text-white flex-shrink-0"
                      style={{ background: isMe ? '#c9870c' : 'rgba(255,255,255,0.15)' }}
                    >
                      {initials}
                    </div>
                    <span className="font-cinzel text-xs text-white/80 flex-1">{name}</span>
                    {p.is_governor && (
                      <span className="text-[10px] font-cinzel text-[#fde047] flex items-center gap-0.5">
                        👑 Governor
                      </span>
                    )}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  </li>
                );
              })}
            </ul>
          </div>

          {error && (
            <p className="mb-4 text-red-400 text-sm font-cinzel">{error}</p>
          )}

          <div className="flex gap-3">
            {isHost && (
              <button
                onClick={startGame}
                disabled={loading || players.length < 2}
                className="flex-1 py-2.5 font-cinzel font-bold text-sm uppercase tracking-wider rounded-xl transition-all duration-200 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #c9870c, #f0a830)', color: '#1a0e00' }}
              >
                {loading ? 'Starting…' : 'Start Game'}
              </button>
            )}
            <button
              onClick={handleLeave}
              className="px-5 py-2.5 font-cinzel text-sm text-white/60 hover:text-white/90 rounded-xl transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Leave
            </button>
          </div>

          {!isHost && (
            <p className="mt-3 text-center text-xs text-white/35 font-crimson italic">
              Waiting for the host to start the game…
            </p>
          )}
        </div>
      </div>
    );
  }

  // Active game — render existing Board component
  // The Board component will be progressively integrated with Supabase state
  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-amber-800 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Puerto Rico</h1>
          {gameState && (
            <span className="text-amber-200 text-sm">
              Round {gameState.round} • {gameState.phase.replace('_', ' ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-200 text-sm">{profile?.username}</span>
          <button
            onClick={handleLeave}
            className="text-sm text-amber-300 hover:text-white transition-colors"
          >
            Leave Game
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {/* Board component (existing — will be wired up in Phase 3) */}
      <div className="p-4">
        <Board />
      </div>

      {/* My Player Info Bar */}
      {myPlayer && (
        <div className="fixed bottom-0 left-0 right-0 bg-amber-800 text-white px-6 py-3 flex items-center gap-6 text-sm shadow-lg">
          <span>
            Doubloons: <strong>{myPlayer.doubloons}</strong>
          </span>
          <span>
            VP: <strong>{myPlayer.victory_points}</strong>
          </span>
          <span>
            Colonists: <strong>{myPlayer.colonists}</strong>
          </span>
          {game?.status === 'in_progress' &&
            gameState?.current_player_seat === myPlayer.seat_order && (
              <span className="ml-auto text-amber-300 font-semibold animate-pulse">
                Your Turn!
              </span>
            )}
        </div>
      )}
    </div>
  );
}
