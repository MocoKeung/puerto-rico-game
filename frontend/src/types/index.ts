// Puerto Rico Game — Frontend TypeScript Types

export type Role =
  | 'settler'
  | 'mayor'
  | 'builder'
  | 'craftsman'
  | 'captain'
  | 'prospector';

export type Resource = 'corn' | 'indigo' | 'sugar' | 'tobacco' | 'coffee';

export type Building =
  | 'small_indigo_plant'
  | 'small_sugar_mill'
  | 'indigo_plant'
  | 'sugar_mill'
  | 'tobacco_storage'
  | 'coffee_roaster'
  | 'small_warehouse'
  | 'hacienda'
  | 'construction_hut'
  | 'small_market'
  | 'hospice'
  | 'office'
  | 'large_market'
  | 'large_warehouse'
  | 'university'
  | 'factory'
  | 'harbor'
  | 'wharf'
  | 'city_hall'
  | 'customs_house'
  | 'fortress'
  | 'guild_hall'
  | 'residence';

export type Plantation =
  | 'corn'
  | 'indigo'
  | 'sugar'
  | 'tobacco'
  | 'coffee'
  | 'quarry';

export type GamePhase = 'role_selection' | 'action' | 'end_round' | 'game_over';
export type GameStatus = 'waiting' | 'in_progress' | 'finished';

// ---- Supabase DB row shapes ----

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  games_played: number;
  games_won: number;
  created_at: string;
}

export interface Game {
  id: string;
  room_code: string;
  status: GameStatus;
  max_players: number;
  host_id: string | null;
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface PlantationSlot {
  type: Plantation;
  colonized: boolean;
}

export interface BuildingSlot {
  type: Building;
  colonists: number;
  vp: number;
}

export interface Goods {
  corn: number;
  indigo: number;
  sugar: number;
  tobacco: number;
  coffee: number;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  user_id: string;
  seat_order: number;
  is_governor: boolean;
  doubloons: number;
  victory_points: number;
  colonists: number;
  plantations: PlantationSlot[];
  buildings: BuildingSlot[];
  goods: Goods;
  is_connected: boolean;
  joined_at: string;
  // Joined from profiles
  profile?: Pick<Profile, 'username' | 'avatar_url'>;
}

export interface RoleAvailable {
  role: Role;
  doubloons_bonus: number;
}

export interface Ship {
  capacity: number;
  cargo_type: Resource | null;
  cargo_count: number;
}

export interface Supply {
  colonists: number;
  vp_tokens: number;
  quarries: number;
  goods: Goods;
}

export interface GameState {
  id: string;
  game_id: string;
  round: number;
  phase: GamePhase;
  current_player_seat: number;
  governor_seat: number;
  roles_available: RoleAvailable[];
  roles_selected: Record<string, Role>;
  ships: Ship[];
  trading_house: Resource[];
  plantation_supply: Plantation[];
  plantation_visible: Plantation[];
  buildings_market: Record<Building, number>;
  supply: Supply;
  updated_at: string;
}

// ---- Action Payloads ----

export type ActionType =
  | 'select_role'
  | 'settle'
  | 'build'
  | 'mayor'
  | 'produce'
  | 'trade'
  | 'captain'
  | 'prospector'
  | 'pass';

export interface GameActionRequest {
  game_id: string;
  action_type: ActionType;
  action_data?: Record<string, unknown>;
}

// ---- UI State ----

export interface LobbyGame extends Game {
  player_count: number;
  host_username: string;
}
