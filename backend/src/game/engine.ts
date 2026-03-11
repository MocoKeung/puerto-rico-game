// Puerto Rico game state machine
import {
  Room,
  Player,
  GameState,
  GamePhase,
  RoleState,
  Role,
  Resource,
  Plantation,
  Building,
  GameAction
} from '../types/index.js';
import {
  INITIAL_RESOURCES,
  STARTING_RESOURCES,
  SHIP_CAPACITIES,
  ALL_ROLES,
  getInitialRoleState,
  getInitialPlantationMarket,
  getInitialBuildings,
  PLAYER_COLORS
} from './rules.js';
import { logger } from '../utils/logger.js';

export class GameEngine {
  private room: Room;

  constructor(room: Room) {
    this.room = room;
  }

  initializeGame(): GameState | null {
    const playerCount = this.room.players.length;
    if (playerCount < 2 || playerCount > 5) {
      logger.error('Invalid player count:', playerCount);
      return null;
    }

    const startConfig = STARTING_RESOURCES[playerCount];

    // Initialize players with starting resources
    this.room.players.forEach((player, index) => {
      player.doubloons = startConfig.doubloons;
      player.colonists = 0;
      player.colonistsOnBoard = 1;
      player.victoryPoints = 0;
      player.plantations = startConfig.plantations[index] ? [startConfig.plantations[index] as Plantation] : [];
      player.buildings = [];
      player.resources = {
        corn: startConfig.corn,
        indigo: startConfig.indigo,
        sugar: 0,
        tobacco: 0,
        coffee: 0
      };
      player.shippedGoods = [];
      player.color = PLAYER_COLORS[index];
    });

    const governorIndex = Math.floor(Math.random() * playerCount);
    const governor = this.room.players[governorIndex].id;

    const gameState: GameState = {
      phase: 'role_selection',
      currentPlayer: this.room.players[0].id,
      governor,
      turn: 1,
      round: 1,
      roleState: getInitialRoleState(playerCount),
      colonistsOnShip: playerCount + 1,
      colonistsInSupply: playerCount === 2 ? 40 : playerCount === 3 ? 55 : playerCount === 4 ? 75 : 95,
      colonistsOnColony: 0,
      resources: { ...INITIAL_RESOURCES },
      plantationsMarket: getInitialPlantationMarket(),
      buildingsAvailable: getInitialBuildings(),
      tradingHouse: [],
      ships: SHIP_CAPACITIES[playerCount].map(capacity => ({
        capacity,
        cargo: null,
        amount: 0
      })),
      victoryPointSupply: playerCount === 2 ? 65 : playerCount === 3 ? 75 : 100,
      lastTurn: false
    };

    this.room.gameState = gameState;
    this.room.isGameStarted = true;

    logger.info(`Game initialized in room ${this.room.id} with ${playerCount} players`);
    return gameState;
  }

  getState(): GameState | null {
    return this.room.gameState;
  }

  selectRole(playerId: string, role: Role): boolean {
    const state = this.room.gameState;
    if (!state) return false;

    if (state.phase !== 'role_selection') {
      logger.error('Not in role selection phase');
      return false;
    }

    const roleState = state.roleState;
    if (!roleState.available.includes(role)) {
      logger.error(`Role ${role} not available`);
      return false;
    }

    roleState.available = roleState.available.filter(r => r !== role);
    roleState.taken.push({ playerId, role });

    const bonus = roleState.bonusDoubloons[role] || 0;
    const player = this.room.players.find(p => p.id === playerId);
    if (player) {
      player.doubloons += bonus;
    }

    roleState.currentRole = role;
    state.phase = this.getPhaseForRole(role);

    logger.info(`Player ${playerId} selected role ${role}`);
    return true;
  }

  private getPhaseForRole(role: Role): GamePhase {
    switch (role) {
      case 'settler':
        return 'settler';
      case 'mayor':
        return 'mayor';
      case 'builder':
        return 'builder';
      case 'craftsman':
        return 'craftsman';
      case 'captain':
        return 'captain';
      default:
        return 'role_selection';
    }
  }

  nextTurn(): void {
    const state = this.room.gameState;
    if (!state) return;

    const currentIndex = this.room.players.findIndex(p => p.id === state.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.room.players.length;
    state.currentPlayer = this.room.players[nextIndex].id;

    if (state.roleState.taken.length >= this.room.players.length) {
      this.endRound();
    } else {
      state.phase = 'role_selection';
    }
  }

  endRound(): void {
    const state = this.room.gameState;
    if (!state) return;

    state.roleState.available.forEach(role => {
      state.roleState.bonusDoubloons[role] = (state.roleState.bonusDoubloons[role] || 0) + 1;
    });

    const playerCount = this.room.players.length;
    state.roleState = getInitialRoleState(playerCount);

    const governorIndex = this.room.players.findIndex(p => p.id === state.governor);
    const nextGovernorIndex = (governorIndex + 1) % this.room.players.length;
    state.governor = this.room.players[nextGovernorIndex].id;
    state.currentPlayer = state.governor;

    state.round++;
    state.phase = 'role_selection';

    logger.info(`Round ended. Starting round ${state.round}`);
  }

  performAction(action: GameAction): boolean {
    const state = this.room.gameState;
    if (!state) return false;

    logger.info(`Performing action: ${action.type}`, action);

    switch (action.type) {
      case 'build':
        return this.handleBuild(action.playerId, action.data as Building);
      case 'produce':
        return this.handleProduce(action.playerId);
      case 'trade':
        return this.handleTrade(action.playerId, action.data as Resource);
      case 'ship':
        return this.handleShip(action.playerId, action.data as { resource: Resource; shipIndex: number });
      case 'takePlantation':
        return this.handleTakePlantation(action.playerId, action.data as Plantation);
      case 'distributeColonists':
        return this.handleDistributeColonists(action.playerId, action.data as Record<string, number>);
      default:
        logger.warn('Unknown action type:', action.type);
        return false;
    }
  }

  private handleBuild(playerId: string, building: Building): boolean {
    logger.info(`Player ${playerId} built ${building}`);
    return true;
  }

  private handleProduce(playerId: string): boolean {
    logger.info(`Player ${playerId} produced goods`);
    return true;
  }

  private handleTrade(playerId: string, resource: Resource): boolean {
    logger.info(`Player ${playerId} traded ${resource}`);
    return true;
  }

  private handleShip(playerId: string, data: { resource: Resource; shipIndex: number }): boolean {
    logger.info(`Player ${playerId} shipped ${data.resource}`);
    return true;
  }

  private handleTakePlantation(playerId: string, plantation: Plantation): boolean {
    const player = this.room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.plantations.push(plantation);
    const state = this.room.gameState;
    if (state) {
      const marketIndex = state.plantationsMarket.indexOf(plantation);
      if (marketIndex > -1) {
        state.plantationsMarket.splice(marketIndex, 1);
      }

      if (state.plantationsMarket.length < 4) {
        const available: Plantation[] = ['corn', 'indigo', 'sugar', 'tobacco', 'coffee'];
        const random = available[Math.floor(Math.random() * available.length)];
        state.plantationsMarket.push(random);
      }
    }

    return true;
  }

  private handleDistributeColonists(playerId: string, distribution: Record<string, number>): boolean {
    logger.info(`Player ${playerId} distributed colonists`, distribution);
    return true;
  }
}
