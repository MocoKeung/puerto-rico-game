import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Hash, RefreshCw, LogOut, Users, Swords, ChevronRight, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../hooks/useGame';
import { useLobbyRealtime } from '../hooks/useRealtime';
import { supabase } from '../lib/supabase';
import type { Game } from '../types';
import LanguageToggle from '../components/ui/LanguageToggle';

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

  useEffect(() => { fetchOpenGames(); }, [fetchOpenGames]);
  useLobbyRealtime(() => { fetchOpenGames(); });

  async function handleCreate() {
    try {
      const game = await createRoom(maxPlayers);
      navigate(`/game/${game.id}`);
    } catch { /* error in state */ }
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

  async function handleQuickJoin(gameId: string, rc: string) {
    try {
      await joinRoom(rc);
      navigate(`/game/${gameId}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join room');
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const displayName = profile?.username ?? user?.email ?? '';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0e0bb' }}>

      {/* Top nav */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-3.5"
        style={{
          background: 'rgba(61,31,10,0.92)',
          borderBottom: '1px solid rgba(201,135,12,0.3)',
        }}
      >
        <h1 className="font-cinzel font-black text-[#f0a830] text-lg tracking-widest uppercase">
          Puerto Rico
        </h1>
        <div className="flex items-center gap-3">
          {/* User badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="w-6 h-6 rounded-full bg-[#c9870c]/80 flex items-center justify-center">
              <span className="font-cinzel font-bold text-white text-[10px]">{initials}</span>
            </div>
            <span className="font-cinzel text-white/70 text-xs hidden sm:block">{displayName}</span>
          </div>
          <LanguageToggle variant="dark" />
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-5">

        {/* Local play banner */}
        <div
          className="rounded-3xl p-5 flex items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(201,135,12,0.18), rgba(201,135,12,0.08))',
            border: '1px solid rgba(201,135,12,0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(201,135,12,0.25)', border: '1px solid rgba(201,135,12,0.4)' }}
            >
              <Swords size={18} className="text-[#f0a830]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-cinzel font-bold text-[#f0a830] text-sm">Solo vs AI</p>
              <p className="font-crimson text-[#f0a830]/65 text-xs">Play against AI opponents — no account required</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/local')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-cinzel font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #b8760a, #f0a830)',
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Play Now
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Create + Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Create Room */}
          <LobbyCard icon={<Plus size={16} className="text-[#c9870c]" strokeWidth={2.5} />} title="Create a Room">
            {showCreate ? (
              <div className="space-y-3">
                <div>
                  <label className="block font-cinzel text-[10px] text-[#5a2e10]/60 uppercase tracking-[0.18em] mb-2">
                    Max Players
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setMaxPlayers(n)}
                        className="py-2 rounded-xl font-cinzel font-bold text-sm transition-all"
                        style={{
                          background: maxPlayers === n ? 'rgba(201,135,12,0.2)' : 'rgba(61,31,10,0.05)',
                          border: maxPlayers === n ? '1px solid rgba(201,135,12,0.6)' : '1px solid rgba(61,31,10,0.15)',
                          color: maxPlayers === n ? '#c9870c' : 'rgba(61,31,10,0.45)',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs font-crimson">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl font-cinzel font-bold text-sm transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #b8760a, #f0a830)', color: 'white' }}
                  >
                    {loading ? 'Creating…' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2.5 rounded-xl font-cinzel text-sm text-[#5a2e10]/50 hover:text-[#5a2e10] transition-colors"
                    style={{ border: '1px solid rgba(61,31,10,0.15)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full py-3 rounded-xl font-cinzel font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,135,12,0.2), rgba(201,135,12,0.1))',
                  border: '1px solid rgba(201,135,12,0.35)',
                  color: '#f0a830',
                }}
              >
                New Game
              </button>
            )}
          </LobbyCard>

          {/* Join by code */}
          <LobbyCard icon={<Hash size={16} className="text-[#c9870c]" strokeWidth={2.5} />} title="Join by Room Code">
            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="AB3X7K"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl font-mono uppercase tracking-[0.3em] text-center text-lg font-bold transition-all focus:outline-none"
                style={{
                  background: 'rgba(61,31,10,0.06)',
                  border: roomCode.length === 6 ? '1px solid rgba(201,135,12,0.6)' : '1px solid rgba(61,31,10,0.15)',
                  color: '#3d1f0a',
                }}
              />
              {joinError && <p className="text-red-400 text-xs font-crimson">{joinError}</p>}
              <button
                type="submit"
                disabled={roomCode.length !== 6 || loading}
                className="w-full py-3 rounded-xl font-cinzel font-bold text-sm transition-all disabled:opacity-30 hover:scale-[1.01] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #1e3a5f, #2a5aab)', color: 'white' }}
              >
                {loading ? 'Joining…' : 'Join Room'}
              </button>
            </form>
          </LobbyCard>
        </div>

        {/* Open Rooms */}
        <LobbyCard
          icon={<Users size={16} className="text-[#f0a830]" strokeWidth={2} />}
          title="Open Rooms"
          action={
            <button onClick={fetchOpenGames} className="p-1.5 rounded-lg text-[#5a2e10]/40 hover:text-[#c9870c] transition-colors">
              <RefreshCw size={13} strokeWidth={2} />
            </button>
          }
        >
          {openGames.length === 0 ? (
            <div className="py-8 text-center">
              <Crown size={28} className="text-[#5a2e10]/20 mx-auto mb-2" strokeWidth={1.5} />
              <p className="font-crimson text-[#5a2e10]/40 italic text-sm">No open rooms. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openGames.map(game => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(61,31,10,0.04)', border: '1px solid rgba(61,31,10,0.1)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-[#c9870c] text-lg tracking-widest">{game.room_code}</span>
                    <span className="font-cinzel text-xs text-[#5a2e10]/60">{game.player_count}/{game.max_players} players</span>
                  </div>
                  <button
                    onClick={() => handleQuickJoin(game.id, game.room_code)}
                    disabled={loading || game.player_count >= game.max_players}
                    className="px-4 py-1.5 rounded-xl font-cinzel font-bold text-xs transition-all disabled:opacity-30 hover:scale-[1.02]"
                    style={{ background: 'rgba(201,135,12,0.25)', border: '1px solid rgba(201,135,12,0.4)', color: '#f0a830' }}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </LobbyCard>
      </main>
    </div>
  );
}

function LobbyCard({
  icon, title, children, action,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: 'rgba(245,230,200,0.97)',
        border: '1px solid rgba(201,135,12,0.3)',
        boxShadow: '0 4px 20px rgba(61,31,10,0.12)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-cinzel font-bold text-[#3d1f0a] text-sm tracking-wide">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
