import type { GameEngineState } from '../store/gameEngine';
import { ALL_BUILDINGS } from '../data/buildings';
import {
  type ResourceType, type RoleType,
  RESOURCE_ORDER, TRADE_PRICES,
} from '../data/constants';

// ============================================================
// AI Decision Engine
// ============================================================

function canProduce(player: GameEngineState['players'][0], resource: ResourceType): number {
  if (resource === 'corn') {
    return player.plantations.filter(p => p.type === 'corn' && p.colonist).length;
  }
  const plantations = player.plantations.filter(p => p.type === resource && p.colonist).length;
  const buildingSlots = player.buildings
    .filter(b => b.def.productionType === resource)
    .reduce((sum, b) => sum + b.colonists, 0);
  return Math.min(plantations, buildingSlots);
}

function totalGoods(player: GameEngineState['players'][0]): number {
  return RESOURCE_ORDER.reduce((sum, r) => sum + player.goods[r], 0);
}

function hasOccupiedBuilding(player: GameEngineState['players'][0], id: string): boolean {
  return player.buildings.some(b => b.def.id === id && b.colonists > 0);
}

function getQuarryDiscount(player: GameEngineState['players'][0]): number {
  return player.plantations.filter(p => p.type === 'quarry' && p.colonist).length;
}

// ============================================================
// ROLE SELECTION
// ============================================================

