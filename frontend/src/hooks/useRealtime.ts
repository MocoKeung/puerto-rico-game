import { useEffect, useRef } from 'react';
import { subscribeToGame, subscribeToLobby } from '../lib/gameSync';
import type { GameSyncCallbacks } from '../lib/gameSync';
import type { Game } from '../types';

/**
 * Subscribe to all Realtime events for a specific game.
 * Automatically cleans up on unmount or when gameId changes.
 */
export function useGameRealtime(gameId: string | null, callbacks: GameSyncCallbacks) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!gameId) return;

    const cleanup = subscribeToGame(gameId, {
      onGameStateUpdate: (state) => callbacksRef.current.onGameStateUpdate?.(state),
      onPlayerUpdate: (player) => callbacksRef.current.onPlayerUpdate?.(player),
      onGameUpdate: (game) => callbacksRef.current.onGameUpdate?.(game),
      onError: (err) => callbacksRef.current.onError?.(err),
    });

    return cleanup;
  }, [gameId]);
}

/**
 * Subscribe to lobby-level game updates (new rooms, status changes).
 */
export function useLobbyRealtime(onUpdate: (game: Game) => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const cleanup = subscribeToLobby((game) => onUpdateRef.current(game));
    return cleanup;
  }, []);
}
