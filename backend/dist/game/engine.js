"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const rules_js_1 = require("./rules.js");
const logger_js_1 = require("../utils/logger.js");
class GameEngine {
    room;
    constructor(room) {
        this.room = room;
    }
    initializeGame() {
        const playerCount = this.room.players.length;
        if (playerCount < 2 || playerCount > 5) {
            logger_js_1.logger.error('Invalid player count:', playerCount);
            return null;
        }
        const startConfig = rules_js_1.STARTING_RESOURCES[playerCount];
        // Initialize players with starting resources
        this.room.players.forEach((player, index) => {
            player.doubloons = startConfig.doubloons;
            player.colonists = 0;
            player.colonistsOnBoard = 1;
            player.victoryPoints = 0;
            player.plantations = startConfig.plantations[index] ? [startConfig.plantations[index]] : [];
            player.buildings = [];
            player.resources = {
                corn: startConfig.corn,
                indigo: startConfig.indigo,
                sugar: 0,
                tobacco: 0,
                coffee: 0
            };
            player.shippedGoods = [];
            player.color = rules_js_1.PLAYER_COLORS[index];
        });
        const governorIndex = Math.floor(Math.random() * playerCount);
        const governor = this.room.players[governorIndex].id;
        const gameState = {
            phase: 'role_selection',
            currentPlayer: this.room.players[0].id,
            governor,
            turn: 1,
            round: 1,
            roleState: (0, rules_js_1.getInitialRoleState)(playerCount),
            colonistsOnShip: playerCount + 1,
            colonistsInSupply: playerCount === 2 ? 40 : playerCount === 3 ? 55 : playerCount === 4 ? 75 : 95,
            colonistsOnColony: 0,
            resources: { ...rules_js_1.INITIAL_RESOURCES },
            plantationsMarket: (0, rules_js_1.getInitialPlantationMarket)(),
            buildingsAvailable: (0, rules_js_1.getInitialBuildings)(),
            tradingHouse: [],
            ships: rules_js_1.SHIP_CAPACITIES[playerCount].map(capacity => ({
                capacity,
                cargo: null,
                amount: 0
            })),
            victoryPointSupply: playerCount === 2 ? 65 : playerCount === 3 ? 75 : 100,
            lastTurn: false
        };
        this.room.gameState = gameState;
        this.room.isGameStarted = true;
        logger_js_1.logger.info(`Game initialized in room ${this.room.id} with ${playerCount} players`);
        return gameState;
    }
    getState() {
        return this.room.gameState;
    }
    selectRole(playerId, role) {
        const state = this.room.gameState;
        if (!state)
            return false;
        if (state.phase !== 'role_selection') {
            logger_js_1.logger.error('Not in role selection phase');
            return false;
        }
        const roleState = state.roleState;
        if (!roleState.available.includes(role)) {
            logger_js_1.logger.error(`Role ${role} not available`);
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
        logger_js_1.logger.info(`Player ${playerId} selected role ${role}`);
        return true;
    }
    getPhaseForRole(role) {
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
    nextTurn() {
        const state = this.room.gameState;
        if (!state)
            return;
        const currentIndex = this.room.players.findIndex(p => p.id === state.currentPlayer);
        const nextIndex = (currentIndex + 1) % this.room.players.length;
        state.currentPlayer = this.room.players[nextIndex].id;
        if (state.roleState.taken.length >= this.room.players.length) {
            this.endRound();
        }
        else {
            state.phase = 'role_selection';
        }
    }
    endRound() {
        const state = this.room.gameState;
        if (!state)
            return;
        state.roleState.available.forEach(role => {
            state.roleState.bonusDoubloons[role] = (state.roleState.bonusDoubloons[role] || 0) + 1;
        });
        const playerCount = this.room.players.length;
        state.roleState = (0, rules_js_1.getInitialRoleState)(playerCount);
        const governorIndex = this.room.players.findIndex(p => p.id === state.governor);
        const nextGovernorIndex = (governorIndex + 1) % this.room.players.length;
        state.governor = this.room.players[nextGovernorIndex].id;
        state.currentPlayer = state.governor;
        state.round++;
        state.phase = 'role_selection';
        logger_js_1.logger.info(`Round ended. Starting round ${state.round}`);
    }
    performAction(action) {
        const state = this.room.gameState;
        if (!state)
            return false;
        logger_js_1.logger.info(`Performing action: ${action.type}`, action);
        switch (action.type) {
            case 'build':
                return this.handleBuild(action.playerId, action.data);
            case 'produce':
                return this.handleProduce(action.playerId);
            case 'trade':
                return this.handleTrade(action.playerId, action.data);
            case 'ship':
                return this.handleShip(action.playerId, action.data);
            case 'takePlantation':
                return this.handleTakePlantation(action.playerId, action.data);
            case 'distributeColonists':
                return this.handleDistributeColonists(action.playerId, action.data);
            default:
                logger_js_1.logger.warn('Unknown action type:', action.type);
                return false;
        }
    }
    handleBuild(playerId, building) {
        logger_js_1.logger.info(`Player ${playerId} built ${building}`);
        return true;
    }
    handleProduce(playerId) {
        logger_js_1.logger.info(`Player ${playerId} produced goods`);
        return true;
    }
    handleTrade(playerId, resource) {
        logger_js_1.logger.info(`Player ${playerId} traded ${resource}`);
        return true;
    }
    handleShip(playerId, data) {
        logger_js_1.logger.info(`Player ${playerId} shipped ${data.resource}`);
        return true;
    }
    handleTakePlantation(playerId, plantation) {
        const player = this.room.players.find(p => p.id === playerId);
        if (!player)
            return false;
        player.plantations.push(plantation);
        const state = this.room.gameState;
        if (state) {
            const marketIndex = state.plantationsMarket.indexOf(plantation);
            if (marketIndex > -1) {
                state.plantationsMarket.splice(marketIndex, 1);
            }
            if (state.plantationsMarket.length < 4) {
                const available = ['corn', 'indigo', 'sugar', 'tobacco', 'coffee'];
                const random = available[Math.floor(Math.random() * available.length)];
                state.plantationsMarket.push(random);
            }
        }
        return true;
    }
    handleDistributeColonists(playerId, distribution) {
        logger_js_1.logger.info(`Player ${playerId} distributed colonists`, distribution);
        return true;
    }
}
exports.GameEngine = GameEngine;
//# sourceMappingURL=engine.js.map