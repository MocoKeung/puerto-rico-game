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
    <div
      className="fixed bottom-0 left-0 right-0 z-40 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]"
      style={{
        background: 'linear-gradient(180deg, rgba(61,31,10,0.97) 0%, rgba(45,20,5,0.99) 100%)',
        borderTop: '1px solid rgba(201,135,12,0.3)',
      }}
    >
      {/* Gold accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9870c]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 flex-wrap">

        {/* Primary stats */}
        <div className="flex items-center gap-2">
          <TokenBadge icon={<DoubloonIcon size={18} />} value={player.doubloons} label="coins" />
          <TokenBadge icon={<VPIcon size={18} />} value={player.victoryPoints} label="VP" />
          <TokenBadge icon={<ColonistIcon size={16} />} value={player.colonists} label="free" />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[#c9870c]/25" />

        {/* Resources */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {RESOURCE_ORDER.map(resource => (
            <div
              key={resource}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200
                ${player.goods[resource] > 0
                  ? 'bg-white/12 ring-1 ring-[#c9870c]/25'
                  : 'opacity-35'
                }
              `}
            >
              <ResourceIcon type={resource} size={16} />
              <span className={`font-cinzel font-bold text-sm ${player.goods[resource] > 0 ? 'text-white' : 'text-white/40'}`}>
                {player.goods[resource]}
              </span>
              <span className="text-[9px] text-white/40 font-crimson hidden sm:inline">
                {RESOURCE_LABELS[resource]}
              </span>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <div className="text-[9px] text-[#c9870c]/50 font-cinzel tracking-wide space-x-2 hidden md:flex">
            <span>VP pool: {vpSupply}</span>
            <span>·</span>
            <span>Colonists: {colonistSupply}+{colonistShip}⛵</span>
          </div>
          <button
            onClick={onToggleLog}
            className="px-3 py-1.5 rounded-lg text-xs font-cinzel text-[#f0a830] transition-all duration-200 tracking-wide"
            style={{ background: 'rgba(201,135,12,0.15)', border: '1px solid rgba(201,135,12,0.25)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,135,12,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(201,135,12,0.15)')}
          >
            📜 Log
          </button>
        </div>
      </div>
    </div>
  );
}

function TokenBadge({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
      style={{ background: 'rgba(201,135,12,0.12)', border: '1px solid rgba(201,135,12,0.2)' }}
    >
      {icon}
      <span className="font-cinzel font-bold text-[#f0a830] text-base leading-none">{value}</span>
      <span className="text-[9px] text-[#c9870c]/60 font-cinzel tracking-wide uppercase">{label}</span>
    </div>
  );
}
