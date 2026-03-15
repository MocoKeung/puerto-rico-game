-- ============================================================
-- Puerto Rico Game: Row Level Security Policies
-- ============================================================

-- ----------------------
-- profiles
-- ----------------------
DROP POLICY IF EXISTS "profiles: authenticated read" ON public.profiles;
CREATE POLICY "profiles: authenticated read"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "profiles: self update" ON public.profiles;
CREATE POLICY "profiles: self update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile is created automatically via trigger (no insert policy needed for users)

-- ----------------------
-- games
-- ----------------------
DROP POLICY IF EXISTS "games: authenticated read" ON public.games;
CREATE POLICY "games: authenticated read"
  ON public.games FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "games: host update" ON public.games;
CREATE POLICY "games: host update"
  ON public.games FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- ----------------------
-- game_players
-- ----------------------
DROP POLICY IF EXISTS "game_players: participant read" ON public.game_players;
CREATE POLICY "game_players: participant read"
  ON public.game_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.game_players gp
      WHERE gp.game_id = game_players.game_id
        AND gp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "game_players: self update" ON public.game_players;
CREATE POLICY "game_players: self update"
  ON public.game_players FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ----------------------
-- game_states
-- ----------------------
DROP POLICY IF EXISTS "game_states: participant read" ON public.game_states;
CREATE POLICY "game_states: participant read"
  ON public.game_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.game_players
      WHERE game_players.game_id = game_states.game_id
        AND game_players.user_id = auth.uid()
    )
  );

-- ----------------------
-- game_actions
-- ----------------------
DROP POLICY IF EXISTS "game_actions: participant read" ON public.game_actions;
CREATE POLICY "game_actions: participant read"
  ON public.game_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.game_players
      WHERE game_players.game_id = game_actions.game_id
        AND game_players.user_id = auth.uid()
    )
  );

-- ============================================================
-- Enable Supabase Realtime for live subscriptions
-- ============================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['game_states', 'game_players', 'game_actions', 'games'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END;
$$;
