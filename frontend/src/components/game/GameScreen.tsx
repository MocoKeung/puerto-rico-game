import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameEngine from '../../store/gameEngine';
import { executeAITurn, AI_TURN_DELAY } from '../../ai/aiPlayer';
import GameHeader from './GameHeader';
import AIOpponentBar from './AIOpponentBar';
import PlayerIsland from './PlayerIsland';
import ActionPanel from './ActionPanel';
import ResourceBar from './ResourceBar';
import GameLog from './GameLog';
import GameOverScreen from './GameOverScreen';

export default function GameScreen() {
  const navigate = useNavigate();
  const [logOpen, setLogOpen] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const state = useGameEngine();
  const {
    started, phase, activePlayerSeat, waitingForHuman, players,
    selectRole, settlerTakePlantation, builderBuyBuilding, builderPass,
    captainShipGoods, captainUseWharf, captainPass,
    traderSellGood, traderPass, craftsmanBonusGood,
    gameOverScores,
  } = state;

  // Redirect if game not started
  useEffect(() => {
    if (!started) {
      navigate('/local');
    }
  }, [started, navigate]);

  // AI auto-play loop
  const runAI = useCallback(() => {
    const currentState = useGameEngine.getState();
    if (currentState.phase === 'game_over') return;
    if (currentState.waitingForHuman) return;

    const seat = currentState.activePlayerSeat;
    const player = currentState.players[seat];
    if (player?.isHuman) return;

    executeAITurn(currentState, seat, {
      selectRole,
      settlerTakePlantation,
      builderBuyBuilding,
      builderPass,
      captainShipGoods,
      captainUseWharf,
      captainPass,
      traderSellGood,
      traderPass,
      craftsmanBonusGood,
    });
  }, [selectRole, settlerTakePlantation, builderBuyBuilding, builderPass,
      captainShipGoods, captainUseWharf, captainPass, traderSellGood, traderPass, craftsmanBonusGood]);

  useEffect(() => {
    if (phase === 'game_over') return;
    if (waitingForHuman) return;

    // Schedule AI turn
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(runAI, AI_TURN_DELAY);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [phase, activePlayerSeat, waitingForHuman, runAI]);

  if (!started) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-950 via-sky-900 to-cyan-900 pb-20">
      {/* Header */}
      <GameHeader />

      {/* AI Opponent Bar */}
      <AIOpponentBar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Your Island */}
          <div className="lg:col-span-5">
            <PlayerIsland />
          </div>

          {/* Right: Action Panel */}
          <div className="lg:col-span-7">
            <ActionPanel />
          </div>
        </div>
      </div>

      {/* Resource Bar (fixed bottom) */}
      <ResourceBar onToggleLog={() => setLogOpen(!logOpen)} />

      {/* Game Log Drawer */}
      <GameLog isOpen={logOpen} onClose={() => setLogOpen(false)} />

      {/* Game Over Overlay */}
      {gameOverScores && <GameOverScreen />}
    </div>
  );
}
