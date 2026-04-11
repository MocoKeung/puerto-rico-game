import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  generateRoomCode,
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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Log env availability for debugging
    console.log('ENV check:', { hasUrl: !!supabaseUrl, hasServiceKey: !!serviceRoleKey, hasAnonKey: !!anonKey });

    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader, authHeader?.substring(0, 20));

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');

    // Use service role client to verify the JWT
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    console.log('Auth result:', { userId: user?.id, error: authError?.message });

    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        detail: authError?.message ?? 'No user returned',
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { max_players = 4 } = await req.json().catch(() => ({}));
    const playerCount = Math.max(2, Math.min(5, Number(max_players)));

    // Generate unique room code (retry on collision)
    let roomCode = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateRoomCode();
      const { data: existing } = await supabase
        .from('games')
        .select('id')
        .eq('room_code', candidate)
        .maybeSingle();
      if (!existing) {
        roomCode = candidate;
        break;
      }
    }
    if (!roomCode) {
      throw new Error('Failed to generate unique room code');
    }

    // Create the game row
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        room_code: roomCode,
        status: 'waiting',
        max_players: playerCount,
        host_id: user.id,
      })
      .select()
      .single();

    if (gameError) throw gameError;

    // Add the host as player 0 (first seat)
    const startPlantation = playerCount <= 3 ? 'indigo' : 'indigo';
    const { data: gamePlayer, error: playerError } = await supabase
      .from('game_players')
      .insert({
        game_id: game.id,
        user_id: user.id,
        seat_order: 0,
        is_governor: true,
        doubloons: playerCount === 3 ? 2 : 3,
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
    console.error('create-room error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
