import type { ResourceType } from './constants';

export interface BuildingDef {
  id: string;
  name: string;
  cost: number;
  vp: number;
  maxColonists: number;
  size: 'small' | 'large';  // small = 1 city slot, large = 2 city slots
  category: 'production' | 'violet';
  productionType?: ResourceType;
  description: string;
  totalAvailable: number;
}

// ============================================================
// Full 23-Building Catalog
// ============================================================

export const ALL_BUILDINGS: BuildingDef[] = [
  // ---- Production Buildings ----
  {
    id: 'small_indigo_plant',
    name: 'Sm. Indigo Plant',
    cost: 1, vp: 1, maxColonists: 1, size: 'small',
    category: 'production', productionType: 'indigo',
    description: 'Produces indigo with 1 colonist',
    totalAvailable: 4,
  },
  {
    id: 'small_sugar_mill',
    name: 'Sm. Sugar Mill',
    cost: 2, vp: 1, maxColonists: 1, size: 'small',
    category: 'production', productionType: 'sugar',
    description: 'Produces sugar with 1 colonist',
    totalAvailable: 4,
  },
  {
    id: 'indigo_plant',
    name: 'Indigo Plant',
    cost: 3, vp: 2, maxColonists: 3, size: 'large',
    category: 'production', productionType: 'indigo',
    description: 'Produces indigo with up to 3 colonists',
    totalAvailable: 3,
  },
  {
    id: 'sugar_mill',
    name: 'Sugar Mill',
    cost: 4, vp: 2, maxColonists: 3, size: 'large',
    category: 'production', productionType: 'sugar',
    description: 'Produces sugar with up to 3 colonists',
    totalAvailable: 3,
  },
  {
    id: 'tobacco_storage',
    name: 'Tobacco Storage',
    cost: 5, vp: 3, maxColonists: 3, size: 'large',
    category: 'production', productionType: 'tobacco',
    description: 'Produces tobacco with up to 3 colonists',
    totalAvailable: 3,
  },
  {
    id: 'coffee_roaster',
    name: 'Coffee Roaster',
    cost: 6, vp: 3, maxColonists: 2, size: 'large',
    category: 'production', productionType: 'coffee',
    description: 'Produces coffee with up to 2 colonists',
    totalAvailable: 3,
  },

  // ---- Small Violet Buildings (1 city slot) ----
  {
    id: 'small_market',
    name: 'Small Market',
    cost: 1, vp: 1, maxColonists: 1, size: 'small',
    category: 'violet',
    description: '+1 doubloon when trading',
    totalAvailable: 2,
  },
  {
    id: 'hacienda',
    name: 'Hacienda',
    cost: 2, vp: 1, maxColonists: 1, size: 'small',
    category: 'violet',
    description: 'May take an extra plantation from the deck when settling',
    totalAvailable: 2,
  },
  {
    id: 'construction_hut',
    name: 'Construction Hut',
    cost: 2, vp: 1, maxColonists: 1, size: 'small',
    category: 'violet',
    description: 'May take a quarry instead of a plantation when settling',
    totalAvailable: 2,
  },
  {
    id: 'small_warehouse',
    name: 'Small Warehouse',
    cost: 3, vp: 1, maxColonists: 1, size: 'small',
    category: 'violet',
    description: 'Store 1 type of goods during captain phase',
    totalAvailable: 2,
  },
  {
    id: 'hospice',
    name: 'Hospice',
    cost: 4, vp: 2, maxColonists: 1, size: 'small',
    category: 'violet',
    description: 'New plantations/quarries come with a colonist',
    totalAvailable: 2,
  },
  {
    id: 'office',
    name: 'Office',
    cost: 5, vp: 2, maxColonists: 1, size: 'small',
    category: 'violet',
    description: 'May sell a good already in the trading house',
    totalAvailable: 2,
  },
  {
    id: 'large_market',
    name: 'Large Market',
    cost: 5, vp: 2, maxColonists: 1, size: 'small',
    category: 'violet',
    description: '+2 doubloons when trading',
    totalAvailable: 2,
  },
  {
    id: 'large_warehouse',
    name: 'Large Warehouse',
    cost: 6, vp: 2, maxColonists: 1, size: 'small',
    category: 'violet',
    description: 'Store 2 types of goods during captain phase',
    totalAvailable: 2,
  },
  {
    id: 'factory',
    name: 'Factory',
    cost: 7, vp: 3, maxColonists: 1, size: 'small',
    category: 'violet',
    description: '+0/1/2/3/5 doubloons when producing 0-1/2/3/4/5+ types of goods',
    totalAvailable: 2,
  },
  {
    id: 'university',
    name: 'University',
    cost: 8, vp: 3, maxColonists: 1, size: 'small',
    category: 'violet',
    description: 'New buildings come with a colonist',
    totalAvailable: 2,
  },
  {
    id: 'harbor',
    name: 'Harbor',
    cost: 8, vp: 3, maxColonists: 1, size: 'small',
    category: 'violet',
    description: '+1 VP each time you ship goods',
    totalAvailable: 2,
  },
  {
    id: 'wharf',
    name: 'Wharf',
    cost: 9, vp: 3, maxColonists: 1, size: 'small',
    category: 'violet',
    description: 'May ship goods to your own wharf (any type, any amount)',
    totalAvailable: 2,
  },

  // ---- Large Violet Buildings (2 city slots) ----
  {
    id: 'guild_hall',
    name: 'Guild Hall',
    cost: 10, vp: 4, maxColonists: 1, size: 'large',
    category: 'violet',
    description: '+1 VP per small production bldg, +2 VP per large production bldg at game end',
    totalAvailable: 1,
  },
  {
    id: 'residence',
    name: 'Residence',
    cost: 10, vp: 4, maxColonists: 1, size: 'large',
    category: 'violet',
    description: '+4/5/6/7 VP for 1-9/10/11/12 occupied plantation tiles at game end',
    totalAvailable: 1,
  },
  {
    id: 'fortress',
    name: 'Fortress',
    cost: 10, vp: 4, maxColonists: 1, size: 'large',
    category: 'violet',
    description: '+1 VP per 3 colonists at game end',
    totalAvailable: 1,
  },
  {
    id: 'customs_house',
    name: 'Customs House',
    cost: 10, vp: 4, maxColonists: 1, size: 'large',
    category: 'violet',
    description: '+1 VP per 4 VP tokens at game end',
    totalAvailable: 1,
  },
  {
    id: 'city_hall',
    name: 'City Hall',
    cost: 10, vp: 4, maxColonists: 1, size: 'large',
    category: 'violet',
    description: '+1 VP per violet building at game end',
    totalAvailable: 1,
  },
];

export function getBuildingById(id: string): BuildingDef | undefined {
  return ALL_BUILDINGS.find(b => b.id === id);
}

export function getProductionBuildings(): BuildingDef[] {
  return ALL_BUILDINGS.filter(b => b.category === 'production');
}

export function getVioletBuildings(): BuildingDef[] {
  return ALL_BUILDINGS.filter(b => b.category === 'violet');
}

export function getMajorBuildings(): BuildingDef[] {
  return ALL_BUILDINGS.filter(b => b.cost === 10);
}
