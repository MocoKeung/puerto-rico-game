import { Room, Player } from '../types/index.js';
declare class RoomManager {
    private rooms;
    createRoom(roomId: string, maxPlayers?: number): Room;
    getRoom(roomId: string): Room | undefined;
    deleteRoom(roomId: string): boolean;
    addPlayer(roomId: string, player: Player): boolean;
    removePlayer(roomId: string, socketId: string): Player | null;
    getAllRooms(): Room[];
    roomExists(roomId: string): boolean;
}
export declare const roomManager: RoomManager;
export {};
//# sourceMappingURL=roomManager.d.ts.map