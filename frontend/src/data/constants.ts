// ============================================================
// Puerto Rico Game Constants
// ============================================================

export type ResourceType = 'corn' | 'indigo' | 'sugar' | 'tobacco' | 'coffee';
export type PlantationType = ResourceType | 'quarry';
export type RoleType = 'settler' | 'builder' | 'mayor' | 'craftsman' | 'captain' | 'trader' | 'prospector';
export type GamePhase = 'role_selection' | RoleType | 'captain_cleanup' | 'game_over';
export type Difficulty = 'easy' | 'medium';

export const RESOURCE_ORDER: ResourceType[] = ['corn', 'indigo', 'sugar', 'tobacco', 'coffee'];

export const TRADE_PRICES: Record<ResourceType, number> = {
  corn: 0,
  indigo: 1,
  sugar: 2,
  tobacco: 3,
  coffee: 4,
};

export const SHIP_VP: Record<ResourceType, number> = {
  corn: 1,
  indigo: 1,
  sugar: 1,
  tobacco: 1,
  coffee: 1,
};

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  corn: 'Corn',
  indigo: 'Indigo',
  sugar: 'Sugar',
  tobacco: 'Tobacco',
  coffee: 'Coffee',
};

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  corn: '#eab308',
  indigo: '#3b82f6',
  sugar: '#d1d5db',
  tobacco: '#22c55e',
  coffee: '#78350f',
};

export const ROLE_LABELS: Record<RoleType, string> = {
  settler: 'Settler',
  builder: 'Builder',
  mayor: 'Mayor',
  craftsman: 'Craftsman',
  captain: 'Captain',
  trader: 'Trader',
  prospector: 'Prospector',
};

export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  settler: 'Take a plantation tile to add to your island',
  builder: 'Buy a building at a discount',
  mayor: 'Distribute colonists to your plantations and buildings',
  craftsman: 'Produce goods from your production chains',
  captain: 'Ship goods on cargo ships for victory points',
  trader: 'Sell a good to the trading house for doubloons',
  prospector: 'Collect 1 doubloon from the bank',
};

// ---- Setup constants by player count ----

export const SHIP_CAPACITIES: Record<number, number[]> = {
  2: [4, 5, 6],
  3: [4, 5, 6],
  4: [5, 6, 7],
  5: [6, 7, 8],
};

export const STARTING_DOUBLOONS: Record<number, number[]> = {
  // index = seat order
  3: [2, 2, 2],
  4: [3, 3, 3, 3],
  5: [3, 3, 3, 3, 3],
};

export const COLONIST_SUPPLY: Record<number, number> = {
  3: 55,
  4: 75,
  5: 95,
};

export const VP_SUPPLY: Record<number, number> = {
  3: 75,
  4: 100,
  5: 122,
};

export const INITIAL_GOODS_SUPPLY: Record<ResourceType, number> = {
  corn: 10,
  indigo: 11,
  sugar: 11,
  tobacco: 9,
  coffee: 9,
};

export const MAX_BUILDING_SLOTS = 12;
export const TRADING_HOUSE_SIZE = 4;
export const TOTAL_QUARRIES = 8;

// Plantation deck composition
export const PLANTATION_DECK_COUNTS: Record<PlantationType, number> = {
  corn: 8,
  indigo: 9,
  sugar: 9,
  tobacco: 9,
  coffee: 9,
  quarry: 0, // quarries are separate
};

// Number of face-up plantations = player count + 1
export const VISIBLE_PLANTATIONS = (playerCount: number) => playerCount + 1;

// AI names
export const AI_NAMES = ['Governor Maria', 'Captain Diego', 'Doña Isabella', 'Don Carlos'];
export const AI_COLORS = ['#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
export const HUMAN_COLOR = '#22c55e';
