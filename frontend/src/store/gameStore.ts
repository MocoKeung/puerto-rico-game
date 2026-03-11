import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ==================== Types ====================
export type ResourceType = 'corn' | 'indigo' | 'sugar' | 'tobacco' | 'coffee';
export type RoleType = 'settler' | 'builder' | 'mayor' | 'trader' | 'captain';
export type GamePhase = 'setup' | 'roleSelection' | 'action' | 'gameEnd';

export interface Plantation { type: ResourceType | 'quarry'; colonized: boolean; }
export interface Building { 
  id: string; name: string; cost: number; vp: number; 
  type: 'production' | 'violet'; productionType?: ResourceType;
  occupied: number; maxOccupants: number; 
}
export interface Resources { corn: number; indigo: number; sugar: number; tobacco: number; coffee: number; }
export interface Player {
  id: string; name: string; index: number;
  colonists: number; colonistsOnShip: number;
  doubloons: number; victoryPoints: number;
  resources: Resources; plantations: Plantation[]; buildings: Building[];
}
export interface Role { type: RoleType; name: string; description: string; doubloons: number; selected: boolean; selectedBy: number | null; }
export interface Ship { id: string; size: number; cargo: ResourceType | null; filled: number; }
export interface GameLogEntry { message: string; timestamp: number; }

export interface GameState {
  gamePhase: GamePhase; currentRound: number; governorIndex: number; colonistSupply: number;
  currentPlayerIndex: number; gameEnded: boolean; winner: string | null;
  roles: Role[]; availablePlantations: (ResourceType | 'quarry')[]; players: Player[];
  supplyResources: Resources; availableBuildings: Building[];
  ships: Ship[]; tradeHouse: (ResourceType | null)[];
  colonistShip: number; gameLog: GameLogEntry[]; selectedRole: RoleType | null;
}

// ==================== Building Definitions ====================
const ALL_BUILDINGS: Building[] = [
  { id: 'small_indigo', name: 'Small Indigo Plant', cost: 1, vp: 1, type: 'production', productionType: 'indigo', occupied: 0, maxOccupants: 1 },
  { id: 'small_sugar', name: 'Small Sugar Mill', cost: 2, vp: 1, type: 'production', productionType: 'sugar', occupied: 0, maxOccupants: 1 },
  { id: 'indigo_plant', name: 'Indigo Plant', cost: 3, vp: 2, type: 'production', productionType: 'indigo', occupied: 0, maxOccupants: 3 },
  { id: 'sugar_mill', name: 'Sugar Mill', cost: 4, vp: 2, type: 'production', productionType: 'sugar', occupied: 0, maxOccupants: 3 },
  { id: 'tobacco_storage', name: 'Tobacco Storage', cost: 5, vp: 3, type: 'production', productionType: 'tobacco', occupied: 0, maxOccupants: 3 },
  { id: 'coffee_roaster', name: 'Coffee Roaster', cost: 6, vp: 3, type: 'production', productionType: 'coffee', occupied: 0, maxOccupants: 3 },
  { id: 'small_market', name: 'Small Market', cost: 1, vp: 1, type: 'violet', occupied: 0, maxOccupants: 1 },
  { id: 'hacienda', name: 'Hacienda', cost: 2, vp: 1, type: 'violet', occupied: 0, maxOccupants: 1 },
  { id: 'construction_hut', name: 'Construction Hut', cost: 2, vp: 1, type: 'violet', occupied: 0, maxOccupants: 1 },
  { id: 'small_warehouse', name: 'Small Warehouse', cost: 3, vp: 1, type: 'violet', occupied: 0, maxOccupants: 1 },
  { id: 'market_stand', name: 'Market Stand', cost: 4, vp: 2, type: 'violet', occupied: 0, maxOccupants: 1 },
  { id: 'office', name: 'Office', cost: 5, vp: 2, type: 'violet', occupied: 0, maxOccupants: 1 },
  { id: 'factory', name: 'Factory', cost: 7, vp: 3, type: 'violet', occupied: 0, maxOccupants: 1 },
  { id: 'university', name: 'University', cost: 8, vp: 3, type: 'violet', occupied: 0, maxOccupants: 1 },
];

