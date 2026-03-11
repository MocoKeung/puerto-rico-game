// Input validation schemas using Zod
import { z } from 'zod';
import { Role, Resource, Plantation, Building, GameAction } from '../types/index.js';

// Common validators
const PlayerNameSchema = z.string()
  .min(1, 'Player name is required')
  .max(20, 'Player name too long (max 20 characters)')
  .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Player name contains invalid characters');

const RoomIdSchema = z.string()
  .min(1, 'Room ID is required')
  .max(32, 'Room ID too long')
  .regex(/^[a-zA-Z0-9_\-]+$/, 'Room ID must be alphanumeric with underscores or hyphens');

const PasswordSchema = z.string()
  .min(0)
  .max(32, 'Password too long')
  .optional();

// Room events validation
export const CreateRoomSchema = z.object({
  roomId: RoomIdSchema,
  playerName: PlayerNameSchema,
  password: PasswordSchema,
});

export const JoinRoomSchema = z.object({
  roomId: RoomIdSchema,
  playerName: PlayerNameSchema,
  password: PasswordSchema,
});

// Game action validation
const RoleSchema: z.ZodType<Role> = z.enum([
  'colonist', 'captain', 'builder', 'craftsman', 'mayor', 'prospector', 'settler'
]);

const ResourceSchema: z.ZodType<Resource> = z.enum([
  'corn', 'indigo', 'sugar', 'tobacco', 'coffee'
]);

const PlantationSchema: z.ZodType<Plantation> = z.enum([
  'corn', 'indigo', 'sugar', 'tobacco', 'coffee', 'quarry'
]);

const BuildingSchema: z.ZodType<Building> = z.enum([
  'small_indigo_plant', 'small_sugar_mill', 'indigo_plant', 'sugar_mill',
  'tobacco_storage', 'coffee_roaster', 'small_warehouse', 'hacienda',
  'construction_hut', 'small_market', 'hospice', 'office', 'large_market',
  'large_warehouse', 'university', 'factory', 'harbor', 'wharf',
  'city_hall', 'customs_house', 'fortress', 'guild_hall', 'residence'
]);

export const SelectRoleSchema = z.object({
  role: RoleSchema,
});

export const GameActionSchema = z.object({
  type: z.enum(['build', 'produce', 'trade', 'ship', 'takePlantation', 'distributeColonists']),
  data: z.any().optional(),
});

// Validation for specific action types
export const BuildActionSchema = z.object({
  type: z.literal('build'),
  data: BuildingSchema,
});

export const TradeActionSchema = z.object({
  type: z.literal('trade'),
  data: ResourceSchema,
});

export const ShipActionSchema = z.object({
  type: z.literal('ship'),
  data: z.object({
    resource: ResourceSchema,
    shipIndex: z.number().int().min(0).max(2),
  }),
});

export const TakePlantationActionSchema = z.object({
  type: z.literal('takePlantation'),
  data: PlantationSchema,
});

export const DistributeColonistsActionSchema = z.object({
  type: z.literal('distributeColonists'),
  data: z.record(z.string(), z.number().int().min(0)),
});

// Sanitization helpers
export function sanitizePlayerName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 20);
}

export function sanitizeRoomId(id: string): string {
  return id
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\-]/g, '')
    .slice(0, 32);
}

// Validation error formatter
export function formatValidationError(error: z.ZodError): string {
  return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
}
