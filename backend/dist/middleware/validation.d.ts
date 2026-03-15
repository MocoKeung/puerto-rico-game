import { z } from 'zod';
import { Role, Resource, Plantation, Building } from '../types/index.js';
export declare const CreateRoomSchema: z.ZodObject<{
    roomId: z.ZodString;
    playerName: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const JoinRoomSchema: z.ZodObject<{
    roomId: z.ZodString;
    playerName: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const SelectRoleSchema: z.ZodObject<{
    role: z.ZodType<Role, unknown, z.core.$ZodTypeInternals<Role, unknown>>;
}, z.core.$strip>;
export declare const GameActionSchema: z.ZodObject<{
    type: z.ZodEnum<{
        build: "build";
        produce: "produce";
        trade: "trade";
        ship: "ship";
        takePlantation: "takePlantation";
        distributeColonists: "distributeColonists";
    }>;
    data: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const BuildActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"build">;
    data: z.ZodType<Building, unknown, z.core.$ZodTypeInternals<Building, unknown>>;
}, z.core.$strip>;
export declare const TradeActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"trade">;
    data: z.ZodType<Resource, unknown, z.core.$ZodTypeInternals<Resource, unknown>>;
}, z.core.$strip>;
export declare const ShipActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"ship">;
    data: z.ZodObject<{
        resource: z.ZodType<Resource, unknown, z.core.$ZodTypeInternals<Resource, unknown>>;
        shipIndex: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const TakePlantationActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"takePlantation">;
    data: z.ZodType<Plantation, unknown, z.core.$ZodTypeInternals<Plantation, unknown>>;
}, z.core.$strip>;
export declare const DistributeColonistsActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"distributeColonists">;
    data: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, z.core.$strip>;
export declare function sanitizePlayerName(name: string): string;
export declare function sanitizeRoomId(id: string): string;
export declare function formatValidationError(error: z.ZodError): string;
//# sourceMappingURL=validation.d.ts.map