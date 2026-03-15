"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributeColonistsActionSchema = exports.TakePlantationActionSchema = exports.ShipActionSchema = exports.TradeActionSchema = exports.BuildActionSchema = exports.GameActionSchema = exports.SelectRoleSchema = exports.JoinRoomSchema = exports.CreateRoomSchema = void 0;
exports.sanitizePlayerName = sanitizePlayerName;
exports.sanitizeRoomId = sanitizeRoomId;
exports.formatValidationError = formatValidationError;
// Input validation schemas using Zod
const zod_1 = require("zod");
// Common validators
const PlayerNameSchema = zod_1.z.string()
    .min(1, 'Player name is required')
    .max(20, 'Player name too long (max 20 characters)')
    .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Player name contains invalid characters');
const RoomIdSchema = zod_1.z.string()
    .min(1, 'Room ID is required')
    .max(32, 'Room ID too long')
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Room ID must be alphanumeric with underscores or hyphens');
const PasswordSchema = zod_1.z.string()
    .min(0)
    .max(32, 'Password too long')
    .optional();
// Room events validation
exports.CreateRoomSchema = zod_1.z.object({
    roomId: RoomIdSchema,
    playerName: PlayerNameSchema,
    password: PasswordSchema,
});
exports.JoinRoomSchema = zod_1.z.object({
    roomId: RoomIdSchema,
    playerName: PlayerNameSchema,
    password: PasswordSchema,
});
// Game action validation
const RoleSchema = zod_1.z.enum([
    'colonist', 'captain', 'builder', 'craftsman', 'mayor', 'prospector', 'settler'
]);
const ResourceSchema = zod_1.z.enum([
    'corn', 'indigo', 'sugar', 'tobacco', 'coffee'
]);
const PlantationSchema = zod_1.z.enum([
    'corn', 'indigo', 'sugar', 'tobacco', 'coffee', 'quarry'
]);
const BuildingSchema = zod_1.z.enum([
    'small_indigo_plant', 'small_sugar_mill', 'indigo_plant', 'sugar_mill',
    'tobacco_storage', 'coffee_roaster', 'small_warehouse', 'hacienda',
    'construction_hut', 'small_market', 'hospice', 'office', 'large_market',
    'large_warehouse', 'university', 'factory', 'harbor', 'wharf',
    'city_hall', 'customs_house', 'fortress', 'guild_hall', 'residence'
]);
exports.SelectRoleSchema = zod_1.z.object({
    role: RoleSchema,
});
exports.GameActionSchema = zod_1.z.object({
    type: zod_1.z.enum(['build', 'produce', 'trade', 'ship', 'takePlantation', 'distributeColonists']),
    data: zod_1.z.any().optional(),
});
// Validation for specific action types
exports.BuildActionSchema = zod_1.z.object({
    type: zod_1.z.literal('build'),
    data: BuildingSchema,
});
exports.TradeActionSchema = zod_1.z.object({
    type: zod_1.z.literal('trade'),
    data: ResourceSchema,
});
exports.ShipActionSchema = zod_1.z.object({
    type: zod_1.z.literal('ship'),
    data: zod_1.z.object({
        resource: ResourceSchema,
        shipIndex: zod_1.z.number().int().min(0).max(2),
    }),
});
exports.TakePlantationActionSchema = zod_1.z.object({
    type: zod_1.z.literal('takePlantation'),
    data: PlantationSchema,
});
exports.DistributeColonistsActionSchema = zod_1.z.object({
    type: zod_1.z.literal('distributeColonists'),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.number().int().min(0)),
});
// Sanitization helpers
function sanitizePlayerName(name) {
    return name
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 20);
}
function sanitizeRoomId(id) {
    return id
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_\-]/g, '')
        .slice(0, 32);
}
// Validation error formatter
function formatValidationError(error) {
    return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
}
//# sourceMappingURL=validation.js.map