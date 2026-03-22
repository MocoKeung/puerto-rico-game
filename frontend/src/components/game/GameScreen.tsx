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
import TurnSummaryToast from './TurnSummaryToast';
import { ErrorBoundary } from '../ErrorBoundary';

export default function GameScreen() {
  const navigate = useNavigate();
  const [logOpen, setLogOpen] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const state = useGameEngine();
  const {
    started, phase, activePlayerSeat, waitingForHuman, players,
    lastAction,
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
  // lastAction is included so the effect re-fires when an AI ships multiple times in the
  // same turn (waitingForHuman stays false but lastAction changes, un-sticking the AI).
  }, [phase, activePlayerSeat, waitingForHuman, lastAction, runAI]);

  if (!started) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-ocean-pattern">

      {/* Header — fixed height strip */}
      <GameHeader />

      {/* AI opponent bar — full-width grid of cards */}
      <AIOpponentBar />

      {/* Main content area — scrollable, relative for log drawer */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-screen-xl mx-auto px-4 py-4">
            {/*
              Two-column layout:
                Left  (5/12): PlayerIsland — your personal board
                Right (7/12): ActionPanel  — current phase / role actions

              Use explicit col-span classes (more reliable than arbitrary values)
              in an always-on 12-column grid. On small screens (<md) the panel
              collapses to single column with action panel on top.
            */}
            <div className="grid grid-cols-12 gap-4 items-start">
              {/* Player island — left column */}
              <div className="col-span-12 md:col-span-5 order-2 md:order-1">
                <PlayerIsland />
              </div>
              {/* Action panel — right column, shown first on mobile */}
              <div className="col-span-12 md:col-span-7 order-1 md:order-2">
                <ErrorBoundary>
                  <ActionPanel />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>

        {/* Log drawer — absolute within content area, no header/footer overlap */}
        <GameLog isOpen={logOpen} onClose={() => setLogOpen(false)} />
      </div>

      {/* Resource bar — part of the flex column, no fixed/z-index fights */}
      <ResourceBar onToggleLog={() => setLogOpen(!logOpen)} />

      {gameOverScores && <GameOverScreen />}

      {/* Turn summary toast — shows what opponents did on their last turn */}
      <TurnSummaryToast onOpenLog={() => setLogOpen(true)} />

    </div>
  );
}
