import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameEngine from '../../store/gameEngine';
import { useGameContext } from '../../contexts/GameContext';
import { LocalGameProvider } from '../../contexts/GameContext';
import { executeAITurn, AI_TURN_DELAY } from '../../ai/aiPlayer';
import GameHeader from './GameHeader';
import AIOpponentBar from './AIOpponentBar';
import PlayerIsland from './PlayerIsland';
import ActionPanel from './ActionPanel';
import ResourceBar from './ResourceBar';
import GameLog from './GameLog';
import GameOverScreen from './GameOverScreen';
import TurnSummaryToast from './TurnSummaryToast';
import { ErrorBoundary } from '../ErrorBoundary';

/**
 * GameBoard — pure layout component used by both single-player and multiplayer.
 * Reads all state from GameContext.
 */
export function GameBoard() {
  const [logOpen, setLogOpen] = useState(false);
  const { gameOverScores } = useGameContext();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-ocean-pattern">
      <GameHeader />
      <AIOpponentBar />

      <div className="flex-1 relative min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-screen-xl mx-auto px-4 py-4">
            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-12 md:col-span-5 order-2 md:order-1">
                <PlayerIsland />
              </div>
              <div className="col-span-12 md:col-span-7 order-1 md:order-2">
                <ErrorBoundary>
                  <ActionPanel />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
        <GameLog isOpen={logOpen} onClose={() => setLogOpen(false)} />
      </div>

      <ResourceBar onToggleLog={() => setLogOpen(!logOpen)} />
      {gameOverScores && <GameOverScreen />}
      <TurnSummaryToast onOpenLog={() => setLogOpen(true)} />
    </div>
  );
}

/**
 * GameScreen — single-player game screen with AI runner.
 * Wraps GameBoard with LocalGameProvider.
 */
export default function GameScreen() {
  return (
    <LocalGameProvider>
      <GameScreenInner />
    </LocalGameProvider>
  );
}

function GameScreenInner() {
  const navigate = useNavigate();
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    started, phase, activePlayerSeat, waitingForHuman,
    lastAction,
    selectRole, settlerTakePlantation, builderBuyBuilding, builderPass,
    captainShipGoods, captainUseWharf, captainPass,
    traderSellGood, traderPass, craftsmanBonusGood,
  } = useGameContext();

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
  }, [phase, activePlayerSeat, waitingForHuman, lastAction, runAI]);

  if (!started) return null;

  return <GameBoard />;
}
