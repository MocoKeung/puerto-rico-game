/**
 * GameContext — unified React context that provides the same
 * GameEngineState & GameEngineActions interface used by all game UI components.
 *
 * Two modes:
 *   - 'local': delegates to the existing Zustand store (single-player)
 *   - 'multiplayer': maps Supabase state and routes actions to Edge Functions
 */
import React, { createContext, useContext, useMemo, useCallback, useRef, useEffect } from 'react';
import useGameEngine from '../store/gameEngine';
import { mapToEngineState } from '../store/multiplayerAdapter';
import { ALL_BUILDINGS } from '../data/buildings';
import type { ResourceType, PlantationType, RoleType, Difficulty } from '../data/constants';
import type { Game, GameState, GamePlayer } from '../types';
import type {
  GameEngineState, GameEngineActions, PlayerState,
} from '../store/gameEngine';

type FullGameEngine = GameEngineState & GameEngineActions;

const GameContext = createContext<FullGameEngine | null>(null);

// ---- Local (single-player) provider ----

export function LocalGameProvider({ children }: { children: React.ReactNode }) {
  const store = useGameEngine();
  return <GameContext.Provider value={store}>{children}</GameContext.Provider>;
}

// ---- Multiplayer provider ----

interface MultiplayerProviderProps {
  game: Game;
  gameState: GameState;
  players: GamePlayer[];
  localPlayerSeat: number;
  performAction: (actionType: string, actionData?: Record<string, unknown>) => Promise<void>;
  children: React.ReactNode;
}

export function MultiplayerGameProvider({
  game, gameState, players, localPlayerSeat, performAction, children,
}: MultiplayerProviderProps) {
  // Map Supabase state to engine state
  const engineState = useMemo(
    () => mapToEngineState(game, gameState, players, localPlayerSeat),
    [game, gameState, players, localPlayerSeat],
  );

  // Keep a ref to latest state for use in action callbacks
  const stateRef = useRef(engineState);
  useEffect(() => { stateRef.current = engineState; }, [engineState]);

  // ---- Action implementations that call Edge Functions ----

  const selectRole = useCallback((_seat: number, roleType: RoleType) => {
    performAction('select_role', { role: roleType });
  }, [performAction]);

  const settlerTakePlantation = useCallback((_seat: number, type: PlantationType) => {
    performAction('settle', { plantation: type });
  }, [performAction]);

  const builderBuyBuilding = useCallback((_seat: number, buildingId: string) => {
    performAction('build', { building: buildingId });
  }, [performAction]);

  const builderPass = useCallback((_seat: number) => {
    performAction('pass', {});
  }, [performAction]);

  const mayorAssignColonists = useCallback((_seat: number, assignments: { plantations: boolean[]; buildings: number[] }) => {
    performAction('mayor', { assignments });
  }, [performAction]);

  const mayorConfirm = useCallback(() => {
    // No-op in multiplayer — mayor action already advances turn
  }, []);

  const captainShipGoods = useCallback((_seat: number, shipIndex: number, resource: ResourceType) => {
    performAction('captain', { ship_index: shipIndex, resource });
  }, [performAction]);

  const captainUseWharf = useCallback((_seat: number, resource: ResourceType, amount: number) => {
    performAction('captain', { use_wharf: true, resource, amount });
  }, [performAction]);

  const captainPass = useCallback((_seat: number) => {
    performAction('pass', {});
  }, [performAction]);

  const traderSellGood = useCallback((_seat: number, resource: ResourceType) => {
    performAction('trade', { resource });
  }, [performAction]);

  const traderPass = useCallback((_seat: number) => {
    performAction('pass', {});
  }, [performAction]);

  const craftsmanBonusGood = useCallback((_seat: number, resource: ResourceType) => {
    performAction('produce', { bonus_resource: resource });
  }, [performAction]);

  const craftsmanSkipBonus = useCallback((_seat: number) => {
    performAction('produce', {});
  }, [performAction]);

  // Flow actions (no-ops in multiplayer - server handles flow)
  const advanceToNextPlayer = useCallback(() => {}, []);
  const endRolePhase = useCallback(() => {}, []);
  const addLog = useCallback(() => {}, []);
  const initGame = useCallback((_difficulty: Difficulty) => {}, []);

  // Query helpers
  const getHumanPlayer = useCallback((): PlayerState => {
    return stateRef.current.players.find((p) => p.isHuman) ?? stateRef.current.players[0];
  }, []);

  const canAffordBuilding = useCallback((seat: number, buildingId: string): boolean => {
    const player = stateRef.current.players.find((p) => p.seat === seat);
    if (!player) return false;
    const building = ALL_BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return false;
    const supply = stateRef.current.buildingSupply[buildingId] ?? 0;
    if (supply <= 0) return false;
    // Simplified cost check (no quarry discount in this check)
    const isBuilder = stateRef.current.rolePickerSeat === seat;
    const discount = isBuilder ? 1 : 0;
    return player.doubloons >= Math.max(0, building.cost - discount);
  }, []);

  const getAvailableShipsForResource = useCallback((resource: ResourceType): number[] => {
    return stateRef.current.ships
      .map((s, i) => ({ ...s, index: i }))
      .filter((s) => {
        if (s.filled >= s.capacity) return false;
        if (s.cargoType === null) return true;
        return s.cargoType === resource;
      })
      .map((s) => s.index);
  }, []);

  const isHumanTurn = useCallback((): boolean => {
    return stateRef.current.waitingForHuman;
  }, []);

  const value: FullGameEngine = useMemo(() => ({
    ...engineState,
    // Actions
    initGame,
    selectRole,
    settlerTakePlantation,
    builderBuyBuilding,
    builderPass,
    mayorAssignColonists,
    mayorConfirm,
    captainShipGoods,
    captainUseWharf,
    captainPass,
    traderSellGood,
    traderPass,
    craftsmanBonusGood,
    craftsmanSkipBonus,
    advanceToNextPlayer,
    endRolePhase,
    addLog,
    getHumanPlayer,
    canAffordBuilding,
    getAvailableShipsForResource,
    isHumanTurn,
  }), [
    engineState, initGame, selectRole, settlerTakePlantation,
    builderBuyBuilding, builderPass, mayorAssignColonists, mayorConfirm,
    captainShipGoods, captainUseWharf, captainPass,
    traderSellGood, traderPass, craftsmanBonusGood, craftsmanSkipBonus,
    advanceToNextPlayer, endRolePhase, addLog,
    getHumanPlayer, canAffordBuilding, getAvailableShipsForResource, isHumanTurn,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ---- Consumer hook ----

/**
 * Drop-in replacement for `useGameEngine()`.
 * Supports an optional selector for compatibility, but always returns from context.
 */
export function useGameContext(): FullGameEngine;
export function useGameContext<T>(selector: (s: FullGameEngine) => T): T;
export function useGameContext<T>(selector?: (s: FullGameEngine) => T) {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameContext must be used inside a GameProvider');
  }
  if (selector) return selector(ctx);
  return ctx;
}
