import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getInitialRolesAvailable,
  getInitialBuildings,
  getInitialShips,
  getInitialSupply,
  generatePlantationDeck,
  drawPlantations,
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

    const { game_id } = await req.json();
    if (!game_id) {
      return new Response(JSON.stringify({ error: 'game_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch game + players
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*, game_players(*)')
      .eq('id', game_id)
      .single();

    if (gameError || !game) {
      return new Response(JSON.stringify({ error: 'Game not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (game.host_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Only the host can start the game' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (game.status !== 'waiting') {
      return new Response(JSON.stringify({ error: 'Game already started' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const players = game.game_players ?? [];
    const playerCount = players.length;

    if (playerCount < 2) {
      return new Response(JSON.stringify({ error: 'Need at least 2 players to start' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Randomly pick who goes first (governor)
    const governorSeat = Math.floor(Math.random() * playerCount);

    // Update the governor flag on players
    for (const p of players) {
      const isGov = p.seat_order === governorSeat;
      if (p.is_governor !== isGov) {
        await supabase
          .from('game_players')
          .update({ is_governor: isGov })
          .eq('id', p.id);
      }
    }

    // Build initial game state
    const plantationDeck = generatePlantationDeck();
    const visibleCount = playerCount + 1; // visible choices = player count + 1
    const { drawn: visiblePlantations, remaining: supplyDeck } = drawPlantations(
      plantationDeck,
      visibleCount,
    );

    const initialState = {
      game_id,
      round: 1,
      phase: 'role_selection',
      current_player_seat: governorSeat,
      governor_seat: governorSeat,
      roles_available: getInitialRolesAvailable(playerCount),
      roles_selected: {},
      ships: getInitialShips(playerCount),
      trading_house: [],
      plantation_supply: supplyDeck,
      plantation_visible: visiblePlantations,
      buildings_market: getInitialBuildings(),
      supply: getInitialSupply(playerCount),
    };

    // Insert game state
    const { error: stateError } = await supabase
      .from('game_states')
      .insert(initialState);

    if (stateError) throw stateError;

    // Update game status to in_progress
    const { error: updateError } = await supabase
      .from('games')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', game_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, message: 'Game started' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('start-game error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