function chooseRole(state: GameEngineState, seat: number): RoleType {
  const available = state.roles.filter(r => r.available);
  const player = state.players[seat];
  const difficulty = state.difficulty;

  if (difficulty === 'easy') {
    // Easy: slight preference for craftsman/captain, otherwise random
    const preferred: RoleType[] = ['craftsman', 'captain', 'builder'];
    for (const pref of preferred) {
      const role = available.find(r => r.type === pref);
      if (role) return role.type;
    }
    return available[Math.floor(Math.random() * available.length)].type;
  }

  // Medium: score each role
  let bestRole = available[0].type;
  let bestScore = -Infinity;

  for (const role of available) {
    let score = role.bonusDoubloons * 2; // bonus doubloons are valuable

    switch (role.type) {
      case 'craftsman': {
        // How much will I produce?
        let myProd = 0;
        let otherMaxProd = 0;
        for (const r of RESOURCE_ORDER) {
          myProd += canProduce(player, r);
        }
        for (let i = 0; i < state.playerCount; i++) {
          if (i === seat) continue;
          let prod = 0;
          for (const r of RESOURCE_ORDER) prod += canProduce(state.players[i], r);
          otherMaxProd = Math.max(otherMaxProd, prod);
        }
        score += myProd * 3;
        score -= otherMaxProd * 1.5; // penalty if others produce a lot too
        break;
      }
      case 'captain': {
        score += totalGoods(player) * 2;
        // Penalty if others have more goods
        for (let i = 0; i < state.playerCount; i++) {
          if (i === seat) continue;
          if (totalGoods(state.players[i]) > totalGoods(player)) score -= 3;
        }
        break;
      }
      case 'builder': {
        // Can I afford something good?
        const discount = 1 + getQuarryDiscount(player);
        const affordable = ALL_BUILDINGS.filter(b =>
          (state.buildingSupply[b.id] ?? 0) > 0 &&
          player.doubloons >= Math.max(0, b.cost - discount) &&
          !player.buildings.some(pb => pb.def.id === b.id && b.category === 'violet')
        );
        if (affordable.length > 0) {
          const bestBuilding = affordable.sort((a, b) => b.vp - a.vp)[0];
          score += bestBuilding.vp * 3 + 2;
        }
        break;
      }
      case 'settler': {
        score += 3;
        // More valuable if I have production buildings without matching plantations
        for (const b of player.buildings) {
          if (b.def.productionType) {
            const matching = player.plantations.filter(p => p.type === b.def.productionType).length;
            if (matching === 0) score += 4;
          }
        }
        break;
      }
      case 'trader': {
        // Do I have valuable goods to sell?
        const tradable = RESOURCE_ORDER.filter(r =>
          player.goods[r] > 0 &&
          (!state.tradingHouse.includes(r) || hasOccupiedBuilding(player, 'office'))
        );
        if (tradable.length > 0) {
          const bestGood = tradable.sort((a, b) => TRADE_PRICES[b] - TRADE_PRICES[a])[0];
          score += TRADE_PRICES[bestGood] + 2;
        }
        break;
      }
      case 'mayor': {
        // Good if I have empty plantation/building slots
        const emptyPlantations = player.plantations.filter(p => !p.colonist).length;
        const emptyBuildingSlots = player.buildings.reduce((s, b) => s + (b.def.maxColonists - b.colonists), 0);
        score += (emptyPlantations + emptyBuildingSlots) * 1.5;
        break;
      }
      case 'prospector': {
        score += 1; // baseline fallback
        break;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestRole = role.type;
    }
  }

  return bestRole;
}

// ============================================================
// SETTLER ACTION
// ============================================================

function choosePlantation(state: GameEngineState, seat: number): { type: 'plantation' | 'quarry'; plantation?: string } {
  const player = state.players[seat];
  const isRolePicker = seat === state.rolePickerSeat;

  if (state.difficulty === 'easy') {
    // Easy: random from visible
    if (state.visiblePlantations.length > 0) {
      const idx = Math.floor(Math.random() * state.visiblePlantations.length);
      return { type: 'plantation', plantation: state.visiblePlantations[idx] };
    }
    return { type: 'quarry' };
  }

  // Medium: prioritize plantations matching owned buildings
  const neededTypes = new Set<ResourceType>();
  for (const b of player.buildings) {
    if (b.def.productionType) {
      const matching = player.plantations.filter(p => p.type === b.def.productionType).length;
      if (matching < b.def.maxColonists) {
        neededTypes.add(b.def.productionType);
      }
    }
  }

  // Priority: coffee > tobacco > sugar > indigo > corn
  const priority: ResourceType[] = ['coffee', 'tobacco', 'sugar', 'indigo', 'corn'];

  for (const resource of priority) {
    if (neededTypes.has(resource) && state.visiblePlantations.includes(resource)) {
      return { type: 'plantation', plantation: resource };
    }
  }

  // Quarry if role picker and have buildings planned
  if (isRolePicker && state.quarriesRemaining > 0 && player.buildings.length >= 2) {
    return { type: 'quarry' };
  }

  // Take most valuable available
  for (const resource of priority) {
    if (state.visiblePlantations.includes(resource)) {
      return { type: 'plantation', plantation: resource };
    }
  }

  // Fallback
  if (state.visiblePlantations.length > 0) {
    return { type: 'plantation', plantation: state.visiblePlantations[0] };
  }
  return { type: 'quarry' };
}

// ============================================================
// BUILDER ACTION
// ============================================================

function chooseBuilding(state: GameEngineState, seat: number): string | null {
  const player = state.players[seat];
  const isBuilder = seat === state.rolePickerSeat;
  const quarryDiscount = getQuarryDiscount(player);
  const discount = (isBuilder ? 1 : 0) + quarryDiscount;

  const usedSlots = player.buildings.reduce((s, b) => s + (b.def.size === 'large' ? 2 : 1), 0);

  const affordable = ALL_BUILDINGS.filter(b => {
    if ((state.buildingSupply[b.id] ?? 0) <= 0) return false;
    const cost = Math.max(0, b.cost - discount);
    if (player.doubloons < cost) return false;
    if (b.category === 'violet' && player.buildings.some(pb => pb.def.id === b.id)) return false;
    const neededSlots = b.size === 'large' ? 2 : 1;
    if (usedSlots + neededSlots > 12) return false;
    return true;
  });

  if (affordable.length === 0) return null;

  if (state.difficulty === 'easy') {
    // Easy: buy cheapest
    return affordable.sort((a, b) => a.cost - b.cost)[0].id;
  }

  // Medium: score buildings
  let bestId: string | null = null;
  let bestScore = 0;

  for (const b of affordable) {
    let score = b.vp * 3;
    const cost = Math.max(0, b.cost - discount);

    // Production buildings: prioritize if we have matching plantations
    if (b.productionType) {
      const matchingPlantations = player.plantations.filter(p => p.type === b.productionType).length;
      const existingBuildings = player.buildings.filter(pb => pb.def.productionType === b.productionType).length;
      if (matchingPlantations > 0 && existingBuildings === 0) {
        score += TRADE_PRICES[b.productionType] * 2 + 5;
      }
    }

    // Violet building bonuses
    if (b.id === 'factory') score += 6;
    if (b.id === 'harbor') score += 5;
    if (b.id === 'wharf') score += 7;
    if (b.id === 'small_market' || b.id === 'large_market') score += 3;

    // Late game: major buildings
    if (state.round > 6 && b.cost === 10) score += 8;

    // Cost efficiency
    score -= cost * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestId = b.id;
    }
  }

  return bestScore > 1 ? bestId : null; // Pass if nothing worth buying
}

// ============================================================
// CAPTAIN ACTION
// ============================================================

