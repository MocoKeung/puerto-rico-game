// Puerto Rico Game Rules — shared between Edge Functions
import type {
  Role,
  Resource,
  Plantation,
  Building,
  RoleAvailable,
  Ship,
  Supply,
  Goods,
} from './types.ts';

export const INITIAL_SUPPLY_GOODS: Goods = {
  corn: 9,
  indigo: 9,
  sugar: 9,
  tobacco: 7,
  coffee: 7,
};

export const STARTING_CONFIG: Record<
  number,
  { startPlantations: Plantation[]; startDoubloons: number }
> = {
  2: { startPlantations: ['indigo', 'corn'], startDoubloons: 3 },
  3: { startPlantations: ['indigo', 'indigo', 'corn', 'corn'], startDoubloons: 2 },
  4: {
    startPlantations: ['indigo', 'indigo', 'indigo', 'corn', 'corn', 'corn'],
    startDoubloons: 3,
  },
  5: {
    startPlantations: [
      'indigo',
      'indigo',
      'indigo',
      'indigo',
      'corn',
      'corn',
      'corn',
      'corn',
    ],
    startDoubloons: 3,
  },
};

export const BUILDING_COSTS: Record<
  Building,
  { cost: number; vp: number; maxColonists: number }
> = {
  small_indigo_plant: { cost: 1, vp: 0, maxColonists: 1 },
  small_sugar_mill: { cost: 2, vp: 0, maxColonists: 1 },
  indigo_plant: { cost: 3, vp: 0, maxColonists: 3 },
  sugar_mill: { cost: 4, vp: 0, maxColonists: 3 },
  tobacco_storage: { cost: 5, vp: 0, maxColonists: 3 },
  coffee_roaster: { cost: 6, vp: 0, maxColonists: 2 },
  small_warehouse: { cost: 3, vp: 1, maxColonists: 1 },
  hacienda: { cost: 2, vp: 1, maxColonists: 1 },
  construction_hut: { cost: 2, vp: 1, maxColonists: 1 },
  small_market: { cost: 1, vp: 1, maxColonists: 1 },
  hospice: { cost: 4, vp: 2, maxColonists: 1 },
  office: { cost: 5, vp: 2, maxColonists: 1 },
  large_market: { cost: 5, vp: 2, maxColonists: 1 },
  large_warehouse: { cost: 6, vp: 2, maxColonists: 1 },
  university: { cost: 7, vp: 3, maxColonists: 1 },
  factory: { cost: 7, vp: 3, maxColonists: 1 },
  harbor: { cost: 8, vp: 3, maxColonists: 1 },
  wharf: { cost: 9, vp: 3, maxColonists: 1 },
  city_hall: { cost: 10, vp: 4, maxColonists: 1 },
  customs_house: { cost: 10, vp: 4, maxColonists: 1 },
  fortress: { cost: 10, vp: 4, maxColonists: 1 },
  guild_hall: { cost: 10, vp: 4, maxColonists: 1 },
  residence: { cost: 10, vp: 4, maxColonists: 1 },
};

export const TRADING_PRICES: Record<Resource, number> = {
  corn: 0,
  indigo: 1,
  sugar: 2,
  tobacco: 3,
  coffee: 4,
};

export const SHIPPING_VP: Record<Resource, number> = {
  corn: 1,
  indigo: 1,
  sugar: 1,
  tobacco: 2,
  coffee: 2,
};

export const SHIP_CAPACITIES: Record<number, number[]> = {
  2: [4, 5, 6],
  3: [5, 6, 7],
  4: [6, 7, 8],
  5: [6, 7, 8],
};

export const ALL_ROLES: Role[] = [
  'settler',
  'mayor',
  'builder',
  'craftsman',
  'captain',
  'prospector',
];

export const COLONISTS_BY_PLAYER_COUNT: Record<number, number> = {
  2: 40,
  3: 55,
  4: 75,
  5: 95,
};

export const VP_TOKENS_BY_PLAYER_COUNT: Record<number, number> = {
  2: 75,
  3: 75,
  4: 75,
  5: 75,
};

export function getInitialRolesAvailable(): RoleAvailable[] {
  return ALL_ROLES.map((role) => ({ role, doubloons_bonus: 0 }));
}

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
    residence: 1,
  };
}

export function getInitialShips(playerCount: number): Ship[] {
  return (SHIP_CAPACITIES[playerCount] ?? SHIP_CAPACITIES[4]).map((cap) => ({
    capacity: cap,
    cargo_type: null,
    cargo_count: 0,
  }));
}

export function getInitialSupply(playerCount: number): Supply {
  return {
    colonists: COLONISTS_BY_PLAYER_COUNT[playerCount] ?? 75,
    vp_tokens: VP_TOKENS_BY_PLAYER_COUNT[playerCount] ?? 75,
    quarries: 8,
    goods: { ...INITIAL_SUPPLY_GOODS },
  };
}

/** Generate a full shuffled plantation supply deck */
export function generatePlantationDeck(): Plantation[] {
  const deck: Plantation[] = [
    ...Array(8).fill('corn'),
    ...Array(9).fill('indigo'),
    ...Array(9).fill('sugar'),
    ...Array(9).fill('tobacco'),
    ...Array(9).fill('coffee'),
  ] as Plantation[];
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Draw N plantation tiles from the supply to show as visible choices */
export function drawPlantations(
  supply: Plantation[],
  count: number,
): { drawn: Plantation[]; remaining: Plantation[] } {
  const drawn = supply.slice(0, count);
  const remaining = supply.slice(count);
  return { drawn, remaining };
}

/** Generate a unique 6-character room code */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}
