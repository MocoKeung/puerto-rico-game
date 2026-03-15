import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { GameState, GamePlayer, Game } from '../types';

export type GameSyncCallbacks = {
  onGameStateUpdate?: (state: GameState) => void;
  onPlayerUpdate?: (player: GamePlayer) => void;
  onGameUpdate?: (game: Game) => void;
  onError?: (err: Error) => void;
};

/**
 * Subscribe to all Realtime changes for a specific game.
 * Returns a cleanup function to unsubscribe.
 */
export function subscribeToGame(
  gameId: string,
  callbacks: GameSyncCallbacks,
): () => void {
  const channels: RealtimeChannel[] = [];

  // 1. Subscribe to game_states updates (primary state broadcast)
  const stateChannel = supabase
    .channel(`game_states:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_states',
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        callbacks.onGameStateUpdate?.(payload.new as GameState);
      },
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        callbacks.onError?.(new Error('game_states channel error'));
      }
    });

  // 2. Subscribe to game_players updates (individual player changes)
  const playersChannel = supabase
    .channel(`game_players:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_players',
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        callbacks.onPlayerUpdate?.(payload.new as GamePlayer);
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'game_players',
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        callbacks.onPlayerUpdate?.(payload.new as GamePlayer);
      },
    )
    .subscribe();

  // 3. Subscribe to game status changes (for start/end notifications)
  const gameChannel = supabase
    .channel(`games:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        callbacks.onGameUpdate?.(payload.new as Game);
      },
    )
    .subscribe();

  channels.push(stateChannel, playersChannel, gameChannel);

  // Return cleanup function
  return () => {
    channels.forEach((ch) => supabase.removeChannel(ch));
  };
}

/**
 * Subscribe to lobby: new games being created / status updates.
 * Useful for the lobby page to auto-refresh room list.
 */
export function subscribeToLobby(onUpdate: (game: Game) => void): () => void {
  const channel = supabase
    .channel('lobby_games')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'games',
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as Game);
        }
      },
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