function chooseCaptainAction(state: GameEngineState, seat: number): { shipIndex: number; resource: ResourceType } | { wharf: true; resource: ResourceType } | null {
  const player = state.players[seat];

  // Find all possible shipments
  const options: { shipIndex: number; resource: ResourceType; amount: number }[] = [];

  for (const resource of RESOURCE_ORDER) {
    if (player.goods[resource] <= 0) continue;

    for (let i = 0; i < state.ships.length; i++) {
      const ship = state.ships[i];
      if (ship.filled >= ship.capacity) continue;

      if (ship.cargoType === null) {
        // Empty ship — make sure no other ship carries this resource
        if (state.ships.some(s => s.cargoType === resource)) continue;
        const amount = Math.min(player.goods[resource], ship.capacity);
        options.push({ shipIndex: i, resource, amount });
      } else if (ship.cargoType === resource) {
        const space = ship.capacity - ship.filled;
        const amount = Math.min(player.goods[resource], space);
        options.push({ shipIndex: i, resource, amount });
      }
    }
  }

  if (options.length === 0) {
    // Try wharf
    if (hasOccupiedBuilding(player, 'wharf')) {
      const bestResource = RESOURCE_ORDER
        .filter(r => player.goods[r] > 0)
        .sort((a, b) => player.goods[b] - player.goods[a])[0];
      if (bestResource) {
        return { wharf: true, resource: bestResource };
      }
    }
    return null;
  }

  if (state.difficulty === 'easy') {
    // Easy: ship most goods
    options.sort((a, b) => b.amount - a.amount);
    return { shipIndex: options[0].shipIndex, resource: options[0].resource };
  }

  // Medium: maximize VP, prefer filling ships
  options.sort((a, b) => {
    // Prefer filling a ship that's already partially loaded
    const aFillBonus = state.ships[a.shipIndex].cargoType ? 2 : 0;
    const bFillBonus = state.ships[b.shipIndex].cargoType ? 2 : 0;
    return (b.amount + bFillBonus) - (a.amount + aFillBonus);
  });

  return { shipIndex: options[0].shipIndex, resource: options[0].resource };
}

// ============================================================
// TRADER ACTION
// ============================================================

function chooseTraderAction(state: GameEngineState, seat: number): ResourceType | null {
  const player = state.players[seat];
  const hasOffice = hasOccupiedBuilding(player, 'office');

  const tradable = RESOURCE_ORDER.filter(r => {
    if (player.goods[r] <= 0) return false;
    if (state.tradingHouse.includes(r) && !hasOffice) return false;
    if (state.tradingHouse.every(s => s !== null)) return false;
    return true;
  });

  if (tradable.length === 0) return null;

  // Sell most expensive
  tradable.sort((a, b) => TRADE_PRICES[b] - TRADE_PRICES[a]);
  return tradable[0];
}

// ============================================================
// MAIN AI ACTION DISPATCHER
// ============================================================

export function executeAITurn(
  state: GameEngineState,
  seat: number,
  actions: {
    selectRole: (seat: number, role: RoleType) => void;
    settlerTakePlantation: (seat: number, type: string) => void;
    builderBuyBuilding: (seat: number, buildingId: string) => void;
    builderPass: (seat: number) => void;
    captainShipGoods: (seat: number, shipIndex: number, resource: ResourceType) => void;
    captainUseWharf: (seat: number, resource: ResourceType, amount: number) => void;
    captainPass: (seat: number) => void;
    traderSellGood: (seat: number, resource: ResourceType) => void;
    traderPass: (seat: number) => void;
    craftsmanBonusGood: (seat: number, resource: ResourceType) => void;
  },
): void {
  const player = state.players[seat];
  if (player.isHuman) return;

  switch (state.phase) {
    case 'role_selection': {
      const role = chooseRole(state, seat);
      actions.selectRole(seat, role);
      break;
    }
    case 'settler': {
      const choice = choosePlantation(state, seat);
      if (choice.type === 'quarry') {
        actions.settlerTakePlantation(seat, 'quarry');
      } else {
        actions.settlerTakePlantation(seat, choice.plantation!);
      }
      break;
    }
    case 'builder': {
      const buildingId = chooseBuilding(state, seat);
      if (buildingId) {
        actions.builderBuyBuilding(seat, buildingId);
      } else {
        actions.builderPass(seat);
      }
      break;
    }
    case 'captain': {
      const action = chooseCaptainAction(state, seat);
      if (!action) {
        actions.captainPass(seat);
      } else if ('wharf' in action) {
        actions.captainUseWharf(seat, action.resource, player.goods[action.resource]);
      } else {
        actions.captainShipGoods(seat, action.shipIndex, action.resource);
      }
      break;
    }
    case 'trader': {
      const resource = chooseTraderAction(state, seat);
      if (resource) {
        actions.traderSellGood(seat, resource);
      } else {
        actions.traderPass(seat);
      }
      break;
    }
    case 'craftsman': {
      // Craftsman bonus good choice
      const producible = RESOURCE_ORDER.filter(r =>
        canProduce(player, r) > 0 && state.goodsSupply[r] > 0
      );
      if (producible.length > 0) {
        const best = producible.sort((a, b) => TRADE_PRICES[b] - TRADE_PRICES[a])[0];
        actions.craftsmanBonusGood(seat, best);
      }
      break;
    }
    default:
      break;
  }
}

export const AI_TURN_DELAY = 600; // ms