const PLANTATION_POOL: (ResourceType | 'quarry')[] = [
  'corn', 'corn', 'corn', 'corn', 'corn', 'corn',
  'indigo', 'indigo', 'indigo', 'indigo', 'indigo',
  'sugar', 'sugar', 'sugar', 'sugar', 'sugar',
  'coffee', 'coffee', 'coffee', 'coffee', 'coffee',
  'tobacco', 'tobacco', 'tobacco', 'tobacco', 'tobacco',
  'quarry', 'quarry', 'quarry', 'quarry', 'quarry',
];

// ==================== Helpers ====================
function shuffle<T>(array: T[]): T[] { return [...array].sort(() => Math.random() - 0.5); }

function createPlayer(id: string, name: string, index: number): Player {
  return {
    id, name, index, colonists: 3, colonistsOnShip: 0,
    doubloons: index === 0 ? 4 : 5 + index, victoryPoints: 0,
    resources: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
    plantations: [{ type: index === 0 ? 'indigo' : 'corn', colonized: true }],
    buildings: [],
  };
}

function initializeRoles(): Role[] {
  return [
    { type: 'settler', name: 'Settler', description: 'Take a plantation tile', doubloons: 0, selected: false, selectedBy: null },
    { type: 'builder', name: 'Builder', description: 'Buy building (-1 coin)', doubloons: 0, selected: false, selectedBy: null },
    { type: 'mayor', name: 'Mayor', description: 'Distribute colonists', doubloons: 0, selected: false, selectedBy: null },
    { type: 'trader', name: 'Trader', description: 'Sell goods in Trading House', doubloons: 0, selected: false, selectedBy: null },
    { type: 'captain', name: 'Captain', description: 'Ship goods for VP', doubloons: 0, selected: false, selectedBy: null },
  ];
}

const initialSupply: Resources = { corn: 10, indigo: 11, sugar: 11, tobacco: 9, coffee: 9 };

// ==================== Store ====================
export const useGameStore = create<GameState & {
  initGame: (playerCount: number) => void;
  selectRole: (roleType: RoleType) => void;
  unselectAllRoles: () => void;
  endRolePhase: () => void;
  takePlantation: (playerId: string, plantationType: ResourceType | 'quarry') => void;
  buyBuilding: (playerId: string, buildingId: string) => void;
  distributeColonists: (playerId: string, numColonists: number) => void;
  tradeGood: (playerId: string, resource: ResourceType) => void;
  shipGoods: (playerId: string, shipId: string, resource: ResourceType, amount: number) => void;
  produceResources: () => void;
  nextPlayer: () => void;
  endRound: () => void;
  addLog: (message: string) => void;
  getPlayer: (id: string) => Player | undefined;
  getCurrentPlayer: () => Player | null;
}>()(
  immer((set, get) => ({
    // Initial State
    gamePhase: 'setup', currentRound: 1, governorIndex: 0, colonistSupply: 55,
    currentPlayerIndex: 0, gameEnded: false, winner: null, roles: initializeRoles(),
    availablePlantations: [], players: [], supplyResources: { ...initialSupply },
    availableBuildings: ALL_BUILDINGS.slice(0, 6),
    ships: [
      { id: 'ship1', size: 4, cargo: null, filled: 0 },
      { id: 'ship2', size: 6, cargo: null, filled: 0 },
      { id: 'ship3', size: 8, cargo: null, filled: 0 },
    ],
    tradeHouse: [null, null, null, null], colonistShip: 3, gameLog: [], selectedRole: null,

    // ===== Game Setup =====
    initGame: (playerCount: number) => {
      const players: Player[] = [];
      for (let i = 0; i < playerCount; i++) {
        players.push(createPlayer('player' + (i + 1), 'Player ' + (i + 1), i));
      }
      const shuffledPlantations = shuffle(PLANTATION_POOL);
      set(state => {
        state.players = players;
        state.availablePlantations = shuffledPlantations.slice(0, playerCount + 1);
        state.gamePhase = 'roleSelection';
        state.currentRound = 1;
        state.governorIndex = 0;
        state.currentPlayerIndex = 0;
        state.roles = initializeRoles();
        state.tradeHouse = [null, null, null, null];
        state.colonistShip = playerCount;
        state.availableBuildings = ALL_BUILDINGS.slice(0, 6);
      });
      get().addLog('Game started with ' + playerCount + ' players');
    },

    // ===== Role Selection =====
    selectRole: (roleType: RoleType) => {
      const state = get();
      const role = state.roles.find(r => r.type === roleType
