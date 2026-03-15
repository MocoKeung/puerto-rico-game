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
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Waiting Room</h2>
          <p className="text-amber-600 mb-6">
            Room Code:{' '}
            <span className="font-mono font-bold text-2xl text-amber-800 tracking-widest">
              {game.room_code}
            </span>
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-amber-700 uppercase mb-2">
              Players ({players.length}/{game.max_players})
            </h3>
            <ul className="space-y-1">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 text-amber-800"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  <span>
                    {p.user_id === user?.id
                      ? `${profile?.username ?? 'You'} (You)`
                      : `Player ${p.seat_order + 1}`}
                  </span>
                  {p.is_governor && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 rounded">
                      Governor
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <p className="mb-4 text-red-600 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            {isHost && (
              <button
                onClick={startGame}
                disabled={loading || players.length < 2}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Starting…' : 'Start Game'}
              </button>
            )}
            <button
              onClick={handleLeave}
              className="px-4 py-2.5 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50"
            >
              Leave
            </button>
          </div>

          {!isHost && (
            <p className="mt-3 text-center text-sm text-amber-500">
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
