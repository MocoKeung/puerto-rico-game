import { create } from 'zustand';
import { ALL_BUILDINGS, type BuildingDef } from '../data/buildings';
import {
  type ResourceType, type PlantationType, type RoleType, type GamePhase, type Difficulty,
  RESOURCE_ORDER, TRADE_PRICES, SHIP_CAPACITIES, COLONIST_SUPPLY, VP_SUPPLY,
  INITIAL_GOODS_SUPPLY, MAX_BUILDING_SLOTS, TRADING_HOUSE_SIZE, TOTAL_QUARRIES,
  PLANTATION_DECK_COUNTS, VISIBLE_PLANTATIONS, AI_NAMES, AI_COLORS, HUMAN_COLOR,
} from '../data/constants';

// ============================================================
// State Types
// ============================================================

export interface PlantationTile {
  type: PlantationType;
  colonist: boolean;
}

export interface OwnedBuilding {
  def: BuildingDef;
  colonists: number;
}

export interface PlayerState {
  seat: number;
  name: string;
  color: string;
  isHuman: boolean;
  doubloons: number;
  victoryPoints: number;  // from shipping
  colonists: number;      // unassigned colonists in San Juan
  plantations: PlantationTile[];
  buildings: OwnedBuilding[];
  goods: Record<ResourceType, number>;
}

export interface ShipState {
  capacity: number;
  cargoType: ResourceType | null;
  filled: number;
}

export interface RoleState {
  type: RoleType;
  available: boolean;
  bonusDoubloons: number;
  selectedBySeat: number | null;
}

export interface LogEntry {
  message: string;
  seat: number | null;  // null = system message
  timestamp: number;
}

export interface GameEngineState {
  // Meta
  started: boolean;
  difficulty: Difficulty;
  playerCount: number;

  // Phase tracking
  phase: GamePhase;
  round: number;
  governorSeat: number;
  rolePickerSeat: number;  // who selected current role
  activePlayerSeat: number; // whose turn within current phase
  rolesSelectedThisRound: number;

  // Players
  players: PlayerState[];

  // Shared game state
  roles: RoleState[];
  ships: ShipState[];
  tradingHouse: (ResourceType | null)[];
  plantationDeck: PlantationType[];
  visiblePlantations: PlantationType[];
  quarriesRemaining: number;
  buildingSupply: Record<string, number>; // buildingId -> remaining count
  colonistSupply: number;
  colonistShip: number;
  vpSupply: number;
  goodsSupply: Record<ResourceType, number>;

  // Captain phase sub-state
  captainMustShip: boolean;
  playersShippedThisTurn: Set<number>;

  // UI state
  gameLog: LogEntry[];
  lastAction: string | null;  // for animation triggers
  waitingForHuman: boolean;
  gameOverScores: { seat: number; total: number; breakdown: Record<string, number> }[] | null;
}

// ============================================================
// Helper Functions
// ============================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPlantationDeck(): PlantationType[] {
  const deck: PlantationType[] = [];
  for (const [type, count] of Object.entries(PLANTATION_DECK_COUNTS)) {
    if (type !== 'quarry') {
      for (let i = 0; i < count; i++) deck.push(type as PlantationType);
    }
  }
  return shuffle(deck);
}

function createInitialRoles(playerCount: number): RoleState[] {
  const roles: RoleType[] = ['settler', 'builder', 'mayor', 'craftsman', 'captain', 'trader'];
  if (playerCount >= 4) roles.push('prospector');
  if (playerCount >= 5) roles.push('prospector'); // 2nd prospector
  return roles.map(type => ({
    type,
    available: true,
    bonusDoubloons: 0,
    selectedBySeat: null,
  }));
}

function getOccupiedBuildingAbility(player: PlayerState, buildingId: string): boolean {
  return player.buildings.some(b => b.def.id === buildingId && b.colonists > 0);
}

function countColonistsOnIsland(player: PlayerState): number {
  const onPlantations = player.plantations.filter(p => p.colonist).length;
  const onBuildings = player.buildings.reduce((sum, b) => sum + b.colonists, 0);
  return onPlantations + onBuildings;
}

function totalColonists(player: PlayerState): number {
  return player.colonists + countColonistsOnIsland(player);
}

function canProduce(player: PlayerState, resource: ResourceType): number {
  if (resource === 'corn') {
    // Corn only needs colonized plantation, no building
    return player.plantations.filter(p => p.type === 'corn' && p.colonist).length;
  }
  // Other resources need colonized plantation + occupied production building
  const colonizedPlantations = player.plantations.filter(p => p.type === resource && p.colonist).length;
  const buildingSlots = player.buildings
    .filter(b => b.def.productionType === resource)
    .reduce((sum, b) => sum + b.colonists, 0);
  return Math.min(colonizedPlantations, buildingSlots);
}

function getQuarryDiscount(player: PlayerState): number {
  return player.plantations.filter(p => p.type === 'quarry' && p.colonist).length;
}

