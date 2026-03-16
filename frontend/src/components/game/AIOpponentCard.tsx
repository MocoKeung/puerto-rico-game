import type { PlayerState } from '../../store/gameEngine';
import { ResourceIcon } from '../icons/ResourceIcons';
import { RESOURCE_ORDER } from '../../data/constants';

interface AIOpponentCardProps {
  player: PlayerState;
  isActive: boolean;
  isGovernor: boolean;
}

export default function AIOpponentCard({ player, isActive, isGovernor }: AIOpponentCardProps) {
  const totalGoods = RESOURCE_ORDER.reduce((s, r) => s + player.goods[r], 0);
  const initials = player.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      className={`
        relative flex-shrink-0 flex items-center gap-2
        rounded-xl overflow-hidden px-3 py-2
        transition-all duration-300
        ${isActive
          ? 'ring-2 ring-[#f0a830] shadow-[0_0_12px_rgba(240,168,48,0.35)] scale-[1.03]'
          : 'ring-1 ring-white/10'
        }
      `}
      style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}
    >
      {/* Active shimmer */}
      {isActive && (
        <div className="absolute inset-0 animate-shimmer pointer-events-none z-0" />
      )}

      {/* Avatar */}
      <div
        className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center font-cinzel font-bold text-[10px] text-white flex-shrink-0 shadow-inner"
        style={{ backgroundColor: player.color, border: '1.5px solid rgba(255,255,255,0.3)' }}
      >
        {initials}
      </div>

      {/* Info block */}
      <div className="relative z-10 min-w-0">
        {/* Name row */}
        <div className="flex items-center gap-1 mb-0.5">
          {isGovernor && <span className="text-[#f0a830] text-[10px]">👑</span>}
          <span
            className="font-cinzel font-bold text-white text-[11px] truncate max-w-[90px]"
            title={player.name}
          >
            {player.name}
          </span>
          {isActive && (
            <span className="text-[9px] text-white/50 font-crimson italic ml-1">…</span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 text-[10px] font-cinzel">
          <span className="text-white/80">💰{player.doubloons}</span>
          <span className="text-white/80">⭐{player.victoryPoints}</span>
          <span className="text-white/60">👷{player.colonists}</span>
        </div>

        {/* Board + goods row */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] text-white/40 font-crimson">
            🌱{player.plantations.length} · 🏛{player.buildings.length}
          </span>
          <div className="flex items-center gap-0.5">
            {RESOURCE_ORDER.map(r =>
              player.goods[r] > 0 ? (
                <div key={r} className="flex items-center gap-0.5">
                  <ResourceIcon type={r} size={10} />
                  <span className="text-[9px] font-bold text-white/70">{player.goods[r]}</span>
                </div>
              ) : null
            )}
            {totalGoods === 0 && (
              <span className="text-[9px] text-white/25 font-crimson italic">no goods</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
