import { create } from 'zustand';

export type ResourceType = 'corn' | 'indigo' | 'sugar' | 'tobacco' | 'coffee';
export type RoleType = 'settler' | 'builder' | 'mayor' | 'trader' | 'captain' | 'prospector';

export interface Plantation {
  type: ResourceType | 'quarry';
  colonized: boolean;
}

export interface Building {
  id: string;
  name: string;
  cost: number;
  vp: number;
  type: 'production' | 'violet';
  productionType?: ResourceType;
  occupied: number;
  maxOccupants: number;
}

export interface Resources {
  corn: number;
  indigo: number;
  sugar: number;
  tobacco: number;
  coffee: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  doubloons: number;
  colonists: number;
  victoryPoints: number;
  plantations: Plantation[];
  buildings: Building[];
  resources: Resources;
}

export interface Role {
  type: RoleType;
  name: string;
  doubloons: number;
  selected: boolean;
  selectedBy: number | null;
}

export interface Ship {
  id: string;
  size: number;
  cargo: ResourceType | null;
  filled: number;
}

export interface GameState {
  gamePhase: string;
  currentRound: number;
  currentPlayerIndex: number;
  governorIndex: number;
  selectedRole: RoleType | null;
  roles: Role[];
  players: Player[];
  ships: Ship[];
  colonistShip: number;
  availablePlantations: (ResourceType | 'quarry')[];
  buildingsAvailable: Building[];
  supplyResources: Resources;
  tradeHouse: (ResourceType | null)[];
  gameLog: { message: string; timestamp: number }[];
}

export interface GameActions {
  initGame: (playerCount: number) => void;
  selectRole: (roleType: RoleType) => void;
  nextPlayer: () => void;
  nextRound: () => void;
  takePlantation: (playerId: string, type: ResourceType | 'quarry') => void;
  buyBuilding: (playerId: string, buildingId: string) => void;
  tradeGood: (playerId: string, resource: ResourceType) => void;
  shipGoods: (playerId: string, shipId: string, resource: ResourceType) => void;
  produceResources: () => void;
  distributeColonists: () => void;
  addLog: (message: string) => void;
  endRolePhase: () => void;
}

const useGameStore = create<GameState & GameActions>((set, get) => ({
  gamePhase: 'setup',
  currentRound: 1,
  currentPlayerIndex: 0,
  governorIndex: 0,
  selectedRole: null,
  roles: [
    { type: 'settler', name: 'Settler', doubloons: 0, selected: false, selectedBy: null },
    { type: 'builder', name: 'Builder', doubloons: 0, selected: false, selectedBy: null },
    { type: 'mayor', name: 'Mayor', doubloons: 0, selected: false, selectedBy: null },
    { type: 'trader', name: 'Trader', doubloons: 0, selected: false, selectedBy: null },
    { type: 'captain', name: 'Captain', doubloons: 0, selected: false, selectedBy: null },
  ],
  players: [
    { id: '1', name: 'Player 1', color: '#ef4444', doubloons: 3, colonists: 3, victoryPoints: 0, plantations: [], buildings: [], resources: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 } },
    { id: '2', name: 'Player 2', color: '#3b82f6', doubloons: 4, colonists: 3, victoryPoints: 0, plantations: [], buildings: [], resources: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 } },
  ],
  ships: [
    { id: '1', size: 4, cargo: null, filled: 0 },
    { id: '2', size: 5, cargo: null, filled: 0 },
    { id: '3', size: 6, cargo: null, filled: 0 },
  ],
  colonistShip: 3,
  availablePlantations: ['corn', 'indigo', 'sugar' as ResourceType, 'tobacco' as ResourceType, 'coffee' as ResourceType, 'quarry'],
  buildingsAvailable: [
    { id: 'small_indigo', name: 'Small Indigo Plant', cost: 1, vp: 1, type: 'production', productionType: 'indigo', occupied: 0, maxOccupants: 1 },
    { id: 'small_sugar', name: 'Small Sugar Mill', cost: 2, vp: 1, type: 'production', productionType: 'sugar', occupied: 0, maxOccupants: 1 },
  ],
  supplyResources: { corn: 10, indigo: 11, sugar: 11, tobacco: 9, coffee: 9 },
  tradeHouse: [null, null, null, null],
  gameLog: [],

  initGame: (playerCount) => {
    set({ gamePhase: 'roleSelection' });
    get().addLog('Game started with ' + playerCount + ' players');
  },

  selectRole: (roleType) => {
    const state = get();
    const role = state.roles.find(r => r.type === roleType);
    if (role && !role.selected) {
      set((s) => ({
        selectedRole: roleType,
        roles: s.roles.map(r => r.type === roleType ? { ...r, selected: true, isTaken: true } : r)
      }));
    }
  },

  nextPlayer: () => {
    set((state) => ({
      currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length
    }));
  },

  nextRound: () => {
    set((state) => ({
      currentRound: state.currentRound + 1,
      governorIndex: (state.governorIndex + 1) % state.players.length,
      currentPlayerIndex: (state.governorIndex + 1) % state.players.length,
      selectedRole: null,
      roles: state.roles.map(r => ({ ...r, selected: false })),
      gamePhase: 'roleSelection'
    }));
  },

  takePlantation: (playerId, type) => {
    set((state) => ({
      players: state.players.map(p => p.id === playerId ? { ...p, plantations: [...p.plantations, { type, colonized: false }] } : p),
      gameLog: [...state.gameLog, { message: `Player ${playerId} took ${type}`, timestamp: Date.now() }]
    }));
  },

  buyBuilding: (playerId, buildingId) => {
    set((state) => {
      const building = state.buildingsAvailable.find(b => b.id === buildingId);
      const player = state.players.find(p => p.id === playerId);
      if (building && player && player.doubloons >= building.cost) {
        return {
          players: state.players.map(p => p.id === playerId ? { ...p, doubloons: p.doubloons - building.cost, buildings: [...p.buildings, building] } : p),
          buildingsAvailable: state.buildingsAvailable.filter(b => b.id !== buildingId),
          gameLog: [...state.gameLog, { message: `Player ${playerId} bought ${building.name}`, timestamp: Date.now() }]
        };
      }
      return state;
    });
  },

  tradeGood: (playerId, resource) => {
    console.log('tradeGood', playerId, resource);
  },

  shipGoods: (playerId, shipId, resource) => {
    console.log('shipGoods', playerId, shipId, resource);
  },

  produceResources: () => {
    console.log('produceResources');
  },

  distributeColonists: () => {
    console.log('distributeColonists');
  },

  addLog: (message) => {
    set((state) => ({
      gameLog: [...state.gameLog, { message, timestamp: Date.now() }]
    }));
  },

  endRolePhase: () => {
    set({ gamePhase: 'action', selectedRole: null });
  },
}));

export default useGameStore;