function getBuildingCost(player: PlayerState, building: BuildingDef, isBuilder: boolean): number {
  let cost = building.cost;
  if (isBuilder) cost -= 1;
  cost -= getQuarryDiscount(player);
  return Math.max(0, cost);
}

function factoryBonus(typesProduced: number): number {
  if (typesProduced <= 1) return 0;
  if (typesProduced === 2) return 1;
  if (typesProduced === 3) return 2;
  if (typesProduced === 4) return 3;
  return 5; // 5+ types
}

// ============================================================
// Actions Interface
// ============================================================

export interface GameEngineActions {
  // Setup
  initGame: (difficulty: Difficulty) => void;

  // Role selection
  selectRole: (seat: number, roleType: RoleType) => void;

  // Phase actions
  settlerTakePlantation: (seat: number, type: PlantationType) => void;
  builderBuyBuilding: (seat: number, buildingId: string) => void;
  builderPass: (seat: number) => void;
  mayorAssignColonists: (seat: number, assignments: { plantations: boolean[]; buildings: number[] }) => void;
  mayorConfirm: () => void;
  captainShipGoods: (seat: number, shipIndex: number, resource: ResourceType) => void;
  captainUseWharf: (seat: number, resource: ResourceType, amount: number) => void;
  captainPass: (seat: number) => void;
  traderSellGood: (seat: number, resource: ResourceType) => void;
  traderPass: (seat: number) => void;
  craftsmanBonusGood: (seat: number, resource: ResourceType) => void;
  craftsmanSkipBonus: (seat: number) => void;

  // Flow
  advanceToNextPlayer: () => void;
  endRolePhase: () => void;
  addLog: (message: string, seat?: number | null) => void;

  // Queries
  getHumanPlayer: () => PlayerState;
  canAffordBuilding: (seat: number, buildingId: string) => boolean;
  getAvailableShipsForResource: (resource: ResourceType) => number[];
  isHumanTurn: () => boolean;
}

// ============================================================
// Store
// ============================================================

