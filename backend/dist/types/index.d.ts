export type Role = 'colonist' | 'captain' | 'builder' | 'craftsman' | 'mayor' | 'prospector' | 'settler';
export type Resource = 'corn' | 'indigo' | 'sugar' | 'tobacco' | 'coffee';
export type Building = 'small_indigo_plant' | 'small_sugar_mill' | 'indigo_plant' | 'sugar_mill' | 'tobacco_storage' | 'coffee_roaster' | 'small_warehouse' | 'hacienda' | 'construction_hut' | 'small_market' | 'hospice' | 'office' | 'large_market' | 'large_warehouse' | 'university' | 'factory' | 'harbor' | 'wharf' | 'city_hall' | 'customs_house' | 'fortress' | 'guild_hall' | 'residence';
export type Plantation = 'corn' | 'indigo' | 'sugar' | 'tobacco' | 'coffee' | 'quarry';
export interface Player {
    id: string;
    name: string;
    socketId: string;
    color: string;
    doubloons: number;
    colonists: number;
    colonistsOnBoard: number;
    victoryPoints: number;
    plantations: Plantation[];
    buildings: {
        building: Building;
        colonists: number;
    }[];
    resources: Record<Resource, number>;
    shippedGoods: {
        resource: Resource;
        amount: number;
    }[];
}
export interface Room {
    id: string;
    players: Player[];
    gameState: GameState | null;
    maxPlayers: number;
    isGameStarted: boolean;
}
export type GamePhase = 'waiting' | 'role_selection' | 'settler' | 'mayor' | 'builder' | 'craftsman' | 'trader' | 'captain' | 'game_over';
export interface RoleState {
    available: Role[];
    taken: {
        playerId: string;
        role: Role;
    }[];
    currentRole: Role | null;
    bonusDoubloons: Record<Role, number>;
}
export interface GameState {
    phase: GamePhase;
    currentPlayer: string;
    governor: string;
    turn: number;
    round: number;
    roleState: RoleState;
    colonistsOnShip: number;
    colonistsInSupply: number;
    colonistsOnColony: number;
    resources: Record<Resource, number>;
    plantationsMarket: Plantation[];
    buildingsAvailable: Record<Building, number>;
    tradingHouse: Resource[];
    ships: {
        capacity: number;
        cargo: Resource | null;
        amount: number;
    }[];
    victoryPointSupply: number;
    lastTurn: boolean;
}
export interface GameAction {
    type: string;
    playerId: string;
    data: unknown;
}
export interface ServerToClientEvents {
    gameStateUpdate: (state: GameState) => void;
    roomJoined: (room: Room) => void;
    playerJoined: (player: Player) => void;
    playerLeft: (playerId: string) => void;
    gameStarted: (state: GameState) => void;
    roleSelected: (data: {
        playerId: string;
        role: Role;
    }) => void;
    actionPerformed: (data: {
        playerId: string;
        action: GameAction;
    }) => void;
    error: (message: string) => void;
}
export interface ClientToServerEvents {
    createRoom: (roomId: string, playerName: string) => void;
    joinRoom: (roomId: string, playerName: string) => void;
    startGame: (roomId: string) => void;
    selectRole: (roomId: string, roleType: Role) => void;
    performAction: (roomId: string, action: GameAction) => void;
    disconnect: () => void;
}
export interface InterServerEvents {
    ping: () => void;
}
export interface SocketData {
    playerId: string;
    roomId: string;
}
//# sourceMappingURL=index.d.ts.map