import { useState, useCallback, useEffect } from 'react';
import { supabase, callEdgeFunction } from '../lib/supabase';
import { useGameRealtime } from './useRealtime';
import type { Game, GameState, GamePlayer, ActionType } from '../types';

interface GameSessionState {
  game: Game | null;
  gameState: GameState | null;
  players: GamePlayer[];
  myPlayer: GamePlayer | null;
  loading: boolean;
  error: string | null;
}

export function useGame(userId: string | null) {
  const [state, setState] = useState<GameSessionState>({
    game: null,
    gameState: null,
    players: [],
    myPlayer: null,
    loading: false,
    error: null,
  });

  // Subscribe to Realtime updates when in a game
  useGameRealtime(state.game?.id ?? null, {
    onGameStateUpdate: (newState) => {
      setState((s) => {
        // Safety net: if the game is still 'waiting' but a game_states row just
        // appeared, the host has started the game — the games UPDATE event may
        // arrive late or be missed entirely, so flip the status here too.
        const nextGame = s.game && s.game.status === 'waiting'
          ? { ...s.game, status: 'in_progress' as const }
          : s.game;
        return { ...s, gameState: newState, game: nextGame };
      });
    },
    onPlayerUpdate: (updatedPlayer) => {
      setState((s) => {
        const players = s.players.map((p) => {
          if (p.id !== updatedPlayer.id) return p;
          // Preserve profile from existing data (Realtime payloads don't include joins)
          return { ...updatedPlayer, profile: updatedPlayer.profile ?? p.profile };
        });
        const exists = players.some((p) => p.id === updatedPlayer.id);
        const newPlayers = exists ? players : [...players, updatedPlayer];
        const myPlayer = newPlayers.find((p) => p.user_id === userId) ?? null;
        return { ...s, players: newPlayers, myPlayer };
      });
    },
    onGameUpdate: (updatedGame) => {
      setState((s) => ({ ...s, game: updatedGame }));
    },
    onError: (err) => {
      // Log but don't surface — polling fallback below keeps the UI in sync
      console.warn('[useGame] realtime channel error:', err.message);
    },
  });

  // When game transitions to in_progress, re-fetch game state + players
  useEffect(() => {
    if (state.game?.status === 'in_progress' && !state.gameState && state.game.id) {
      reloadGameData(state.game.id);
    }
  }, [state.game?.status, state.game?.id, state.gameState]);

  // Polling fallback: while in the waiting room, poll the games row every 3s
  // so that if the realtime UPDATE event is missed (channel not joined yet,
  // network blip, etc.) Player 2 still transitions into the game when the
  // host clicks Start.
  useEffect(() => {
    if (state.game?.status !== 'waiting' || !state.game.id) return;
    const gameId = state.game.id;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .maybeSingle();
      if (data && data.status !== 'waiting') {
        setState((s) => ({ ...s, game: data }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [state.game?.status, state.game?.id]);

  // Helper to re-fetch game state + players (used when game transitions)
  const reloadGameData = useCallback(async (gameId: string) => {
    try {
      const [{ data: gameState }, { data: players }] = await Promise.all([
        supabase.from('game_states').select('*').eq('game_id', gameId).maybeSingle(),
        supabase.from('game_players').select('*, profile:profiles!user_id(username, avatar_url)').eq('game_id', gameId).order('seat_order'),
      ]);
      setState((s) => {
        const myPlayer = (players ?? []).find((p: GamePlayer) => p.user_id === userId) ?? s.myPlayer;
        return {
          ...s,
          gameState: gameState ?? s.gameState,
          players: players ?? s.players,
          myPlayer,
        };
      });
    } catch (err) {
      console.error('Failed to reload game data:', err);
    }
  }, [userId]);

  const loadGame = useCallback(async (gameId: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [{ data: game }, { data: gameState }, { data: players }] = await Promise.all([
        supabase.from('games').select('*').eq('id', gameId).single(),
        supabase.from('game_states').select('*').eq('game_id', gameId).maybeSingle(),
        supabase.from('game_players').select('*, profile:profiles!user_id(username, avatar_url)').eq('game_id', gameId).order('seat_order'),
      ]);

      const myPlayer = (players ?? []).find((p: GamePlayer) => p.user_id === userId) ?? null;

      setState({
        game: game ?? null,
        gameState: gameState ?? null,
        players: players ?? [],
        myPlayer,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load game',
      }));
    }
  }, [userId]);

  const createRoom = useCallback(async (maxPlayers: number) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await callEdgeFunction<{ game: Game; player: GamePlayer }>('create-room', {
        max_players: maxPlayers,
      });
      setState((s) => ({
        ...s,
        game: result.game,
        players: [result.player],
        myPlayer: result.player,
        loading: false,
      }));
      return result.game;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create room';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const joinRoom = useCallback(async (roomCode: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await callEdgeFunction<{ game: Game; player: GamePlayer }>('join-room', {
        room_code: roomCode,
      });
      await loadGame(result.game.id);
      return result.game;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join room';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, [loadGame]);

  const startGame = useCallback(async () => {
    if (!state.game) throw new Error('No active game');
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await callEdgeFunction('start-game', { game_id: state.game.id });
      // Re-fetch game state + players now that the game has started
      await reloadGameData(state.game.id);
      setState((s) => ({
        ...s,
        game: s.game ? { ...s.game, status: 'in_progress' } : s.game,
        loading: false,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start game';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, [state.game, reloadGameData]);

  const performAction = useCallback(
    async (actionType: ActionType, actionData: Record<string, unknown> = {}) => {
      if (!state.game) throw new Error('No active game');
      try {
        await callEdgeFunction('game-action', {
          game_id: state.game.id,
          action_type: actionType,
          action_data: actionData,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Action failed';
        setState((s) => ({ ...s, error: msg }));
        throw err;
      }
    },
    [state.game],
  );

  const leaveGame = useCallback(() => {
    setState({
      game: null,
      gameState: null,
      players: [],
      myPlayer: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    loadGame,
    createRoom,
    joinRoom,
    startGame,
    performAction,
    leaveGame,
  };
}
