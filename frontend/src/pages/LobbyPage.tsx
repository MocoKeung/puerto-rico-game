import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../hooks/useGame';
import { useLobbyRealtime } from '../hooks/useRealtime';
import { supabase } from '../lib/supabase';
import type { Game } from '../types';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { createRoom, joinRoom, loading, error } = useGame(user?.id ?? null);

  const [openGames, setOpenGames] = useState<(Game & { player_count: number })[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [joinError, setJoinError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchOpenGames = useCallback(async () => {
    const { data } = await supabase
      .from('games')
      .select('*, game_players(count)')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setOpenGames(
        data.map((g: Game & { game_players: { count: number }[] }) => ({
          ...g,
          player_count: g.game_players?.[0]?.count ?? 0,
        })),
      );
    }
  }, []);

  useEffect(() => {
    fetchOpenGames();
  }, [fetchOpenGames]);

  // Auto-refresh lobby via Realtime
  useLobbyRealtime(() => {
    fetchOpenGames();
  });

  async function handleCreate() {
    try {
      const game = await createRoom(maxPlayers);
      navigate(`/game/${game.id}`);
    } catch {
      // error is already in state via useGame
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError('');
    try {
      const game = await joinRoom(roomCode.toUpperCase());
      navigate(`/game/${game.id}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join room');
    }
  }

  async function handleQuickJoin(gameId: string, roomCode: string) {
    try {
      await joinRoom(roomCode);
      navigate(`/game/${gameId}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join room');
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Nav */}
      <header className="bg-amber-800 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-2xl font-bold">Puerto Rico</h1>
        <div className="flex items-center gap-4">
          <span className="text-amber-200 text-sm">
            {profile?.username ?? user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-amber-300 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create Room */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow p-6">
            <h2 className="text-lg font-bold text-amber-900 mb-4">Create a Room</h2>
            {showCreate ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">
                    Max Players
                  </label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-gray-800"
                  >
                    {[2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} Players
                      </option>
                    ))}
                  </select>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-semibold rounded-lg transition-colors"
                  >
                    {loading ? 'Creating…' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
              >
                New Game
              </button>
            )}
          </div>

          {/* Join by Code */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow p-6">
            <h2 className="text-lg font-bold text-amber-900 mb-4">Join by Room Code</h2>
            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB3X7K"
                maxLength={6}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg font-mono uppercase tracking-widest text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {joinError && <p className="text-red-600 text-sm">{joinError}</p>}
              <button
                type="submit"
                disabled={roomCode.length !== 6 || loading}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Joining…' : 'Join Room'}
              </button>
            </form>
          </div>
        </div>

        {/* Open Games */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-amber-900">Open Rooms</h2>
            <button
              onClick={fetchOpenGames}
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              Refresh
            </button>
          </div>

          {openGames.length === 0 ? (
            <p className="text-amber-600 text-center py-8">
              No open rooms. Create one to get started!
            </p>
          ) : (
            <div className="space-y-2">
              {openGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100"
                >
                  <div>
                    <span className="font-mono font-bold text-amber-800 text-lg">
                      {game.room_code}
                    </span>
                    <span className="ml-3 text-sm text-amber-600">
                      {game.player_count}/{game.max_players} players
                    </span>
                  </div>
                  <button
                    onClick={() => handleQuickJoin(game.id, game.room_code)}
                    disabled={loading || game.player_count >= game.max_players}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
