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

  useEffect(() => {
    if (!started) navigate('/local');
  }, [started, navigate]);

  const runAI = useCallback(() => {
    const currentState = useGameEngine.getState();
    if (currentState.phase === 'game_over') return;
    if (currentState.waitingForHuman) return;
    const seat = currentState.activePlayerSeat;
    const player = currentState.players[seat];
    if (player?.isHuman) return;
    executeAITurn(currentState, seat, {
      selectRole, settlerTakePlantation, builderBuyBuilding, builderPass,
      captainShipGoods, captainUseWharf, captainPass,
      traderSellGood, traderPass, craftsmanBonusGood,
    });
  }, [selectRole, settlerTakePlantation, builderBuyBuilding, builderPass,
      captainShipGoods, captainUseWharf, captainPass, traderSellGood, traderPass, craftsmanBonusGood]);

  useEffect(() => {
    if (phase === 'game_over') return;
    if (waitingForHuman) return;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(runAI, AI_TURN_DELAY);
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [phase, activePlayerSeat, waitingForHuman, runAI]);

  if (!started) return null;

  return (
    <div className="min-h-screen bg-ocean-pattern pb-20 flex flex-col">
      {/* Header */}
      <GameHeader />

      {/* AI Opponent Bar */}
      <AIOpponentBar />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* Left: Your Island */}
          <div className="lg:col-span-5">
            <PlayerIsland />
          </div>

          {/* Right: Action Panel */}
          <div className="lg:col-span-7">
            {/* Parchment container */}
            <div className="bg-parchment rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden border border-[#c9870c]/30">
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-transparent via-[#c9870c] to-transparent" />
              <div className="p-5">
                <ActionPanel />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Resource Bar */}
      <ResourceBar onToggleLog={() => setLogOpen(!logOpen)} />

      {/* Log Drawer */}
      <GameLog isOpen={logOpen} onClose={() => setLogOpen(false)} />

      {/* Game Over */}
      {gameOverScores && <GameOverScreen />}
    </div>
  );
}
