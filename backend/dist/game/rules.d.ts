import { Role, Resource, Plantation, Building, Player, GameState, RoleState } from '../types/index.js';
export declare const INITIAL_RESOURCES: Record<Resource, number>;
export declare const STARTING_RESOURCES: Record<number, {
    plantations: Plantation[];
    doubloons: number;
    indigo: number;
    corn: number;
}>;
export declare const BUILDING_COSTS: Record<Building, {
    cost: number;
    victoryPoints: number;
    maxColonists: number;
}>;
export declare const ROLE_BONUSES: Record<Role, {
    bonus: number;
    action: string;
}>;
export declare const SHIP_CAPACITIES: Record<number, number[]>;
export declare const TRADING_PRICES: Record<Resource, number>;
export declare const SHIPPING_VP: Record<Resource, number>;
export declare const ALL_ROLES: Role[];
export declare function getInitialPlantationMarket(): Plantation[];
export declare function getInitialBuildings(): Record<Building, number>;
export declare function getInitialRoleState(playerCount: number): RoleState;
export declare function shouldGameEnd(state: GameState, playerCount: number): boolean;
export declare function calculateFinalScore(player: Player): number;
export declare const PLAYER_COLORS: string[];
//# sourceMappingURL=rules.d.ts.map