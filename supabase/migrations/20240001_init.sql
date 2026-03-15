-- ============================================================
-- Puerto Rico Game: Initial Schema Migration
-- ============================================================

-- profiles: Extended user data (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  avatar_url   TEXT,
  games_played INT DEFAULT 0,
  games_won    INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Public profile for each authenticated user';

-- games: Game room / session
CREATE TABLE IF NOT EXISTS public.games (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code    TEXT UNIQUE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'waiting'
               CHECK (status IN ('waiting', 'in_progress', 'finished')),
  max_players  INT NOT NULL DEFAULT 4
               CHECK (max_players BETWEEN 2 AND 5),
  host_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  winner_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  started_at   TIMESTAMPTZ,
  ended_at     TIMESTAMPTZ
);

COMMENT ON TABLE public.games IS 'Game rooms/sessions';
CREATE INDEX IF NOT EXISTS idx_games_room_code ON public.games(room_code);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);

-- game_players: Player state within a game session
CREATE TABLE IF NOT EXISTS public.game_players (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id        UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seat_order     INT NOT NULL CHECK (seat_order BETWEEN 0 AND 4),
  is_governor    BOOLEAN DEFAULT FALSE,
  doubloons      INT DEFAULT 2 CHECK (doubloons >= 0),
  victory_points INT DEFAULT 0 CHECK (victory_points >= 0),
  colonists      INT DEFAULT 0 CHECK (colonists >= 0),
  -- JSONB: [{type: 'corn'|'indigo'|..., colonized: bool}]
  plantations    JSONB NOT NULL DEFAULT '[]',
  -- JSONB: [{type: 'small_indigo_plant'|..., colonists: 0, vp: 1}]
  buildings      JSONB NOT NULL DEFAULT '[]',
  -- JSONB: {corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0}
  goods          JSONB NOT NULL DEFAULT '{"corn":0,"indigo":0,"sugar":0,"tobacco":0,"coffee":0}',
  is_connected   BOOLEAN DEFAULT TRUE,
  joined_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id),
  UNIQUE(game_id, seat_order)
);

COMMENT ON TABLE public.game_players IS 'Per-player state within a game session';
CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON public.game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON public.game_players(user_id);

-- game_states: Current game snapshot (Realtime core table)
CREATE TABLE IF NOT EXISTS public.game_states (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id              UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  round                INT NOT NULL DEFAULT 1 CHECK (round > 0),
  phase                TEXT NOT NULL DEFAULT 'role_selection'
                       CHECK (phase IN ('role_selection', 'action', 'end_round', 'game_over')),
  current_player_seat  INT NOT NULL DEFAULT 0,
  governor_seat        INT NOT NULL DEFAULT 0,
  -- JSONB: [{role: 'settler'|..., doubloons_bonus: 0}]
  roles_available      JSONB NOT NULL DEFAULT '[]',
  -- JSONB: {seat_order: role_name}
  roles_selected       JSONB NOT NULL DEFAULT '{}',
  -- JSONB: [{capacity: 4, cargo_type: null, cargo_count: 0}]
  ships                JSONB NOT NULL DEFAULT '[]',
  -- JSONB: ['corn', 'indigo', ...] max 4 items
  trading_house        JSONB NOT NULL DEFAULT '[]',
  -- JSONB: stack of plantation tiles (hidden)
  plantation_supply    JSONB NOT NULL DEFAULT '[]',
  -- JSONB: visible plantation choices this round
  plantation_visible   JSONB NOT NULL DEFAULT '[]',
  -- JSONB: {building_type: count_remaining}
  buildings_market     JSONB NOT NULL DEFAULT '{}',
  -- JSONB: {colonists: 0, vp_tokens: 0, goods: {corn:0,...}, quarries: 0}
  supply               JSONB NOT NULL DEFAULT '{}',
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id)
);

COMMENT ON TABLE public.game_states IS 'Live game state snapshot - subscribed via Supabase Realtime';
CREATE INDEX IF NOT EXISTS idx_game_states_game_id ON public.game_states(game_id);

-- game_actions: Action log (audit trail / replay support)
CREATE TABLE IF NOT EXISTS public.game_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id     UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  round       INT NOT NULL,
  phase       TEXT NOT NULL,
  -- action_type: select_role|build|produce|trade|ship|settle|colonize|prospector
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.game_actions IS 'Immutable action log for game replay and audit';
CREATE INDEX IF NOT EXISTS idx_game_actions_game_id ON public.game_actions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_player_id ON public.game_actions(player_id);

-- ============================================================
-- Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_game_states_updated_at ON public.game_states;
CREATE TRIGGER trg_game_states_updated_at
  BEFORE UPDATE ON public.game_states
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
