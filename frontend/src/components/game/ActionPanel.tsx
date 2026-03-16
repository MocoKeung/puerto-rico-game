import useGameEngine from '../../store/gameEngine';
import RoleSelectionPanel from './phases/RoleSelectionPanel';
import SettlerPanel from './phases/SettlerPanel';
import BuilderPanel from './phases/BuilderPanel';
import MayorPanel from './phases/MayorPanel';
import CraftsmanPanel from './phases/CraftsmanPanel';
import CaptainPanel from './phases/CaptainPanel';
import TraderPanel from './phases/TraderPanel';
import ProspectorPanel from './phases/ProspectorPanel';

export default function ActionPanel() {
  const phase = useGameEngine(s => s.phase);

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] border"
      style={{ background: 'rgba(245,230,200,0.97)', borderColor: 'rgba(201,135,12,0.3)' }}
    >
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#c9870c] to-transparent" />

      <div className="p-4 sm:p-5 min-h-[280px]">
        {phase === 'role_selection' && <RoleSelectionPanel />}
        {phase === 'settler'       && <SettlerPanel />}
        {phase === 'builder'       && <BuilderPanel />}
        {phase === 'mayor'         && <MayorPanel />}
        {phase === 'craftsman'     && <CraftsmanPanel />}
        {phase === 'captain'       && <CaptainPanel />}
        {phase === 'trader'        && <TraderPanel />}
        {phase === 'prospector'    && <ProspectorPanel />}
        {phase === 'game_over' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-amber-900">Game Over!</h2>
            <p className="text-amber-600">See the final scores below.</p>
          </div>
        )}
      </div>
    </div>
  );
}
