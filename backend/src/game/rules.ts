// Puerto Rico Game Rules
import { Role, Resource, Plantation, Building, Player, GameState, RoleState } from '../types/index.js';

// Initial resources
export const INITIAL_RESOURCES: Record<Resource, number> = {
  corn: 9,
  indigo: 9,
  sugar: 9,
  tobacco: 7,
  coffee: 7
};

// Player starting resources based on player count
export const STARTING_RESOURCES: Record<number, { plantations: Plantation[], doubloons: number, indigo: number, corn: number }> = {
  2: { plantations: ['indigo', 'corn'], doubloons: 3, indigo: 1, corn: 1 },
  3: { plantations: ['indigo', 'indigo', 'corn', 'corn'], doubloons: 2, indigo: 1, corn: 1 },
  4: { plantations: ['indigo', 'indigo', 'indigo', 'corn', 'corn', 'corn'], doubloons: 3, indigo: 1, corn: 1 },
  5: { plantations: ['indigo', 'indigo', 'indigo', 'indigo', 'corn', 'corn', 'corn', 'corn'], doubloons: 3, indigo: 1, corn: 1 }
};

// Building costs
export const BUILDING_COSTS: Record<Building, { cost: number; victoryPoints: number; maxColonists: number }> = {
  small_indigo_plant: { cost: 1, victoryPoints: 0, maxColonists: 1 },
  small_sugar_mill: { cost: 2, victoryPoints: 0, maxColonists: 1 },
  indigo_plant: { cost: 3, victoryPoints: 0, maxColonists: 1 },
  sugar_mill: { cost: 4, victoryPoints: 0, maxColonists: 1 },
  tobacco_storage: { cost: 5, victoryPoints: 0, maxColonists: 1 },
  coffee_roaster: { cost: 6, victoryPoints: 0, maxColonists: 1 },
  small_warehouse: { cost: 5, victoryPoints: 1, maxColonists: 1 },
  hacienda: { cost: 2, victoryPoints: 1, maxColonists: 1 },
  construction_hut: { cost: 4, victoryPoints: 1, maxColonists: 1 },
  small_market: { cost: 1, victoryPoints: 1, maxColonists: 1 },
  hospice: { cost: 4, victoryPoints: 2, maxColonists: 1 },
  office: { cost: 5, victoryPoints: 2, maxColonists: 1 },
  large_market: { cost: 6, victoryPoints: 2, maxColonists: 1 },
  large_warehouse: { cost: 14, victoryPoints: 2, maxColonists: 1 },
  university: { cost: 7, victoryPoints: 2, maxColonists: 1 },
  factory: { cost: 8, victoryPoints: 2, maxColonists: 1 },
  harbor: { cost: 10, victoryPoints: 3, maxColonists: 1 },
  wharf: { cost: 12, victoryPoints: 3, maxColonists: 1 },
  city_hall: { cost: 7, victoryPoints: 4, maxColonists: 1 },
  customs_house: { cost: 10, victoryPoints: 4, maxColonists: 1 },
  fortress: { cost: 14, victoryPoints: 4, maxColonists: 1 },
  guild_hall: { cost: 10, victoryPoints: 4, maxColonists: 1 },
  residence: { cost: 12, victoryPoints: 4, maxColonists: 1 }
};

// Role bonuses - matches Role type from types/index.ts
export const ROLE_BONUSES: Record<Role, { bonus: number; action: string }> = {
  settler: { bonus: 0, action: 'Take plantation or quarry' },
  mayor: { bonus: 0, action: 'Distribute colonists' },
  builder: { bonus: -1, action: 'Build with discount' },
  craftsman: { bonus: 0, action: 'Extra resource' },
  captain: { bonus: 0, action: 'Extra victory point' },
  prospector: { bonus: 0, action: 'Take doubloon' },
  colonist: { bonus: 0, action: 'Colonists to ship' }
};

// Ship capacities by player count
export const SHIP_CAPACITIES: Record<number, number[]> = {
  2: [4, 5, 6],
  3: [5, 6, 7],
  4: [6, 7, 8],
  5: [6, 7, 8]
};

// Trading house prices
export const TRADING_PRICES: Record<Resource, number> = {
  corn: 0,
  indigo: 1,
  sugar: 2,
  tobacco: 3,
  coffee: 4
};

// Victory points for shipping
export const SHIPPING_VP: Record<Resource, number> = {
  corn: 1,
  indigo: 1,
  sugar: 1,
  tobacco: 2,
  coffee: 2
};

// All roles - matches Role type
export const ALL_ROLES: Role[] = [
  'settler', 'mayor', 'builder', 'craftsman', 'captain', 'prospector'
];

// Initial plantation market
export function getInitialPlantationMarket(): Plantation[] {
  return ['corn', 'indigo', 'sugar'];
}

// Initial available buildings
export function getInitialBuildings(): Record<Building, number> {
  return {
    small_indigo_plant: 4,
    small_sugar_mill: 4,
    indigo_plant: 3,
    sugar_mill: 3,
    tobacco_storage: 3,
    coffee_roaster: 3,
    small_warehouse: 2,
    hacienda: 2,
    construction_hut: 2,
    small_market: 2,
    hospice: 2,
    office: 2,
    large_market: 2,
    large_warehouse: 2,
    university: 2,
    factory: 2,
    harbor: 2,
    wharf: 2,
    city_hall: 1,
    customs_house: 1,
    fortress: 1,
    guild_hall: 1,
    residence: 1
  };
}

// Initialize role state - matches Role type
export function getInitialRoleState(playerCount: number): RoleState {
  const roles: Role[] = ['settler', 'mayor', 'builder', 'craftsman', 'captain', 'prospector'];
  return {
    available: roles,
    taken: [],
    currentRole: null,
    bonusDoubloons: {
      settler: 0,
      mayor: 0,
      builder: 0,
      craftsman: 0,
      captain: 0,
      prospector: 0,
      colonist: 0
    }
  };
}

// Check if game should end
export function shouldGameEnd(state: GameState, playerCount: number): boolean {
  if (state.colonistsInSupply === 0) return true;
  if (state.victoryPointSupply === 0) return true;
  return false;
}

// Calculate final score
export function calculateFinalScore(player: Player): number {
  let score = player.victoryPoints;

  const hasGuildHall = player.buildings.some(b => b.building === 'guild_hall');
  const hasCityHall = player.buildings.some(b => b.building === 'city_hall');
  const hasResidence = player.buildings.some(b => b.building === 'residence');
  const hasFortress = player.buildings.some(b => b.building === 'fortress');

  if (hasGuildHall) {
    const productionCount = player.buildings.filter(b => ['small_indigo_plant', 'small_sugar_mill', 'indigo_plant', 'sugar_mill'].includes(b.building)).length;
    const largeProductionCount = player.buildings.filter(b => ['tobacco_storage', 'coffee_roaster'].includes(b.building)).length;
    score += productionCount + (largeProductionCount * 2);
  }

  if (hasCityHall) {
    const violetCount = player.buildings.filter(b => ['small_warehouse', 'hacienda', 'construction_hut', 'small_market', 'hospice', 'office', 'large_market', 'large_warehouse', 'university', 'factory', 'harbor', 'wharf'].includes(b.building)).length;
    score += violetCount;
  }

  return score;
}

// Colors for players
export const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
