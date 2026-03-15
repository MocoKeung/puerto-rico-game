-- ============================================================
-- Puerto Rico Game: Row Level Security Policies
-- ============================================================

-- ----------------------
-- profiles
-- ----------------------
-- Any authenticated user can read profiles (for lobby/game display)
CREATE POLICY "profiles: authenticated read"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can only update their own profile
CREATE POLICY "profiles: self update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile is created automatically via trigger (no insert policy needed for users)

-- ----------------------
-- games
-- ----------------------
-- Any authenticated user can read games (for lobby listing)
CREATE POLICY "games: authenticated read"
  ON public.games FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only the host can update game metadata (status, etc.)
-- Edge Functions use service_role which bypasses RLS
CREATE POLICY "games: host update"
  ON public.games FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- ----------------------
-- game_players
-- ----------------------
-- Players can read all players in games they are participating in
CREATE POLICY "game_players: participant read"
  ON public.game_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.game_players gp
      WHERE gp.game_id = game_players.game_id
        AND gp.user_id = auth.uid()
    )
  );

-- Players can update their own player record (e.g., is_connected)
CREATE POLICY "game_players: self update"
  ON public.game_players FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ----------------------
-- game_states
-- ----------------------
-- Players in the game can subscribe to and read the game state
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
-- Players in the game can read the action log
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
-- These tables need to be in the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_states;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
