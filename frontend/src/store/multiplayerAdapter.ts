/**
 * Multiplayer Adapter — maps Supabase DB types to the GameEngine types
 * used by all 17+ UI components.
 */
import { ALL_BUILDINGS, type BuildingDef } from '../data/buildings';
import {
  type ResourceType, type PlantationType, type RoleType, type GamePhase,
  INITIAL_GOODS_SUPPLY, TRADING_HOUSE_SIZE, TOTAL_QUARRIES,
} from '../data/constants';
import type {
  GameState, GamePlayer, Game,
} from '../types';
import type {
  PlayerState, PlantationTile, OwnedBuilding, ShipState, RoleState,
  GameEngineState,
} from './gameEngine';

// ---- Lookup table for BuildingDef by id ----
const BUILDING_MAP: Record<string, BuildingDef> = {};
ALL_BUILDINGS.forEach((b) => { BUILDING_MAP[b.id] = b; });

// Player colors for multiplayer (no AI names needed)
const SEAT_COLORS = ['#22c55e', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

// ---- Mapping functions ----

function mapPlantation(slot: { type: string; colonized: boolean }): PlantationTile {
  return {
    type: slot.type as PlantationType,
    colonist: slot.colonized,
  };
}

function mapBuilding(slot: { type: string; colonists: number; vp: number }): OwnedBuilding {
  const def = BUILDING_MAP[slot.type];
  if (!def) {
    // Fallback for unknown building types
    return {
      def: {
        id: slot.type, name: slot.type, cost: 0, vp: slot.vp,
        maxColonists: 1, size: 'small', category: 'violet',
        description: '', totalAvailable: 1,
      },
      colonists: slot.colonists,
    };
  }
  return { def, colonists: slot.colonists };
}

function mapShip(ship: { capacity: number; cargo_type: string | null; cargo_count: number }): ShipState {
  return {
    capacity: ship.capacity,
    cargoType: ship.cargo_type as ResourceType | null,
    filled: ship.cargo_count,
  };
}

function mapGoods(goods: Record<string, number>): Record<ResourceType, number> {
  return {
    corn: goods.corn ?? 0,
    indigo: goods.indigo ?? 0,
    sugar: goods.sugar ?? 0,
    tobacco: goods.tobacco ?? 0,
    coffee: goods.coffee ?? 0,
  };
}

/**
 * Derive the frontend GamePhase from backend state.
 *
 * Backend uses: 'role_selection' | 'action' | 'end_round' | 'game_over'
 * Frontend uses: 'role_selection' | 'settler' | 'builder' | 'mayor' | 'craftsman' | 'captain' | 'trader' | 'prospector' | 'captain_cleanup' | 'game_over'
 *
 * When phase === 'action', we derive the specific role from roles_selected.
 */
function derivePhase(gs: GameState, _playerCount: number): GamePhase {
  if (gs.phase === 'role_selection') return 'role_selection';
  if (gs.phase === 'game_over') return 'game_over';
  if (gs.phase === 'end_round') return 'role_selection'; // treat as role_selection

  // phase === 'action': find the current role being resolved
  // roles_selected is keyed by pick-index (0,1,2,...), not by seat
  const numSelected = Object.keys(gs.roles_selected).length;
  if (numSelected === 0) return 'role_selection';

  // The last pick is at index numSelected - 1
  const currentRole = gs.roles_selected[String(numSelected - 1)];
  if (currentRole) return currentRole as GamePhase;

  return 'role_selection';
}

/**
 * Derive the role picker seat (who selected the current role).
 */
function deriveRolePickerSeat(gs: GameState, playerCount: number): number {
  const numSelected = Object.keys(gs.roles_selected).length;
  if (numSelected === 0) return gs.governor_seat;
  return (gs.governor_seat + numSelected - 1) % playerCount;
}

/**
 * Map roles_available + roles_selected to RoleState[].
 */
function mapRoles(gs: GameState, playerCount: number): RoleState[] {
  const allRoleTypes: RoleType[] = ['settler', 'builder', 'mayor', 'craftsman', 'captain', 'trader', 'prospector'];

  // Build set of selected roles this round
  const selectedRoles = new Set(Object.values(gs.roles_selected));
  // Build map of role -> bonus doubloons from available
  const availableMap = new Map<string, number>();
  gs.roles_available.forEach((r) => {
    availableMap.set(r.role, r.doubloons_bonus);
  });

  // roles_selected is keyed by pick-index; derive seat from index
  const roleToSeat = new Map<string, number>();
  Object.entries(gs.roles_selected).forEach(([pickIdx, role]) => {
    const seat = (gs.governor_seat + Number(pickIdx)) % playerCount;
    roleToSeat.set(role as string, seat);
  });

  return allRoleTypes.map((type) => {
    const isSelected = selectedRoles.has(type);
    const isAvailable = availableMap.has(type);

    return {
      type,
      available: isAvailable && !isSelected,
      bonusDoubloons: availableMap.get(type) ?? 0,
      selectedBySeat: isSelected ? (roleToSeat.get(type) ?? null) : null,
    };
  });
}

/**
 * Convert Supabase multiplayer state to the GameEngineState shape
 * that all UI components expect.
 *
 * @param localPlayerSeat - seat of the human player viewing the game
 *   Players array is reordered so localPlayer is at index 0.
 */
export function mapToEngineState(
  game: Game,
  gs: GameState,
  dbPlayers: GamePlayer[],
  localPlayerSeat: number,
): GameEngineState {
  const playerCount = dbPlayers.length;

  // Reorder players so local player is at index 0
  const sortedPlayers = [...dbPlayers].sort((a, b) => {
    if (a.seat_order === localPlayerSeat) return -1;
    if (b.seat_order === localPlayerSeat) return 1;
    return a.seat_order - b.seat_order;
  });

  const players: PlayerState[] = sortedPlayers.map((p, idx) => ({
    seat: p.seat_order,
    name: p.seat_order === localPlayerSeat
      ? 'You'
      : (p.profile?.username ?? `Player ${p.seat_order + 1}`),
    color: SEAT_COLORS[idx % SEAT_COLORS.length],
    isHuman: p.seat_order === localPlayerSeat,
    doubloons: p.doubloons,
    victoryPoints: p.victory_points,
    colonists: p.colonists,
    plantations: (p.plantations ?? []).map(mapPlantation),
    buildings: (p.buildings ?? []).map(mapBuilding),
    goods: mapGoods(p.goods ?? {}),
  }));

  const phase = derivePhase(gs, playerCount);
  const rolePickerSeat = deriveRolePickerSeat(gs, playerCount);

  // Build trading house as fixed-length array with nulls
  const tradingHouse: (ResourceType | null)[] = Array(TRADING_HOUSE_SIZE).fill(null);
  gs.trading_house.forEach((r, i) => { tradingHouse[i] = r as ResourceType; });

  // Building supply from market
  const buildingSupply: Record<string, number> = {};
  ALL_BUILDINGS.forEach((b) => {
    buildingSupply[b.id] = (gs.buildings_market as Record<string, number>)[b.id] ?? 0;
  });

  // Determine if it's the human's turn
  const isHumanTurn = gs.current_player_seat === localPlayerSeat;
  const waitingForHuman = isHumanTurn && game.status === 'in_progress';

  return {
    started: game.status === 'in_progress',
    difficulty: 'medium',
    playerCount,
    phase,
    round: gs.round,
    governorSeat: gs.governor_seat,
    rolePickerSeat,
    activePlayerSeat: gs.current_player_seat,
    rolesSelectedThisRound: Object.keys(gs.roles_selected).length,
    players,
    roles: mapRoles(gs, playerCount),
    ships: (gs.ships ?? []).map(mapShip),
    tradingHouse,
    plantationDeck: gs.plantation_supply as PlantationType[],
    visiblePlantations: gs.plantation_visible as PlantationType[],
    quarriesRemaining: gs.supply?.quarries ?? TOTAL_QUARRIES,
    buildingSupply,
    colonistSupply: gs.supply?.colonists ?? 0,
    colonistShip: playerCount, // approximation; backend doesn't track separately
    vpSupply: gs.supply?.vp_tokens ?? 0,
    goodsSupply: mapGoods(gs.supply?.goods ?? INITIAL_GOODS_SUPPLY),
    captainMustShip: false, // will be derived from phase context
    playersShippedThisTurn: new Set(),
    gameLog: [],
    lastAction: null,
    waitingForHuman,
    gameOverScores: null,
  };
}
