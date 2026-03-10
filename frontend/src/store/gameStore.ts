import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  colonists: number;
  doubloons: number;
  victoryPoints: number;
  resources: {
    corn: number;
    indigo: number;
    sugar: number;
    tobacco: number;
    coffee: number;
  };
  buildings: string[];
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  selectedRole: string | null;
  gamePhase: 'roleSelection' | 'action' | 'shipping' | 'building';
  workers: number;
  colonistsOnShip: number;
  buildingsAvailable: {
    name: string;
    cost: number;
    spaces: number;
    type: 'production' | 'violet' | 'green';
  }[];
}

const initialPlayers: Player[] = [
  {
    id: 'player1',
    name: 'Player 1',
    colonists: 0,
    doubloons: 5,
    victoryPoints: 0,
    resources: { corn: 2, indigo: 1, sugar: 0, tobacco: 0, coffee: 0 },
    buildings: ['Small Indigo Plant'],
  },
  {
    id: 'player2',
    name: 'Player 2',
    colonists: 0,
    doubloons: 5,
    victoryPoints: 0,
    resources: { corn: 2, indigo: 1, sugar: 0, tobacco: 0, coffee: 0 },
    buildings: ['Small Indigo Plant'],
  },
];

const useGameStore = create<GameState & {
  selectRole: (role: string) => void;
  placeWorker: (_building: string) => void;
  collectResources: () => void;
  buyBuilding: (buildingName: string) => void;
}>((set) => ({
  players: initialPlayers,
  currentPlayerIndex: 0,
  selectedRole: null,
  gamePhase: 'roleSelection',
  workers: 8,
  colonistsOnShip: 0,
  buildingsAvailable: [
    { name: 'Small Indigo Plant', cost: 1, spaces: 1, type: 'production' },
    { name: 'Small Sugar Mill', cost: 2, spaces: 1, type: 'production' },
    { name: 'Small Market', cost: 1, spaces: 1, type: 'green' },
    { name: 'Hacienda', cost: 2, spaces: 1, type: 'green' },
    { name: 'Construction Hut', cost: 2, spaces: 1, type: 'green' },
    { name: 'Small Warehouse', cost: 3, spaces: 1, type: 'green' },
  ],

  selectRole: (role: string) => set({ selectedRole: role, gamePhase: 'action' }),

  placeWorker: () => set((state) => ({
    ...state,
    workers: state.workers > 0 ? state.workers - 1 : state.workers
  })),

  collectResources: () => set((state) => {
    const newPlayers = [...state.players];
    newPlayers[state.currentPlayerIndex] = {
      ...newPlayers[state.currentPlayerIndex],
      resources: {
        ...newPlayers[state.currentPlayerIndex].resources,
        corn: newPlayers[state.currentPlayerIndex].resources.corn + 1
      }
    };
    return { ...state, players: newPlayers };
  }),

  buyBuilding: (buildingName: string) => set((state) => {
    const target = state.buildingsAvailable.find(b => b.name === buildingName);
    if (!target) return state;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.doubloons < target.cost) return state;

    const newPlayers = [...state.players];
    newPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      doubloons: currentPlayer.doubloons - target.cost,
      buildings: [...currentPlayer.buildings, buildingName]
    };

    return { ...state, players: newPlayers };
  }),
}));

export default useGameStore;
