import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import type { ActionType, DbGameState, DbGamePlayer, Role, Resource, PlantationSlot, BuildingSlot, Goods, Supply } from '../_shared/types.ts';
import {
  BUILDING_COSTS,
  TRADING_PRICES,
  getInitialRolesAvailable,
  drawPlantations,
  COLONISTS_BY_PLAYER_COUNT,
  ROLES_PER_ROUND,
} from '../_shared/rules.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    const { game_id, action_type, action_data = {} } = await req.json() as {
      game_id: string;
      action_type: ActionType;
      action_data?: Record<string, unknown>;
    };

    if (!game_id || !action_type) {
      return new Response(JSON.stringify({ error: 'game_id and action_type are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch game state and player
    const [{ data: gameState, error: stateError }, { data: gamePlayer, error: playerError }] =
      await Promise.all([
        supabase
          .from('game_states')
          .select('*')
          .eq('game_id', game_id)
          .single(),
        supabase
          .from('game_players')
          .select('*')
          .eq('game_id', game_id)
          .eq('user_id', user.id)
          .single(),
      ]);

    if (stateError || !gameState) {
      return new Response(JSON.stringify({ error: 'Game state not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (playerError || !gamePlayer) {
      return new Response(JSON.stringify({ error: 'Player not found in this game' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const state = gameState as DbGameState;
    const player = gamePlayer as DbGamePlayer;

    // Validate it's this player's turn (for most action types)
    if (action_type !== 'pass' && state.current_player_seat !== player.seat_order) {
      return new Response(JSON.stringify({ error: 'Not your turn' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all players for this game
    const { data: allPlayers } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', game_id)
      .order('seat_order');

    const players = (allPlayers ?? []) as DbGamePlayer[];
    const playerCount = players.length;

    // Find which role is currently active
    // roles_selected is keyed by pick-index (0,1,2,...), not by seat
    const numRolesSelected = Object.keys(state.roles_selected).length;
    const currentRolePickerSeat = numRolesSelected > 0
      ? (state.governor_seat + numRolesSelected - 1) % playerCount
      : state.governor_seat;
    const currentRole = numRolesSelected > 0
      ? state.roles_selected[String(numRolesSelected - 1)] as Role
      : undefined;

    // Process the action
    let updatedState: Partial<DbGameState> = {};
    let updatedPlayer: Partial<DbGamePlayer> = {};
    // For batch player updates (mayor, craftsman, etc.)
    const batchPlayerUpdates: { id: string; updates: Partial<DbGamePlayer> }[] = [];

    switch (action_type) {
      case 'select_role': {
        const role = action_data.role as Role;
        if (state.phase !== 'role_selection') {
          return new Response(JSON.stringify({ error: 'Not in role selection phase' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const roleEntry = state.roles_available.find((r) => r.role === role);
        if (!roleEntry) {
          return new Response(JSON.stringify({ error: 'Role not available' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Give player bonus doubloons stored on the role tile
        updatedPlayer.doubloons = player.doubloons + roleEntry.doubloons_bonus;

        // Remove role from available, record selection (keyed by pick-index, not seat)
        const newRolesAvailable = state.roles_available.filter((r) => r.role !== role);
        const pickIndex = numRolesSelected; // 0-based index of this pick
        const newRolesSelected = { ...state.roles_selected, [pickIndex]: role };

        updatedState = {
          roles_available: newRolesAvailable,
          roles_selected: newRolesSelected,
          phase: 'action',
        };

        // === Special handling for roles that need setup on selection ===

        if (role === 'mayor') {
          // Distribute colonists from the colonist ship
          const supply = { ...state.supply };
          // Colonist ship has playerCount colonists (or remaining from supply)
          const colonistShip = Math.min(playerCount, supply.colonists);
          supply.colonists -= colonistShip;

          // Distribute: 1 per player starting from the role picker, round-robin
          const distribution: number[] = new Array(playerCount).fill(0);
          for (let i = 0; i < colonistShip; i++) {
            const seat = (player.seat_order + i) % playerCount;
            distribution[seat]++;
          }
          // Mayor privilege: +1 extra colonist from supply
          if (supply.colonists > 0) {
            distribution[player.seat_order]++;
            supply.colonists--;
          }

          // Update each player's colonists
          for (const p of players) {
            if (distribution[p.seat_order] > 0) {
              batchPlayerUpdates.push({
                id: p.id,
                updates: { colonists: p.colonists + distribution[p.seat_order] },
              });
            }
          }
          // Also update the acting player's doubloons (already set above)
          const existingUpdate = batchPlayerUpdates.find(u => u.id === player.id);
          if (existingUpdate) {
            existingUpdate.updates.doubloons = player.doubloons + roleEntry.doubloons_bonus;
          }

          updatedState.supply = supply as DbGameState['supply'];
          // Mayor: current player acts first (assigns colonists)
          updatedState.current_player_seat = player.seat_order;
        } else if (role === 'craftsman') {
          // Craftsman: all players produce goods, then picker gets bonus
          const supply = { ...state.supply };
          const supplyGoods = { ...supply.goods } as Record<string, number>;

          for (const p of players) {
            const produced: Record<string, number> = { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 };
            const goods = { ...p.goods } as Record<string, number>;

            // Corn: needs colonized corn plantation, no building
            const cornPlantations = p.plantations.filter((pl: PlantationSlot) => pl.type === 'corn' && pl.colonized).length;
            const cornToProduce = Math.min(cornPlantations, supplyGoods.corn ?? 0);
            if (cornToProduce > 0) {
              produced.corn = cornToProduce;
              goods.corn += cornToProduce;
              supplyGoods.corn -= cornToProduce;
            }

            // Other resources: need colonized plantation + occupied production building
            for (const res of ['indigo', 'sugar', 'tobacco', 'coffee']) {
              const colonizedPlantations = p.plantations.filter((pl: PlantationSlot) => pl.type === res && pl.colonized).length;
              const productionBuildings = p.buildings.filter((b: BuildingSlot) => {
                const buildingRes = getBuildingProductionType(b.type);
                return buildingRes === res && b.colonists > 0;
              });
              const buildingSlots = productionBuildings.reduce((sum: number, b: BuildingSlot) => sum + b.colonists, 0);
              const canProduce = Math.min(colonizedPlantations, buildingSlots, supplyGoods[res] ?? 0);
              if (canProduce > 0) {
                produced[res] = canProduce;
                goods[res] += canProduce;
                supplyGoods[res] -= canProduce;
              }
            }

            const totalProduced = Object.values(produced).reduce((a, b) => a + b, 0);
            if (totalProduced > 0) {
              batchPlayerUpdates.push({
                id: p.id,
                updates: { goods: goods as Goods },
              });
            }
          }

          supply.goods = supplyGoods as Goods;
          updatedState.supply = supply as DbGameState['supply'];

          // Craftsman privilege: picker gets 1 bonus good of a type they produced
          // For now, auto-advance (bonus good selection will be handled by a follow-up action)
          updatedState.current_player_seat = player.seat_order;
        } else if (role === 'prospector') {
          // Prospector: picker gets 1 doubloon, then immediately advance
          updatedPlayer.doubloons = player.doubloons + roleEntry.doubloons_bonus + 1;
          // Skip action phase, go straight to next role selection
          // Pass pickIndex + 1 as the new count (since state.roles_selected is stale)
          updatedState = {
            ...updatedState,
            ...advanceToNextRoleSelection(
              state, playerCount, pickIndex + 1, players, batchPlayerUpdates, updatedState,
            ),
          };
        } else {
          // settler, builder, trader, captain: picker acts first
          updatedState.current_player_seat = player.seat_order;
        }

        break;
      }

      case 'settle': {
        const plantationType = action_data.plantation as string;
        const isVisible = state.plantation_visible.includes(plantationType as never);

        if (!isVisible && plantationType !== 'quarry') {
          return new Response(JSON.stringify({ error: 'Plantation not available' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const newPlantations = [
          ...player.plantations,
          { type: plantationType, colonized: false },
        ];
        updatedPlayer.plantations = newPlantations as DbGamePlayer['plantations'];

        const newVisible = [...state.plantation_visible];
        const idx = newVisible.indexOf(plantationType as never);
        if (idx > -1) newVisible.splice(idx, 1);
        updatedState.plantation_visible = newVisible;

        updatedState = {
          ...updatedState,
          ...advanceTurn(state, player.seat_order, playerCount, players, batchPlayerUpdates, updatedState),
        };
        break;
      }

      case 'build': {
        const buildingType = action_data.building as keyof typeof BUILDING_COSTS;
        const buildingCost = BUILDING_COSTS[buildingType];

        if (!buildingCost) {
          return new Response(JSON.stringify({ error: 'Invalid building type' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const isBuilder = currentRole === 'builder' && currentRolePickerSeat === player.seat_order;
        const discount = isBuilder ? 1 : 0;
        const cost = Math.max(0, buildingCost.cost - discount);

        if (player.doubloons < cost) {
          return new Response(JSON.stringify({ error: 'Not enough doubloons' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const buildingsMarket = { ...state.buildings_market } as Record<string, number>;
        if (!buildingsMarket[buildingType] || buildingsMarket[buildingType] <= 0) {
          return new Response(JSON.stringify({ error: 'Building not available in market' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        buildingsMarket[buildingType] -= 1;
        updatedPlayer.doubloons = player.doubloons - cost;
        updatedPlayer.buildings = [
          ...player.buildings,
          { type: buildingType, colonists: 0, vp: buildingCost.vp },
        ];
        updatedState.buildings_market = buildingsMarket as DbGameState['buildings_market'];
        // Apply pending mutations to player object so end-of-game check sees the new building
        const pendingPlayerForBuild = {
          ...player,
          buildings: updatedPlayer.buildings ?? player.buildings,
        } as DbGamePlayer;
        const playersForBuild = players.map(p => p.id === player.id ? pendingPlayerForBuild : p);
        updatedState = {
          ...updatedState,
          ...advanceTurn(state, player.seat_order, playerCount, playersForBuild, batchPlayerUpdates, updatedState),
        };
        break;
      }

      case 'mayor': {
        // Mayor action: player assigns colonists to plantations/buildings.
        // SERVER-AUTHORITATIVE: validates assignments are physically legal.
        const assignments = action_data.assignments as {
          plantations: boolean[];
          buildings: number[];
        } | undefined;

        if (!assignments) {
          return new Response(JSON.stringify({ error: 'assignments required for mayor action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate array lengths match player's actual slots
        if (!Array.isArray(assignments.plantations) ||
            !Array.isArray(assignments.buildings) ||
            assignments.plantations.length !== player.plantations.length ||
            assignments.buildings.length !== player.buildings.length) {
          return new Response(JSON.stringify({ error: 'Invalid assignment arrays' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate per-building colonist caps
        for (let i = 0; i < player.buildings.length; i++) {
          const b = player.buildings[i];
          const assigned = assignments.buildings[i];
          const cap = BUILDING_COSTS[b.type]?.maxColonists ?? 1;
          if (typeof assigned !== 'number' || assigned < 0 || assigned > cap) {
            return new Response(JSON.stringify({ error: `Invalid colonist count on building ${b.type}` }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        // Compute player's total colonists (all are conserved)
        const totalAvailable = player.colonists
          + player.plantations.filter((p: PlantationSlot) => p.colonized).length
          + player.buildings.reduce((sum: number, b: BuildingSlot) => sum + b.colonists, 0);

        // Apply assignments
        const newPlantations = player.plantations.map((p: PlantationSlot, i: number) => ({
          ...p,
          colonized: !!assignments.plantations[i],
        }));

        const newBuildings = player.buildings.map((b: BuildingSlot, i: number) => ({
          ...b,
          colonists: assignments.buildings[i],
        }));

        const assignedOnPlantations = newPlantations.filter((p: PlantationSlot) => p.colonized).length;
        const assignedOnBuildings = newBuildings.reduce((sum: number, b: BuildingSlot) => sum + b.colonists, 0);
        const totalAssigned = assignedOnPlantations + assignedOnBuildings;

        // Validate: cannot assign more colonists than player owns
        if (totalAssigned > totalAvailable) {
          return new Response(JSON.stringify({ error: 'Cannot assign more colonists than you own' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Remaining unassigned colonists stay in San Juan
        updatedPlayer.plantations = newPlantations as DbGamePlayer['plantations'];
        updatedPlayer.buildings = newBuildings as DbGamePlayer['buildings'];
        updatedPlayer.colonists = totalAvailable - totalAssigned;

        updatedState = {
          ...updatedState,
          ...advanceTurn(state, player.seat_order, playerCount, players, batchPlayerUpdates, updatedState),
        };
        break;
      }

      case 'trade': {
        const resource = action_data.resource as keyof typeof TRADING_PRICES;
        const tradingHouse = state.trading_house;

        if (tradingHouse.length >= 4) {
          return new Response(JSON.stringify({ error: 'Trading house is full' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (tradingHouse.includes(resource as never)) {
          return new Response(JSON.stringify({ error: 'Resource already in trading house' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const price = TRADING_PRICES[resource] ?? 0;
        const isTrader = currentRole === 'trader' && currentRolePickerSeat === player.seat_order;
        const traderBonus = isTrader ? 1 : 0;

        const goods = { ...player.goods } as Record<string, number>;
        if (!goods[resource] || goods[resource] <= 0) {
          return new Response(JSON.stringify({ error: 'You do not have this resource' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        goods[resource] -= 1;
        updatedPlayer.doubloons = player.doubloons + price + traderBonus;
        updatedPlayer.goods = goods as Goods;
        updatedState.trading_house = [...tradingHouse, resource] as DbGameState['trading_house'];
        updatedState = {
          ...updatedState,
          ...advanceTurn(state, player.seat_order, playerCount, players, batchPlayerUpdates, updatedState),
        };
        break;
      }

      case 'captain': {
        // Captain: ship goods onto a cargo ship
        const shipIndex = action_data.ship_index as number;
        const resource = action_data.resource as Resource;

        if (shipIndex == null || !resource) {
          return new Response(JSON.stringify({ error: 'ship_index and resource required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const ships = [...state.ships.map(s => ({ ...s }))];
        const ship = ships[shipIndex];

        if (!ship) {
          return new Response(JSON.stringify({ error: 'Invalid ship index' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (ship.cargo_count >= ship.capacity) {
          return new Response(JSON.stringify({ error: 'Ship is full' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (ship.cargo_type && ship.cargo_type !== resource) {
          return new Response(JSON.stringify({ error: 'Ship carries a different resource' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const goods = { ...player.goods } as Record<string, number>;
        if (!goods[resource] || goods[resource] <= 0) {
          return new Response(JSON.stringify({ error: 'You do not have this resource' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Ship as many as possible
        const spaceOnShip = ship.capacity - ship.cargo_count;
        const toShip = Math.min(goods[resource], spaceOnShip);

        goods[resource] -= toShip;
        ship.cargo_type = resource;
        ship.cargo_count += toShip;

        const isCaptain = currentRole === 'captain' && currentRolePickerSeat === player.seat_order;
        const captainBonus = isCaptain ? 1 : 0;

        updatedPlayer.goods = goods as Goods;
        updatedPlayer.victory_points = player.victory_points + toShip + captainBonus;
        updatedState.ships = ships as DbGameState['ships'];

        // Update VP supply
        const supply = { ...state.supply };
        supply.vp_tokens = Math.max(0, supply.vp_tokens - toShip - captainBonus);
        updatedState.supply = supply as DbGameState['supply'];

        // Apply pending mutations to player (goods + VP) for end-of-game checks
        const pendingPlayerForCaptain = {
          ...player,
          goods: updatedPlayer.goods ?? player.goods,
          victory_points: updatedPlayer.victory_points ?? player.victory_points,
        } as DbGamePlayer;
        const playersForCaptain = players.map(p => p.id === player.id ? pendingPlayerForCaptain : p);
        updatedState = {
          ...updatedState,
          ...advanceTurn(state, player.seat_order, playerCount, playersForCaptain, batchPlayerUpdates, updatedState),
        };
        break;
      }

      case 'produce': {
        // Craftsman bonus good selection
        const bonusResource = action_data.bonus_resource as Resource | undefined;
        if (bonusResource) {
          const goods = { ...player.goods } as Record<string, number>;
          const supply = { ...state.supply };
          const supplyGoods = { ...supply.goods } as Record<string, number>;
          if (supplyGoods[bonusResource] > 0) {
            goods[bonusResource] += 1;
            supplyGoods[bonusResource] -= 1;
            updatedPlayer.goods = goods as Goods;
            supply.goods = supplyGoods as Goods;
            updatedState.supply = supply as DbGameState['supply'];
          }
        }
        // After bonus, advance to next role selection
        updatedState = {
          ...updatedState,
          ...advanceToNextRoleSelection(
            state, playerCount, undefined, players, batchPlayerUpdates, updatedState,
          ),
        };
        break;
      }

      case 'pass': {
        updatedState = advanceTurn(
          state, player.seat_order, playerCount, players, batchPlayerUpdates, updatedState,
        );
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action_type}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Apply batch player updates (for mayor/craftsman distribution)
    for (const batch of batchPlayerUpdates) {
      // Merge with updatedPlayer if same player
      if (batch.id === player.id) {
        Object.assign(updatedPlayer, batch.updates);
      } else {
        const { error: batchError } = await supabase
          .from('game_players')
          .update(batch.updates)
          .eq('id', batch.id);
        if (batchError) throw batchError;
      }
    }

    // Apply player updates
    if (Object.keys(updatedPlayer).length > 0) {
      const { error: playerUpdateError } = await supabase
        .from('game_players')
        .update(updatedPlayer)
        .eq('id', player.id);
      if (playerUpdateError) throw playerUpdateError;
    }

    // Apply state updates
    if (Object.keys(updatedState).length > 0) {
      const { error: stateUpdateError } = await supabase
        .from('game_states')
        .update(updatedState)
        .eq('game_id', game_id);
      if (stateUpdateError) throw stateUpdateError;
    }

    // Log the action
    await supabase.from('game_actions').insert({
      game_id,
      player_id: player.id,
      round: state.round,
      phase: state.phase,
      action_type,
      action_data,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('game-action error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

// ---- Helper: map building type to production resource ----
function getBuildingProductionType(buildingType: string): string | null {
  const map: Record<string, string> = {
    small_indigo_plant: 'indigo',
    indigo_plant: 'indigo',
    small_sugar_mill: 'sugar',
    sugar_mill: 'sugar',
    tobacco_storage: 'tobacco',
    coffee_roaster: 'coffee',
  };
  return map[buildingType] ?? null;
}

/** Advance turn to next player within current role phase */
function advanceTurn(
  state: DbGameState,
  currentSeat: number,
  playerCount: number,
  players: DbGamePlayer[],
  batchPlayerUpdates: { id: string; updates: Partial<DbGamePlayer> }[],
  mergedStateSoFar: Partial<DbGameState> = {},
): Partial<DbGameState> {
  const numRolesSelected = Object.keys(state.roles_selected).length;
  const rolePickerSeat = numRolesSelected > 0
    ? (state.governor_seat + numRolesSelected - 1) % playerCount
    : state.governor_seat;

  const nextSeat = (currentSeat + 1) % playerCount;

  // If we've looped back to the role picker, this role phase is done
  if (nextSeat === rolePickerSeat && state.phase === 'action') {
    return advanceToNextRoleSelection(
      state, playerCount, undefined, players, batchPlayerUpdates, mergedStateSoFar,
    );
  }

  return {
    current_player_seat: nextSeat,
  };
}

/**
 * Advance to the next role selection (or new round if enough roles picked).
 * Handles: captain ship cleanup, goods discard, end-of-game detection, round advance.
 */
function advanceToNextRoleSelection(
  state: DbGameState,
  playerCount: number,
  numRolesSelectedOverride: number | undefined,
  players: DbGamePlayer[],
  batchPlayerUpdates: { id: string; updates: Partial<DbGamePlayer> }[],
  mergedStateSoFar: Partial<DbGameState> = {},
): Partial<DbGameState> {
  const numRolesSelected = numRolesSelectedOverride ?? Object.keys(state.roles_selected).length;
  const rolesPerRound = ROLES_PER_ROUND[playerCount] ?? playerCount;
  const nextPickerSeat = (state.governor_seat + numRolesSelected) % playerCount;

  // Determine if we just finished the Captain phase.
  // Only trigger when transitioning OUT of an action phase (state.phase === 'action').
  // When called from the prospector branch, state.phase is 'role_selection' and stale
  // roles_selected would mis-read the previous pick — skip cleanup in that case.
  const lastRole = numRolesSelected > 0
    ? state.roles_selected[String(numRolesSelected - 1)] as Role | undefined
    : undefined;
  const justFinishedCaptain = state.phase === 'action' && lastRole === 'captain';

  // Start with current state + any updates already applied in this request
  const currentShips = (mergedStateSoFar.ships ?? state.ships).map(s => ({ ...s }));
  const currentSupply: Supply = { ...(mergedStateSoFar.supply ?? state.supply) };
  currentSupply.goods = { ...currentSupply.goods };

  // ---- Captain end-of-phase cleanup ----
  if (justFinishedCaptain) {
    // 1. Full ships: dump cargo back to supply
    for (const ship of currentShips) {
      if (ship.cargo_count >= ship.capacity && ship.cargo_type) {
        currentSupply.goods[ship.cargo_type] = (currentSupply.goods[ship.cargo_type] ?? 0) + ship.cargo_count;
        ship.cargo_count = 0;
        ship.cargo_type = null;
      }
    }
    // 2. Each player discards goods: keeps 1 total, unless they have warehouses
    //    small_warehouse keeps 1 type (all of it), large_warehouse keeps 1 more type
    for (const p of players) {
      const goods = { ...p.goods } as Record<string, number>;
      const smallWh = p.buildings.filter((b: BuildingSlot) =>
        b.type === 'small_warehouse' && b.colonists > 0
      ).length;
      const largeWh = p.buildings.filter((b: BuildingSlot) =>
        b.type === 'large_warehouse' && b.colonists > 0
      ).length;
      const warehouseCapacity = smallWh + (largeWh * 2);

      // Order goods by quantity (highest first) to decide which types fill warehouses
      const sortedTypes = (Object.keys(goods) as Array<keyof typeof goods>)
        .filter(k => goods[k] > 0)
        .sort((a, b) => goods[b] - goods[a]);

      // Goods kept = warehoused types (all of them) + 1 single good from remaining
      const warehousedTypes = new Set(sortedTypes.slice(0, warehouseCapacity));
      let keptSingle = false;
      const newGoods: Record<string, number> = { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 };
      const totalDiscarded: Record<string, number> = { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 };

      for (const type of Object.keys(goods)) {
        const qty = goods[type];
        if (qty <= 0) continue;
        if (warehousedTypes.has(type as keyof typeof goods)) {
          newGoods[type] = qty;
        } else if (!keptSingle) {
          newGoods[type] = 1;
          totalDiscarded[type] = qty - 1;
          keptSingle = true;
        } else {
          totalDiscarded[type] = qty;
        }
      }

      // Return discarded goods to supply
      for (const type of Object.keys(totalDiscarded)) {
        if (totalDiscarded[type] > 0) {
          currentSupply.goods[type] = (currentSupply.goods[type] ?? 0) + totalDiscarded[type];
        }
      }

      // Queue player update if goods changed
      const changed = Object.keys(goods).some(k => goods[k] !== newGoods[k]);
      if (changed) {
        mergeBatchUpdate(batchPlayerUpdates, p.id, { goods: newGoods as Goods });
      }
    }
  }

  // Check if enough roles have been selected this round
  if (numRolesSelected >= rolesPerRound) {
    // ---- END-OF-GAME detection (triggered at end of a round) ----
    // Game ends if: (a) colonist supply exhausted, (b) VP supply exhausted,
    // or (c) any player fills all 12 building-city slots.
    const colonistsExhausted = currentSupply.colonists <= 0;
    const vpExhausted = currentSupply.vp_tokens <= 0;
    const anyPlayerBuiltOut = players.some((p) => {
      // Apply any pending batch update for this player's buildings
      const pendingUpdate = batchPlayerUpdates.find(u => u.id === p.id)?.updates;
      const buildings = (pendingUpdate?.buildings ?? p.buildings) as BuildingSlot[];
      const usedSlots = buildings.reduce((sum, b) => {
        const size = BUILDING_COSTS[b.type]?.cost === 10 ? 2 : 1; // large buildings (cost 10) are 2x1
        return sum + size;
      }, 0);
      return usedSlots >= 12;
    });

    if (colonistsExhausted || vpExhausted || anyPlayerBuiltOut) {
      // Final scoring: add building VP + any shipped VP already in player.victory_points
      for (const p of players) {
        const pendingUpdate = batchPlayerUpdates.find(u => u.id === p.id)?.updates;
        const buildings = (pendingUpdate?.buildings ?? p.buildings) as BuildingSlot[];
        const buildingVP = buildings.reduce((sum, b) => sum + (b.vp ?? 0), 0);
        const finalVP = p.victory_points + buildingVP;
        mergeBatchUpdate(batchPlayerUpdates, p.id, { victory_points: finalVP });
      }

      return {
        phase: 'game_over',
        ships: currentShips as DbGameState['ships'],
        supply: currentSupply as DbGameState['supply'],
      };
    }

    // ---- Normal new round ----
    const newGovernorSeat = (state.governor_seat + 1) % playerCount;

    // Use the most recent roles_selected/available (may be stale if override passed)
    const currentRolesSelected = mergedStateSoFar.roles_selected ?? state.roles_selected;
    const currentRolesAvailable = mergedStateSoFar.roles_available ?? state.roles_available;
    const selectedRoles = new Set(Object.values(currentRolesSelected));
    const newRolesAvailable = getInitialRolesAvailable(playerCount).map((r) => {
      const existing = currentRolesAvailable.find((ra) => ra.role === r.role);
      const currentBonus = existing?.doubloons_bonus ?? 0;
      const wasChosen = selectedRoles.has(r.role);
      return { role: r.role, doubloons_bonus: wasChosen ? 0 : currentBonus + 1 };
    });

    // Refill plantation display
    const visibleCount = playerCount + 1;
    const { drawn, remaining } = drawPlantations(
      state.plantation_supply as string[],
      visibleCount,
    );

    return {
      phase: 'role_selection',
      current_player_seat: newGovernorSeat,
      governor_seat: newGovernorSeat,
      round: state.round + 1,
      roles_available: newRolesAvailable,
      roles_selected: {},
      plantation_visible: drawn as DbGameState['plantation_visible'],
      plantation_supply: remaining as DbGameState['plantation_supply'],
      ships: currentShips as DbGameState['ships'],
      supply: currentSupply as DbGameState['supply'],
    };
  }

  return {
    phase: 'role_selection',
    current_player_seat: nextPickerSeat,
    ships: currentShips as DbGameState['ships'],
    supply: currentSupply as DbGameState['supply'],
  };
}

/** Helper: merge a batch update for a player by id (accumulate fields) */
function mergeBatchUpdate(
  batch: { id: string; updates: Partial<DbGamePlayer> }[],
  id: string,
  update: Partial<DbGamePlayer>,
) {
  const existing = batch.find(b => b.id === id);
  if (existing) {
    Object.assign(existing.updates, update);
  } else {
    batch.push({ id, updates: { ...update } });
  }
}
