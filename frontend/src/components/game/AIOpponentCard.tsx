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
        relative flex-shrink-0 rounded-xl overflow-hidden min-w-[160px] max-w-[180px]
        transition-all duration-300
        ${isActive
          ? 'ring-2 ring-[#f0a830] shadow-[0_0_16px_rgba(240,168,48,0.4)] scale-[1.04]'
          : 'ring-1 ring-white/10'
        }
      `}
      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
    >
      {/* Active shimmer overlay */}
      {isActive && (
        <div className="absolute inset-0 animate-shimmer pointer-events-none z-0" />
      )}

      {/* Name bar */}
      <div
        className="relative z-10 px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: player.color + 'cc' }}
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-cinzel font-bold text-[10px] flex-shrink-0 shadow-inner"
          style={{ backgroundColor: player.color, border: '1.5px solid rgba(255,255,255,0.3)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {isGovernor && <span className="text-[#f0a830] text-xs">👑</span>}
            <span className="font-cinzel font-bold text-white text-[11px] truncate">
              {player.name}
            </span>
          </div>
          {isActive && (
            <span className="text-[9px] text-white/70 font-crimson italic">thinking…</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 px-3 py-2 space-y-2">
        {/* Doubloons / VP / Colonists */}
        <div className="flex items-center justify-between">
          <StatPill label="💰" value={player.doubloons} />
          <StatPill label="⭐" value={player.victoryPoints} />
          <StatPill label="👷" value={player.colonists} />
        </div>

        {/* Board counts */}
        <div className="flex items-center gap-2 text-[10px] text-white/50 font-crimson">
          <span>🌱 {player.plantations.length}</span>
          <span>🏛 {player.buildings.length}</span>
          <span>📦 {totalGoods}</span>
        </div>

        {/* Goods mini-row */}
        <div className="flex items-center gap-1 min-h-[14px]">
          {RESOURCE_ORDER.map(r =>
            player.goods[r] > 0 ? (
              <div key={r} className="flex items-center gap-0.5">
                <ResourceIcon type={r} size={11} />
                <span className="text-[10px] font-bold text-white/80">{player.goods[r]}</span>
              </div>
            ) : null
          )}
          {totalGoods === 0 && (
            <span className="text-[10px] text-white/30 font-crimson italic">no goods</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-md px-2 py-0.5">
      <span className="text-xs">{label}</span>
      <span className="font-cinzel font-bold text-white text-[11px]">{value}</span>
    </div>
  );
}
