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
    // h-screen + flex-col creates a fixed viewport layout — no page scroll,
    // only the main content area scrolls. This ensures header, opponent bar,
    // and resource bar are always visible.
    <div className="h-screen flex flex-col overflow-hidden bg-ocean-pattern">

      {/* ── Fixed header strip ── */}
      <GameHeader />

      {/* ── AI opponent bar ── */}
      <AIOpponentBar />

      {/* ── Scrollable main content + Log drawer live here ──
           min-h-0 is required: without it, flex children ignore overflow
           and the inner overflow-y-auto won't scroll.                      */}
      <div className="flex-1 relative min-h-0 overflow-hidden">

        {/* Scrollable area */}
        <div className="h-full overflow-y-auto">
          <div className="max-w-screen-xl mx-auto px-3 py-3">
            {/*
              md: two columns — player island (left 40%) | action panel (right 60%)
              Below md: single column, action panel first for faster access
            */}
            <div className="flex flex-col-reverse md:grid md:grid-cols-[2fr_3fr] gap-4 items-start">
              {/* Left: player's island board */}
              <PlayerIsland />
              {/* Right: current phase action panel */}
              <ActionPanel />
            </div>
          </div>
        </div>

        {/* Log drawer — absolute so it overlays ONLY the content area,
            never the header, opponent bar, or resource bar.               */}
        <GameLog isOpen={logOpen} onClose={() => setLogOpen(false)} />
      </div>

      {/* ── Resource bar — part of the flex column, not fixed ── */}
      <ResourceBar onToggleLog={() => setLogOpen(!logOpen)} />

      {/* ── Game Over overlay ── */}
      {gameOverScores && <GameOverScreen />}
    </div>
  );
}
