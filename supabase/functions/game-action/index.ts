import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import type { ActionType, DbGameState, DbGamePlayer, Role } from '../_shared/types.ts';
import {
  BUILDING_COSTS,
  TRADING_PRICES,
  getInitialRolesAvailable,
  drawPlantations,
} from '../_shared/rules.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Fetch all players for this game (needed for some actions)
    const { data: allPlayers } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', game_id)
      .order('seat_order');

    const players = (allPlayers ?? []) as DbGamePlayer[];
    const playerCount = players.length;

    // Process the action
    let updatedState: Partial<DbGameState> = {};
    let updatedPlayer: Partial<DbGamePlayer> = {};
    let stateUpdates: { user_id: string; updates: Partial<DbGamePlayer> }[] = [];

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

        // Remove role from available, record selection
        const newRolesAvailable = state.roles_available.filter((r) => r.role !== role);
        const newRolesSelected = { ...state.roles_selected, [player.seat_order]: role };

        // Move to action phase (role-specific action phase)
        updatedState = {
          roles_available: newRolesAvailable,
          roles_selected: newRolesSelected,
          phase: 'action',
        };
        break;
      }

      case 'settle': {
        // Settler role: take a plantation tile
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

        // Remove tile from visible supply
        const newVisible = [...state.plantation_visible];
        const idx = newVisible.indexOf(plantationType as never);
        if (idx > -1) newVisible.splice(idx, 1);
        updatedState.plantation_visible = newVisible;

        // Advance turn
        updatedState = { ...updatedState, ...advanceTurn(state, player.seat_order, playerCount) };
        break;
      }

      case 'build': {
        // Builder role: buy a building
        const buildingType = action_data.building as keyof typeof BUILDING_COSTS;
        const buildingCost = BUILDING_COSTS[buildingType];

        if (!buildingCost) {
          return new Response(JSON.stringify({ error: 'Invalid building type' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const isBuilder = state.roles_selected[player.seat_order] === 'builder';
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
        updatedState = { ...updatedState, ...advanceTurn(state, player.seat_order, playerCount) };
        break;
      }

      case 'trade': {
        // Trader role: sell a good
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
        const goods = { ...player.goods };
        if (!goods[resource as keyof typeof goods] || goods[resource as keyof typeof goods] <= 0) {
          return new Response(JSON.stringify({ error: 'You do not have this resource' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        (goods as Record<string, number>)[resource] -= 1;
        updatedPlayer.doubloons = player.doubloons + price;
        updatedPlayer.goods = goods;
        updatedState.trading_house = [...tradingHouse, resource] as DbGameState['trading_house'];
        updatedState = { ...updatedState, ...advanceTurn(state, player.seat_order, playerCount) };
        break;
      }

      case 'pass': {
        // Skip / pass action
        updatedState = advanceTurn(state, player.seat_order, playerCount);
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action_type}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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

/** Advance turn to next player; switch to next role selection when round ends */
function advanceTurn(
  state: DbGameState,
  currentSeat: number,
  playerCount: number,
): Partial<DbGameState> {
  const nextSeat = (currentSeat + 1) % playerCount;

  // If we've gone back to the governor's seat, the round is over
  if (nextSeat === state.governor_seat && state.phase === 'action') {
    const newGovernorSeat = (state.governor_seat + 1) % playerCount;
    return {
      phase: 'role_selection',
      current_player_seat: newGovernorSeat,
      governor_seat: newGovernorSeat,
      round: state.round + 1,
      roles_available: getInitialRolesAvailable(),
      roles_selected: {},
    };
  }

  return {
    current_player_seat: nextSeat,
    phase: state.phase === 'action' ? 'action' : 'role_selection',
  };
}
