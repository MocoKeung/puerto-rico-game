import useGameEngine from '../../store/gameEngine';
import { ROLE_LABELS } from '../../data/constants';
import RoleSelectionPanel from './phases/RoleSelectionPanel';
import SettlerPanel from './phases/SettlerPanel';
import BuilderPanel from './phases/BuilderPanel';
import MayorPanel from './phases/MayorPanel';
import CraftsmanPanel from './phases/CraftsmanPanel';
import CaptainPanel from './phases/CaptainPanel';
import TraderPanel from './phases/TraderPanel';
import ProspectorPanel from './phases/ProspectorPanel';

export default function ActionPanel() {
  const { phase, waitingForHuman, activePlayerSeat, players } = useGameEngine();

  const activePlayer = players[activePlayerSeat];
  // AI is currently taking its turn — human is watching
  const isAIThinking = !waitingForHuman && phase !== 'game_over' && !activePlayer?.isHuman;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] border"
      style={{ background: 'rgba(245,230,200,0.97)', borderColor: 'rgba(201,135,12,0.3)' }}
    >
      {/* Accent line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#c9870c] to-transparent" />

      <div className="p-4 sm:p-5 min-h-[320px]">
        {/* ── AI Thinking Overlay ── */}
        {isAIThinking ? (
          <AIThinkingView player={activePlayer} phase={phase} />
        ) : (
          <>
            {phase === 'role_selection' && <RoleSelectionPanel />}
            {phase === 'settler'        && <SettlerPanel />}
            {phase === 'builder'        && <BuilderPanel />}
            {phase === 'mayor'          && <MayorPanel />}
            {phase === 'craftsman'      && <CraftsmanPanel />}
            {phase === 'captain'        && <CaptainPanel />}
            {phase === 'captain_cleanup' && <CaptainPanel />}
            {phase === 'trader'         && <TraderPanel />}
            {phase === 'prospector'     && <ProspectorPanel />}
            {phase === 'game_over' && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="text-5xl">🏆</div>
                <h2 className="font-cinzel font-bold text-[#3d1f0a] text-2xl">Game Over!</h2>
                <p className="font-crimson text-[#5a2e10] italic">See the final scores.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AIThinkingView({
  player,
  phase,
}: {
  player: { name: string; color: string } | undefined;
  phase: string;
}) {
  const phaseLabel = ROLE_LABELS[phase as keyof typeof ROLE_LABELS] ?? phase;

  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] gap-5 select-none">
      {/* Spinner */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: player?.color ?? '#c9870c',
            borderRightColor: (player?.color ?? '#c9870c') + '55',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🤔</span>
        </div>
      </div>

      {/* Who / what */}
      <div className="text-center space-y-1">
        <p className="font-cinzel font-bold text-[#3d1f0a] text-base">
          {player?.name ?? 'Opponent'} is deciding…
        </p>
        <p className="font-crimson text-[#5a2e10]/60 text-sm italic">
          Phase: {phaseLabel}
        </p>
      </div>

      {/* Dots animation */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: player?.color ?? '#c9870c',
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}
