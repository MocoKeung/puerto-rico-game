import useGameEngine from '../../store/gameEngine';
import { ResourceIcon, DoubloonIcon, VPIcon, ColonistIcon } from '../icons/ResourceIcons';
import { RESOURCE_ORDER, RESOURCE_LABELS } from '../../data/constants';

interface ResourceBarProps {
  onToggleLog: () => void;
}

export default function ResourceBar({ onToggleLog }: ResourceBarProps) {
  const player = useGameEngine(s => s.players[0]);
  const { vpSupply, colonistSupply, colonistShip } = useGameEngine();

  if (!player) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4 flex-wrap">
        {/* Doubloons */}
        <div className="flex items-center gap-1.5 bg-amber-700/50 px-3 py-1.5 rounded-lg">
          <DoubloonIcon size={20} />
          <span className="font-bold text-lg text-amber-100">{player.doubloons}</span>
          <span className="text-[10px] text-amber-400 uppercase">coins</span>
        </div>

        {/* VP */}
        <div className="flex items-center gap-1.5 bg-amber-700/50 px-3 py-1.5 rounded-lg">
          <VPIcon size={20} />
          <span className="font-bold text-lg text-amber-100">{player.victoryPoints}</span>
          <span className="text-[10px] text-amber-400 uppercase">VP</span>
        </div>

        {/* Colonists */}
        <div className="flex items-center gap-1.5 bg-amber-700/50 px-3 py-1.5 rounded-lg">
          <ColonistIcon size={18} />
          <span className="font-bold text-amber-100">{player.colonists}</span>
          <span className="text-[10px] text-amber-400">free</span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-amber-600/50" />

        {/* Resources */}
        {RESOURCE_ORDER.map(resource => (
          <div
            key={resource}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
              player.goods[resource] > 0
                ? 'bg-amber-700/60 ring-1 ring-amber-500/30'
                : 'opacity-50'
            }`}
          >
            <ResourceIcon type={resource} size={18} />
            <span className={`font-bold text-sm ${player.goods[resource] > 0 ? 'text-white' : 'text-amber-500'}`}>
              {player.goods[resource]}
            </span>
            <span className="text-[9px] text-amber-400 hidden sm:inline">{RESOURCE_LABELS[resource]}</span>
          </div>
        ))}

        {/* Right side: supply info + log */}
        <div className="ml-auto flex items-center gap-3">
          <div className="text-[10px] text-amber-400 space-x-2 hidden md:flex">
            <span>VP pool: {vpSupply}</span>
            <span>Colonists: {colonistSupply}+{colonistShip}🚢</span>
          </div>
          <button
            onClick={onToggleLog}
            className="px-3 py-1.5 bg-amber-700/50 hover:bg-amber-600/50 rounded-lg text-xs text-amber-200 transition-colors"
          >
            📜 Log
          </button>
        </div>
      </div>
    </div>
  );
}