const useGameEngine = create<GameEngineState & GameEngineActions>((set, get) => ({
  // Initial empty state
  started: false,
  difficulty: 'medium',
  playerCount: 5,
  phase: 'role_selection',
  round: 1,
  governorSeat: 0,
  rolePickerSeat: 0,
  activePlayerSeat: 0,
  rolesSelectedThisRound: 0,
  players: [],
  roles: [],
  ships: [],
  tradingHouse: Array(TRADING_HOUSE_SIZE).fill(null),
  plantationDeck: [],
  visiblePlantations: [],
  quarriesRemaining: TOTAL_QUARRIES,
  buildingSupply: {},
  colonistSupply: 0,
  colonistShip: 0,
  vpSupply: 0,
  goodsSupply: { ...INITIAL_GOODS_SUPPLY },
  captainMustShip: false,
  playersShippedThisTurn: new Set(),
  gameLog: [],
  lastAction: null,
  waitingForHuman: false,
  gameOverScores: null,

  // ============================================================
  // INIT GAME
  // ============================================================
  initGame: (difficulty) => {
    const playerCount = 5; // 1 human + 4 AI
    const deck = buildPlantationDeck();

    // Create players
    const players: PlayerState[] = [];
    // Seat 0 = human
    players.push({
      seat: 0, name: 'You', color: HUMAN_COLOR, isHuman: true,
      doubloons: 3, victoryPoints: 0, colonists: 0,
      plantations: [{ type: 'indigo', colonist: true }],
      buildings: [],
      goods: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
    });
    // Seats 1-4 = AI
    for (let i = 0; i < 4; i++) {
      const startPlantation: PlantationType = i < 2 ? 'indigo' : 'corn';
      players.push({
        seat: i + 1, name: AI_NAMES[i], color: AI_COLORS[i], isHuman: false,
        doubloons: 3, victoryPoints: 0, colonists: 0,
        plantations: [{ type: startPlantation, colonist: true }],
        buildings: [],
        goods: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
      });
    }

    // Draw visible plantations
    const visible = deck.splice(0, VISIBLE_PLANTATIONS(playerCount));

    // Building supply
    const buildingSupply: Record<string, number> = {};
    ALL_BUILDINGS.forEach(b => { buildingSupply[b.id] = b.totalAvailable; });

    // Ships
    const shipCaps = SHIP_CAPACITIES[playerCount] || [5, 6, 7];
    const ships: ShipState[] = shipCaps.map(cap => ({
      capacity: cap, cargoType: null, filled: 0,
    }));

    // Colonist ship starts with playerCount colonists
    const colonistShip = playerCount;
    const colonistSupply = COLONIST_SUPPLY[playerCount] - colonistShip;

    set({
      started: true,
      difficulty,
      playerCount,
      phase: 'role_selection',
      round: 1,
      governorSeat: 0,
      rolePickerSeat: 0,
      activePlayerSeat: 0,
      rolesSelectedThisRound: 0,
      players,
      roles: createInitialRoles(playerCount),
      ships,
      tradingHouse: Array(TRADING_HOUSE_SIZE).fill(null),
      plantationDeck: deck,
      visiblePlantations: visible,
      quarriesRemaining: TOTAL_QUARRIES,
      buildingSupply,
      colonistSupply,
      colonistShip,
      vpSupply: VP_SUPPLY[playerCount],
      goodsSupply: { ...INITIAL_GOODS_SUPPLY },
      captainMustShip: false,
      playersShippedThisTurn: new Set(),
      gameLog: [{ message: 'Game started! Select a role.', seat: null, timestamp: Date.now() }],
      lastAction: 'init',
      waitingForHuman: true,
      gameOverScores: null,
    });
  },

  // ============================================================
  // SELECT ROLE
  // ============================================================
  selectRole: (seat, roleType) => {
    const state = get();
    const roleIndex = state.roles.findIndex(r => r.type === roleType && r.available);
    if (roleIndex === -1) return;

    const role = state.roles[roleIndex];
    const newRoles = [...state.roles];
    newRoles[roleIndex] = { ...role, available: false, selectedBySeat: seat };

    // Award bonus doubloons to the player who selected
    const newPlayers = [...state.players];
    if (role.bonusDoubloons > 0) {
      newPlayers[seat] = { ...newPlayers[seat], doubloons: newPlayers[seat].doubloons + role.bonusDoubloons };
    }

    const player = newPlayers[seat];
    const newPhase: GamePhase = roleType === 'prospector' ? 'role_selection' : roleType;

    // Prospector: immediate doubloon gain, no phase
    if (roleType === 'prospector') {
      newPlayers[seat] = { ...player, doubloons: player.doubloons + 1 };
      const newRolesSelected = state.rolesSelectedThisRound + 1;
      set({
        roles: newRoles,
        players: newPlayers,
        rolesSelectedThisRound: newRolesSelected,
        lastAction: 'select_role',
      });
      get().addLog(`${player.name} selected Prospector (+1 doubloon)`, seat);

      // Check if round is over
      if (newRolesSelected >= state.playerCount) {
        get().advanceRound();
      } else {
        const nextPicker = get().getNextRolePicker(seat, newRolesSelected);
        set({
          rolePickerSeat: nextPicker.seat,
          activePlayerSeat: nextPicker.seat,
          waitingForHuman: nextPicker.isHuman,
        });
      }
      return;
    }

    // For other roles: start the role phase with the selector going first
    set({
      roles: newRoles,
      players: newPlayers,
      phase: newPhase,
      rolePickerSeat: seat,
      activePlayerSeat: seat,
      rolesSelectedThisRound: state.rolesSelectedThisRound + 1,
      waitingForHuman: seat === 0,
      lastAction: 'select_role',
    });
    get().addLog(`${player.name} selected ${roleType.charAt(0).toUpperCase() + roleType.slice(1)}`, seat);

    // Special: Craftsman is auto-executed for all players
    if (roleType === 'craftsman') {
      get().executeCraftsman(seat);
    }
    // Special: Mayor distributes colonists automatically
    if (roleType === 'mayor') {
      get().executeMayor(seat);
    }
  },

  // ============================================================
  // SETTLER
  // ============================================================
  settlerTakePlantation: (seat, type) => {
    const state = get();
    const player = state.players[seat];

    if (type === 'quarry') {
      if (state.quarriesRemaining <= 0) return;
      // Only role selector can take quarry (or construction hut)
      if (seat !== state.rolePickerSeat && !getOccupiedBuildingAbility(player, 'construction_hut')) return;
    } else {
      const idx = state.visiblePlantations.indexOf(type);
      if (idx === -1) return;
    }

    const newPlayers = [...state.players];
    const newPlantation: PlantationTile = {
      type,
      colonist: getOccupiedBuildingAbility(player, 'hospice') && state.colonistSupply > 0,
    };
    newPlayers[seat] = {
      ...player,
      plantations: [...player.plantations, newPlantation],
    };

    const newVisible = [...state.visiblePlantations];
    let newQuarries = state.quarriesRemaining;
    let newColonistSupply = state.colonistSupply;

    if (type === 'quarry') {
      newQuarries -= 1;
    } else {
      const idx = newVisible.indexOf(type);
      if (idx >= 0) newVisible.splice(idx, 1);
    }

    if (newPlantation.colonist) {
      newColonistSupply -= 1;
    }

    set({
      players: newPlayers,
      visiblePlantations: newVisible,
      quarriesRemaining: newQuarries,
      colonistSupply: newColonistSupply,
      lastAction: 'settler',
    });
    get().addLog(`${player.name} took ${type}`, seat);
    get().advanceToNextPlayer();
  },

  // ============================================================
  // BUILDER
  // ============================================================
  builderBuyBuilding: (seat, buildingId) => {
    const state = get();
    const player = state.players[seat];
    const building = ALL_BUILDINGS.find(b => b.id === buildingId);
    if (!building) return;
    if ((state.buildingSupply[buildingId] ?? 0) <= 0) return;

    // Check player doesn't already own this building (except production buildings can stack)
    if (building.category === 'violet' && player.buildings.some(b => b.def.id === buildingId)) return;

    // Check city space
    const usedSlots = player.buildings.reduce((sum, b) => sum + (b.def.size === 'large' ? 2 : 1), 0);
    const neededSlots = building.size === 'large' ? 2 : 1;
    if (usedSlots + neededSlots > MAX_BUILDING_SLOTS) return;

    const isBuilder = seat === state.rolePickerSeat;
    const cost = getBuildingCost(player, building, isBuilder);
    if (player.doubloons < cost) return;

    const newPlayers = [...state.players];
    const newBuilding: OwnedBuilding = {
      def: building,
      colonists: getOccupiedBuildingAbility(player, 'university') && state.colonistSupply > 0 ? 1 : 0,
    };
    newPlayers[seat] = {
      ...player,
      doubloons: player.doubloons - cost,
      buildings: [...player.buildings, newBuilding],
    };

    const newSupply = { ...state.buildingSupply };
    newSupply[buildingId] = (newSupply[buildingId] ?? 0) - 1;

    let newColonistSupply = state.colonistSupply;
    if (newBuilding.colonists > 0) newColonistSupply -= 1;

    set({
      players: newPlayers,
      buildingSupply: newSupply,
      colonistSupply: newColonistSupply,
      lastAction: 'builder',
    });
    get().addLog(`${player.name} built ${building.name} for ${cost} doubloons`, seat);
    get().advanceToNextPlayer();
  },

  builderPass: (seat) => {
    const player = get().players[seat];
    get().addLog(`${player.name} passed (builder)`, seat);
    get().advanceToNextPlayer();
  },

  // ============================================================
  // MAYOR (auto-distribute then let human adjust)
  // ============================================================
  executeMayor: (rolePickerSeat: number) => {
    const state = get();
    const newPlayers = [...state.players];

    // 1. Distribute colonists from ship (1 each, starting with role picker)
    let remaining = state.colonistShip;
    const seatOrder: number[] = [];
    for (let i = 0; i < state.playerCount; i++) {
      seatOrder.push((rolePickerSeat + i) % state.playerCount);
    }

    // Role selector gets 1 extra from supply (privilege)
    let newColonistSupply = state.colonistSupply;
    if (newColonistSupply > 0) {
      newPlayers[rolePickerSeat] = {
        ...newPlayers[rolePickerSeat],
        colonists: newPlayers[rolePickerSeat].colonists + 1,
      };
      newColonistSupply -= 1;
    }

    // Distribute from ship round-robin
    let idx = 0;
    while (remaining > 0) {
      const seat = seatOrder[idx % state.playerCount];
      newPlayers[seat] = {
        ...newPlayers[seat],
        colonists: newPlayers[seat].colonists + 1,
      };
      remaining--;
      idx++;
    }

    // Auto-assign for all players (simple: fill plantations first, then buildings)
    for (let i = 0; i < state.playerCount; i++) {
      const p = newPlayers[i];
      let available = p.colonists;

      // Auto-assign: fill empty plantation slots
      const newPlantations = p.plantations.map(pl => {
        if (!pl.colonist && available > 0) {
          available--;
          return { ...pl, colonist: true };
        }
        return pl;
      });

      // Auto-assign: fill empty building slots
      const newBuildings = p.buildings.map(b => {
        const canAdd = Math.min(b.def.maxColonists - b.colonists, available);
        if (canAdd > 0) {
          available -= canAdd;
          return { ...b, colonists: b.colonists + canAdd };
        }
        return b;
      });

      newPlayers[i] = {
        ...p,
        plantations: newPlantations,
        buildings: newBuildings,
        colonists: available,
      };
    }

    // Refill colonist ship
    const newShipSize = state.playerCount;
    const actualShip = Math.min(newShipSize, newColonistSupply);
    newColonistSupply -= actualShip;

    const humanExists = state.players.some(p => p.isHuman);

    set({
      players: newPlayers,
      colonistShip: actualShip,
      colonistSupply: newColonistSupply,
      lastAction: 'mayor',
      // If a human player exists, pause so they can manually adjust their colonists
      ...(humanExists ? { waitingForHuman: true, activePlayerSeat: 0 } : {}),
    });

    get().addLog('Colonists distributed! ' + (humanExists ? 'Adjust your placement and confirm.' : 'Mayor phase complete.'), null);

    if (!humanExists) {
      if (get().checkGameEnd()) return;
      get().endRolePhase();
    }
  },

  mayorConfirm: () => {
    get().addLog('Colonist placement confirmed.', 0);
    set({ waitingForHuman: false });
    if (get().checkGameEnd()) return;
    get().endRolePhase();
  },

  mayorAssignColonists: (seat, assignments) => {
    // Human can manually reassign after auto-distribution
    const state = get();
    const player = state.players[seat];
    if (!player.isHuman) return;

    const newPlantations = player.plantations.map((p, i) => ({
      ...p,
      colonist: assignments.plantations[i] ?? p.colonist,
    }));

    const newBuildings = player.buildings.map((b, i) => ({
      ...b,
      colonists: assignments.buildings[i] ?? b.colonists,
    }));

    // Verify total colonists are conserved
    const totalAssigned = newPlantations.filter(p => p.colonist).length +
      newBuildings.reduce((s, b) => s + b.colonists, 0);
    const totalAvailable = totalColonists(player);
    const remaining = totalAvailable - totalAssigned;

    if (remaining < 0) return; // invalid

    const newPlayers = [...state.players];
    newPlayers[seat] = { ...player, plantations: newPlantations, buildings: newBuildings, colonists: remaining };
    set({ players: newPlayers });
  },

  // ============================================================
  // CRAFTSMAN (auto-produce for everyone)
  // ============================================================
  executeCraftsman: (rolePickerSeat: number) => {
    const state = get();
    const newPlayers = [...state.players];
    const newGoodsSupply = { ...state.goodsSupply };

    // Produce for all players
    for (let i = 0; i < state.playerCount; i++) {
      const seat = (rolePickerSeat + i) % state.playerCount;
      const p = newPlayers[seat];
      const newGoods = { ...p.goods };
      let typesProduced = 0;

      for (const resource of RESOURCE_ORDER) {
        const qty = canProduce(p, resource);
        const available = newGoodsSupply[resource];
        const produced = Math.min(qty, available);
        if (produced > 0) {
          newGoods[resource] += produced;
          newGoodsSupply[resource] -= produced;
          typesProduced++;
        }
      }

      newPlayers[seat] = { ...p, goods: newGoods };

      // Factory bonus
      if (getOccupiedBuildingAbility(p, 'factory') && typesProduced > 0) {
        const bonus = factoryBonus(typesProduced);
        newPlayers[seat] = { ...newPlayers[seat], doubloons: newPlayers[seat].doubloons + bonus };
        if (bonus > 0) get().addLog(`${p.name} earned ${bonus} doubloons from Factory`, seat);
      }
    }

    set({ players: newPlayers, goodsSupply: newGoodsSupply, lastAction: 'craftsman' });

    get().addLog('Goods produced!', null);

    // Role picker gets to choose 1 bonus good (privilege)
    const picker = newPlayers[rolePickerSeat];
    const producibleTypes = RESOURCE_ORDER.filter(r => canProduce(picker, r) > 0 && newGoodsSupply[r] > 0);

    if (producibleTypes.length > 0 && picker.isHuman) {
      // Human chooses bonus good via UI
      set({ waitingForHuman: true, activePlayerSeat: rolePickerSeat });
      return; // Wait for craftsmanBonusGood()
    } else if (producibleTypes.length > 0) {
      // AI auto-picks most valuable
      const best = producibleTypes.sort((a, b) => TRADE_PRICES[b] - TRADE_PRICES[a])[0];
      get().craftsmanBonusGood(rolePickerSeat, best);
    } else {
      get().endRolePhase();
    }
  },

  craftsmanBonusGood: (seat, resource) => {
    const state = get();
    if (state.goodsSupply[resource] <= 0) {
      get().endRolePhase();
      return;
    }

    const newPlayers = [...state.players];
    const p = newPlayers[seat];
    newPlayers[seat] = { ...p, goods: { ...p.goods, [resource]: p.goods[resource] + 1 } };

    const newGoodsSupply = { ...state.goodsSupply };
    newGoodsSupply[resource] -= 1;

    set({ players: newPlayers, goodsSupply: newGoodsSupply });
    get().addLog(`${p.name} took bonus ${resource} (craftsman privilege)`, seat);
    get().endRolePhase();
  },

  craftsmanSkipBonus: (_seat) => {
    get().endRolePhase();
  },

  // ============================================================
  // CAPTAIN
  // ============================================================
  captainShipGoods: (seat, shipIndex, resource) => {
    const state = get();
    const player = state.players[seat];
    const ship = state.ships[shipIndex];

    if (ship.cargoType && ship.cargoType !== resource) return;
    if (ship.filled >= ship.capacity) return;
    if (player.goods[resource] <= 0) return;

    const spaceOnShip = ship.capacity - ship.filled;
    const amount = Math.min(player.goods[resource], spaceOnShip);

    const newShips = [...state.ships];
    newShips[shipIndex] = { ...ship, cargoType: resource, filled: ship.filled + amount };

    const newPlayers = [...state.players];
    const newGoods = { ...player.goods };
    newGoods[resource] -= amount;

    // VP earned
    let vpEarned = amount;
    if (getOccupiedBuildingAbility(player, 'harbor')) {
      vpEarned += 1; // +1 per shipment
    }
    const actualVP = Math.min(vpEarned, state.vpSupply);

    newPlayers[seat] = {
      ...player,
      goods: newGoods,
      victoryPoints: player.victoryPoints + actualVP,
    };

    // Return goods to supply
    const newGoodsSupply = { ...state.goodsSupply };
    // shipped goods go back to supply
    newGoodsSupply[resource] += amount;

    // Use a unique lastAction so the GameScreen useEffect always re-fires,
    // even when an AI ships multiple consecutive times (same string would be
    // a no-op dep change and would permanently stall the AI).
    set({
      ships: newShips,
      players: newPlayers,
      vpSupply: state.vpSupply - actualVP,
      goodsSupply: newGoodsSupply,
      lastAction: `captain_ship_${Date.now()}`,
    });

    get().addLog(`${player.name} shipped ${amount} ${resource} (+${actualVP} VP)`, seat);

    // Check if player must continue shipping
    if (get().playerCanStillShip(seat)) {
      // Player must continue shipping (mandatory)
      set({ waitingForHuman: seat === 0 });
    } else {
      get().advanceToNextPlayer();
    }
  },

  captainUseWharf: (seat, resource, amount) => {
    const state = get();
    const player = state.players[seat];
    if (!getOccupiedBuildingAbility(player, 'wharf')) return;
    if (player.goods[resource] < amount) return;

    const actualAmount = amount;
    let vpEarned = actualAmount;
    if (getOccupiedBuildingAbility(player, 'harbor')) vpEarned += 1;
    const actualVP = Math.min(vpEarned, state.vpSupply);

    const newPlayers = [...state.players];
    const newGoods = { ...player.goods };
    newGoods[resource] -= actualAmount;
    newPlayers[seat] = {
      ...player,
      goods: newGoods,
      victoryPoints: player.victoryPoints + actualVP,
    };

    set({ players: newPlayers, vpSupply: state.vpSupply - actualVP });
    get().addLog(`${player.name} shipped ${actualAmount} ${resource} via Wharf (+${actualVP} VP)`, seat);
    get().advanceToNextPlayer();
  },

  captainPass: (_seat) => {
    get().advanceToNextPlayer();
  },

  // Captain helper: can player ship anything?
  playerCanStillShip: (seat: number): boolean => {
    const state = get();
    const player = state.players[seat];
    const hasGoods = RESOURCE_ORDER.some(r => player.goods[r] > 0);
    if (!hasGoods) return false;

    // Check if any ship can accept their goods
    for (const resource of RESOURCE_ORDER) {
      if (player.goods[resource] <= 0) continue;
      for (const ship of state.ships) {
        if (ship.filled >= ship.capacity) continue;
        if (ship.cargoType === null || ship.cargoType === resource) {
          // Check no other ship already carries this type
          const otherShipHasType = state.ships.some((s) =>
            s.cargoType === resource && s !== ship
          );
          if (!otherShipHasType || ship.cargoType === resource) return true;
        }
      }
      // Wharf
      if (getOccupiedBuildingAbility(player, 'wharf')) return true;
    }
    return false;
  },

  // Captain cleanup: spoil goods, clear full ships
  captainCleanup: () => {
    const state = get();
    const newPlayers = [...state.players];

    for (let seat = 0; seat < state.playerCount; seat++) {
      const p = newPlayers[seat];
      const newGoods = { ...p.goods };

      // Count warehouse capacity
      let typesCanStore = 0;
      if (getOccupiedBuildingAbility(p, 'small_warehouse')) typesCanStore += 1;
      if (getOccupiedBuildingAbility(p, 'large_warehouse')) typesCanStore += 2;

      // Determine which types to keep: prioritize most valuable
      const typesWithGoods = RESOURCE_ORDER.filter(r => newGoods[r] > 0)
        .sort((a, b) => TRADE_PRICES[b] - TRADE_PRICES[a]);

      const storedTypes = new Set<ResourceType>();
      for (let i = 0; i < typesCanStore && i < typesWithGoods.length; i++) {
        storedTypes.add(typesWithGoods[i]);
      }

      // Every player keeps 1 type of good (1 barrel) + warehoused types (all barrels)
      let keptOneBarrel = false;
      for (const resource of typesWithGoods) {
        if (storedTypes.has(resource)) {
          // Keep all of this type
          continue;
        } else if (!keptOneBarrel && newGoods[resource] > 0) {
          // Keep 1 barrel
          const spoiled = newGoods[resource] - 1;
          newGoods[resource] = 1;
          keptOneBarrel = true;
          if (spoiled > 0) get().addLog(`${p.name} spoiled ${spoiled} ${resource}`, seat);
        } else {
          // Spoil all
          if (newGoods[resource] > 0) {
            get().addLog(`${p.name} spoiled ${newGoods[resource]} ${resource}`, seat);
          }
          newGoods[resource] = 0;
        }
      }

      newPlayers[seat] = { ...p, goods: newGoods };
    }

    // Clear full ships
    const newShips = state.ships.map(ship => {
      if (ship.filled >= ship.capacity) {
        return { ...ship, cargoType: null, filled: 0 };
      }
      return ship;
    });

    // Clear trading house if full
    let newTradingHouse = [...state.tradingHouse];
    if (newTradingHouse.every(slot => slot !== null)) {
      newTradingHouse = Array(TRADING_HOUSE_SIZE).fill(null);
      get().addLog('Trading house cleared', null);
    }

    set({ players: newPlayers, ships: newShips, tradingHouse: newTradingHouse });
  },

  // ============================================================
  // TRADER
  // ============================================================
  traderSellGood: (seat, resource) => {
    const state = get();
    const player = state.players[seat];
    if (player.goods[resource] <= 0) return;

    // Check trading house not full
    const emptySlot = state.tradingHouse.indexOf(null);
    if (emptySlot === -1) return;

    // Check resource not already in trading house (unless Office)
    const alreadyInHouse = state.tradingHouse.includes(resource);
    if (alreadyInHouse && !getOccupiedBuildingAbility(player, 'office')) return;

    // Calculate payment
    let payment = TRADE_PRICES[resource];
    if (seat === state.rolePickerSeat) payment += 1; // trader privilege
    if (getOccupiedBuildingAbility(player, 'small_market')) payment += 1;
    if (getOccupiedBuildingAbility(player, 'large_market')) payment += 2;

    const newPlayers = [...state.players];
    newPlayers[seat] = {
      ...player,
      doubloons: player.doubloons + payment,
      goods: { ...player.goods, [resource]: player.goods[resource] - 1 },
    };

    const newTradingHouse = [...state.tradingHouse];
    newTradingHouse[emptySlot] = resource;

    set({ players: newPlayers, tradingHouse: newTradingHouse, lastAction: 'trader' });
    get().addLog(`${player.name} sold ${resource} for ${payment} doubloons`, seat);
    get().advanceToNextPlayer();
  },

  traderPass: (seat) => {
    const player = get().players[seat];
    get().addLog(`${player.name} passed (trader)`, seat);
    get().advanceToNextPlayer();
  },

  // ============================================================
  // FLOW CONTROL
  // ============================================================
  advanceToNextPlayer: () => {
    const state = get();
    const nextSeat = (state.activePlayerSeat + 1) % state.playerCount;

    // Check if we've gone all the way around back to role picker
    if (nextSeat === state.rolePickerSeat) {
      // Captain phase: check if anyone can still ship before ending
      if (state.phase === 'captain' || state.phase === 'captain_cleanup') {
        const anyoneCanShip = state.players.some((_, s) => get().playerCanStillShip(s));
        if (anyoneCanShip) {
          // Continue another lap — move to role picker and let the normal flow continue
          set({
            activePlayerSeat: nextSeat,
            waitingForHuman: state.players[nextSeat].isHuman,
            lastAction: `captain_continue_${Date.now()}`,
          });
          return;
        }
        get().captainCleanup();
      }
      get().endRolePhase();
      return;
    }

    // For the captain phase, auto-skip players who cannot ship (they'd just pass)
    if (state.phase === 'captain' || state.phase === 'captain_cleanup') {
      if (!get().playerCanStillShip(nextSeat) && !state.players[nextSeat].isHuman) {
        // AI can't ship — skip them without stopping the flow
        set({ activePlayerSeat: nextSeat, lastAction: `captain_skip_${Date.now()}` });
        get().advanceToNextPlayer();
        return;
      }
    }

    set({
      activePlayerSeat: nextSeat,
      waitingForHuman: state.players[nextSeat].isHuman,
    });
  },

  endRolePhase: () => {
    const state = get();

    // Check game end
    if (get().checkGameEnd()) return;

    // Check if all roles selected this round
    if (state.rolesSelectedThisRound >= state.playerCount) {
      // End of round — advance governor, reset roles
      get().advanceRound();
      return;
    }

    // Back to role selection for next player
    const nextPicker = get().getNextRolePicker(
      state.rolePickerSeat,
      state.rolesSelectedThisRound
    );

    set({
      phase: 'role_selection',
      activePlayerSeat: nextPicker.seat,
      rolePickerSeat: nextPicker.seat,
      waitingForHuman: nextPicker.isHuman,
      lastAction: 'phase_end',
    });
  },

  getNextRolePicker: (currentSeat: number, rolesSelected: number) => {
    const state = get();
    if (rolesSelected >= state.playerCount) {
      // Round over
      return { seat: state.governorSeat, isHuman: state.players[state.governorSeat].isHuman };
    }
    const nextSeat = (currentSeat + 1) % state.playerCount;
    return { seat: nextSeat, isHuman: state.players[nextSeat].isHuman };
  },

  advanceRound: () => {
    const state = get();
    const newGovernor = (state.governorSeat + 1) % state.playerCount;

    // Add 1 doubloon to each unselected role
    const newRoles = createInitialRoles(state.playerCount);
    for (const oldRole of state.roles) {
      const newRole = newRoles.find(r => r.type === oldRole.type);
      if (newRole && !oldRole.available) {
        // This role was selected — no bonus carryover
      } else if (newRole) {
        // This role was NOT selected — carry over bonus +1
        newRole.bonusDoubloons = oldRole.bonusDoubloons + 1;
      }
    }

    // Refill visible plantations
    const deck = [...state.plantationDeck];
    const needed = VISIBLE_PLANTATIONS(state.playerCount) - state.visiblePlantations.length;
    const newVisible = [...state.visiblePlantations];
    for (let i = 0; i < needed && deck.length > 0; i++) {
      newVisible.push(deck.shift()!);
    }

    set({
      round: state.round + 1,
      governorSeat: newGovernor,
      rolePickerSeat: newGovernor,
      activePlayerSeat: newGovernor,
      rolesSelectedThisRound: 0,
      phase: 'role_selection',
      roles: newRoles,
      plantationDeck: deck,
      visiblePlantations: newVisible,
      waitingForHuman: state.players[newGovernor].isHuman,
      lastAction: 'new_round',
    });
    get().addLog(`Round ${state.round + 1} begins. Governor: ${state.players[newGovernor].name}`, null);
  },

  // ============================================================
  // GAME END
  // ============================================================
  checkGameEnd: () => {
    const state = get();
    let gameOver = false;

    if (state.colonistSupply <= 0 && state.colonistShip <= 0) gameOver = true;
    if (state.vpSupply <= 0) gameOver = true;

    // Check if any player has filled all 12 building slots
    for (const p of state.players) {
      const slots = p.buildings.reduce((s, b) => s + (b.def.size === 'large' ? 2 : 1), 0);
      if (slots >= MAX_BUILDING_SLOTS) gameOver = true;
    }

    if (gameOver) {
      get().calculateFinalScores();
      return true;
    }
    return false;
  },

  calculateFinalScores: () => {
    const state = get();
    const scores: { seat: number; total: number; breakdown: Record<string, number> }[] = [];

    for (const player of state.players) {
      const breakdown: Record<string, number> = {};

      // Building VP
      breakdown.buildings = player.buildings.reduce((sum, b) => sum + b.def.vp, 0);

      // Shipping VP (already tracked)
      breakdown.shipping = player.victoryPoints;

      // Bonus VP from large buildings
      let bonusVP = 0;

      // Guild Hall: +1 per small production, +2 per large production
      if (player.buildings.some(b => b.def.id === 'guild_hall' && b.colonists > 0)) {
        for (const b of player.buildings) {
          if (b.def.category === 'production') {
            bonusVP += b.def.size === 'small' ? 1 : 2;
          }
        }
      }

      // City Hall: +1 per violet building
      if (player.buildings.some(b => b.def.id === 'city_hall' && b.colonists > 0)) {
        bonusVP += player.buildings.filter(b => b.def.category === 'violet').length;
      }

      // Fortress: +1 per 3 colonists
      if (player.buildings.some(b => b.def.id === 'fortress' && b.colonists > 0)) {
        bonusVP += Math.floor(totalColonists(player) / 3);
      }

      // Customs House: +1 per 4 VP tokens
      if (player.buildings.some(b => b.def.id === 'customs_house' && b.colonists > 0)) {
        bonusVP += Math.floor(player.victoryPoints / 4);
      }

      // Residence: +4 for ≤9 plantations, +5 for 10, +6 for 11, +7 for 12
      if (player.buildings.some(b => b.def.id === 'residence' && b.colonists > 0)) {
        const filledPlantations = player.plantations.filter(p => p.colonist).length;
        if (filledPlantations <= 9) bonusVP += 4;
        else if (filledPlantations === 10) bonusVP += 5;
        else if (filledPlantations === 11) bonusVP += 6;
        else bonusVP += 7;
      }

      breakdown.bonusBuildings = bonusVP;
      breakdown.total = breakdown.buildings + breakdown.shipping + breakdown.bonusBuildings;

      scores.push({ seat: player.seat, total: breakdown.total, breakdown });
    }

    scores.sort((a, b) => b.total - a.total);

    set({
      phase: 'game_over',
      gameOverScores: scores,
      waitingForHuman: false,
    });
    get().addLog(`Game Over! Winner: ${get().players[scores[0].seat].name} with ${scores[0].total} VP`, null);
  },

  // ============================================================
  // QUERIES
  // ============================================================
  getHumanPlayer: () => get().players[0],

  canAffordBuilding: (seat, buildingId) => {
    const state = get();
    const building = ALL_BUILDINGS.find(b => b.id === buildingId);
    if (!building) return false;
    const player = state.players[seat];
    const isBuilder = seat === state.rolePickerSeat && state.phase === 'builder';
    return player.doubloons >= getBuildingCost(player, building, isBuilder);
  },

  getAvailableShipsForResource: (resource) => {
    const state = get();
    return state.ships
      .map((ship, i) => ({ ship, i }))
      .filter(({ ship }) => {
        if (ship.filled >= ship.capacity) return false;
        if (ship.cargoType === null) {
          // Empty ship — check no other ship already carries this resource
          return !state.ships.some(s => s.cargoType === resource);
        }
        return ship.cargoType === resource;
      })
      .map(({ i }) => i);
  },

  isHumanTurn: () => get().waitingForHuman,

  addLog: (message, seat = null) => {
    set(state => ({
      gameLog: [{ message, seat, timestamp: Date.now() }, ...state.gameLog].slice(0, 100),
    }));
  },
}));

export default useGameEngine;
