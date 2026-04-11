import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { STARTING_CONFIG } from '../_shared/rules.ts';

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

    const { room_code } = await req.json();
    if (!room_code) {
      return new Response(JSON.stringify({ error: 'room_code is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*, game_players(*)')
      .eq('room_code', room_code.toUpperCase())
      .single();

    if (gameError || !game) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (game.status !== 'waiting') {
      return new Response(JSON.stringify({ error: 'Game already started or finished' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const existingPlayers: { user_id: string; seat_order: number }[] =
      game.game_players ?? [];

    // Check if player already joined
    const alreadyJoined = existingPlayers.some((p) => p.user_id === user.id);
    if (alreadyJoined) {
      return new Response(JSON.stringify({ game, already_joined: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existingPlayers.length >= game.max_players) {
      return new Response(JSON.stringify({ error: 'Room is full' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const seatOrder = existingPlayers.length;
    const playerCount = game.max_players;
    const config = STARTING_CONFIG[playerCount] ?? STARTING_CONFIG[4];

    // Assign starting plantation based on seat: first half gets indigo, rest get corn
    // 2p: seat 0=indigo, 1=corn; 3p: 0,1=indigo, 2=corn; 4p: 0,1=indigo, 2,3=corn; 5p: 0,1,2=indigo, 3,4=corn
    const isIndigoSeat = seatOrder < Math.ceil(playerCount / 2);
    const startPlantation = isIndigoSeat ? 'indigo' : 'corn';

    const { data: gamePlayer, error: playerError } = await supabase
      .from('game_players')
      .insert({
        game_id: game.id,
        user_id: user.id,
        seat_order: seatOrder,
        is_governor: false,
        doubloons: config.startDoubloons,
        victory_points: 0,
        colonists: 0,
        plantations: [{ type: startPlantation, colonized: false }],
        buildings: [],
        goods: { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 },
      })
      .select()
      .single();

    if (playerError) throw playerError;

    return new Response(
      JSON.stringify({ game, player: gamePlayer }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('join-room error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
