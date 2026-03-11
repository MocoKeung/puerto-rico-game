import { Room, GameState, Role, GameAction } from '../types/index.js';
export declare class GameEngine {
    private room;
    constructor(room: Room);
    initializeGame(): GameState | null;
    getState(): GameState | null;
    selectRole(playerId: string, role: Role): boolean;
    private getPhaseForRole;
    nextTurn(): void;
    endRound(): void;
    performAction(action: GameAction): boolean;
    private handleBuild;
    private handleProduce;
    private handleTrade;
    private handleShip;
    private handleTakePlantation;
    private handleDistributeColonists;
}
//# sourceMappingURL=engine.d.ts.map