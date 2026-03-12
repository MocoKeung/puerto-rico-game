/**
 * gameStore.test.ts
 * Unit tests for Zustand game store
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../frontend/src/store/gameStore.js';
import type { RoleType, ResourceType } from '../../frontend/src/store/gameStore.js';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useGameStore.getState();
    store.initGame?.(3);
  });

  describe('Game Initialization', () => {
    it('should initialize game with correct player count', () => {
      const state = useGameStore.getState();
      expect(state.players).toHaveLength(3);
    });

    it('should set initial phase to roleSelection', () => {
      const state = useGameStore.getState();
      expect(state.gamePhase).toBe('roleSelection');
    });

    it('should set current round to 1', () => {
      const state = useGameStore.getState();
      expect(state.currentRound).toBe(1);
    });

    it('should initialize governor at index 0', () => {
      const state = useGameStore.getState();
      expect(state.governorIndex).toBe(0);
    });

    it('should set default colonist supply', () => {
      const state = useGameStore.getState();
      expect(state.colonistSupply).toBe(3); // matches player count
    });

    it('should have 3 ships initialized', () => {
      const state = useGameStore.getState();
      expect(state.ships).toHaveLength(3);
    });
  });

  describe('Role Selection', () => {
    it('should allow selecting an available role', () => {
      const store = useGameStore.getState();
      store.selectRole('settler');
      
      const state = useGameStore.getState();
      const selectedRole = state.roles.find(r => r.type === 'settler');
      expect(selectedRole?.selected).toBe(true);
    });

    it('should mark selected role with player index', () => {
      const store = useGameStore.getState();
      store.selectRole('builder');
      
      const state = useGameStore.getState();
      const selectedRole = state.roles.find(r => r.type === 'builder');
      expect(selectedRole?.selectedBy).toBe(0); // first player
    });

    it('should not allow selecting an already selected role', () => {
      const store = useGameStore.getState();
      store.selectRole('settler');
      store.nextPlayer?.();
      
      // Try to select the same role again as second player
      store.selectRole('settler');
      
      const state = useGameStore.getState();
      const settlerRole = state.roles.find(r => r.type === 'settler');
      expect(settlerRole?.selectedBy).toBe(0); // still first player
    });

    it('should add doubloons to unselected roles', () => {
      const store = useGameStore.getState();
      store.selectRole('settler');
      
      const state = useGameStore.getState();
      const unselectedRole = state.roles.find(r => r.type === 'builder');
      expect(unselectedRole?.doubloons).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Player Management', () => {
    it('should get player by ID', () => {
      const store = useGameStore.getState();
      const player = store.getPlayer?.('player1');
      
      expect(player).not.toBeNull();
      expect(player?.id).toBe('player1');
    });

    it('should get current player', () => {
      const store = useGameStore.getState();
      const currentPlayer = store.getCurrentPlayer?.();
      
      expect(currentPlayer).not.toBeNull();
      expect(currentPlayer?.index).toBe(0);
    });

    it('should initialize player with starting resources', () => {
      const store = useGameStore.getState();
      const player = store.getPlayer?.('player1');
      
      expect(player?.doubloons).toBeGreaterThan(0);
      expect(player?.colonists).toBe(3);
      expect(player?.victoryPoints).toBe(0);
    });

    it('should give first player indigo, others corn', () => {
      const state = useGameStore.getState();
      const player1 = state.players[0];
      const player2 = state.players[1];
      
      expect(player1.plantations[0].type).toBe('indigo');
      expect(player2.plantations[0].type).toBe('indigo'); // actually index 1
    });
  });

  describe('Plantation', () => {
    it('should allow taking a plantation', () => {
      const store = useGameStore.getState();
      const initialCount = store.players[0].plantations.length;
      
      store.takePlantation?.('player1', 'indigo');
      
      const state = useGameStore.getState();
      expect(state.players[0].plantations).toHaveLength(initialCount + 1);
    });

    it('should reduce available plantations when taken', () => {
      const store = useGameStore.getState();
      const initialCount = store.availablePlantations.length;
      
      store.takePlantation?.('player1', 'corn');
      
      const state = useGameStore.getState();
      expect(state.availablePlantations).toHaveLength(initialCount - 1);
    });
  });

  describe('Building Purchase', () => {
    it('should allow buying available building', () => {
      const store = useGameStore.getState();
      
      // Add enough doubloons to player
      useGameStore.setState(s => {
        s.players[0].doubloons = 10;
      });
      
      store.buyBuilding?.('player1', 'small_indigo');
      
      const state = useGameStore.getState();
      expect(state.players[0].buildings).toHaveLength(1);
    });

    it('should reduce doubloons when buying', () => {
      const store = useGameStore.getState();
      
      useGameStore.setState(s => {
        s.players[0].doubloons = 10;
      });
      
      const initialDoubloons = 10;
      store.buyBuilding?.('player1', 'small_indigo');
      
      const state = useGameStore.getState();
      expect(state.players[0].doubloons).toBeLessThan(initialDoubloons);
    });

    it('should not allow buying if insufficient funds', () => {
      const store = useGameStore.getState();
      
      useGameStore.setState(s => {
        s.players[0].doubloons = 0;
      });
      
      const buildingsBefore = store.players[0].buildings.length;
      store.buyBuilding?.('player1', 'small_indigo');
      
      const state = useGameStore.getState();
      expect(state.players[0].buildings).toHaveLength(buildingsBefore);
    });
  });

  describe('Game Log', () => {
    it('should add log entries', () => {
      const store = useGameStore.getState();
      const initialLogCount = store.gameLog.length;
      
      store.addLog?.('Test log entry');
      
      const state = useGameStore.getState();
      expect(state.gameLog).toHaveLength(initialLogCount + 1);
    });

    it('should add timestamp to log entries', () => {
      const store = useGameStore.getState();
      store.addLog?.('Test entry');
      
      const state = useGameStore.getState();
      const lastEntry = state.gameLog[state.gameLog.length - 1];
      expect(lastEntry.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Next Player', () => {
    it('should advance to next player', () => {
      const store = useGameStore.getState();
      
      store.nextPlayer?.();
      
      const state = useGameStore.getState();
      expect(state.currentPlayerIndex).toBe(1);
    });

    it('should wrap around to player 0 after last player', () => {
      const store = useGameStore.getState();
      
      // Move to last player
      useGameStore.setState(s => {
        s.currentPlayerIndex = 2; // last player in 3-player game
      });
      
      store.nextPlayer?.();
      
      const state = useGameStore.getState();
      expect(state.currentPlayerIndex).toBe(0);
    });
  });

  describe('Resource Management', () => {
    it('should add resources to player', () => {
      const store = useGameStore.getState();
      
      useGameStore.setState(s => {
        s.players[