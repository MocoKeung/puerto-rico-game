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
  const buildingCount = player.buildings.length;
  const plantationCount = player.plantations.length;

  return (
    <div
      className={`
        rounded-xl border-2 transition-all duration-300 overflow-hidden min-w-[180px]
        ${isActive
          ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-200/50 scale-[1.03]'
          : 'border-amber-200/50 bg-white/80'
        }
      `}
    >
      {/* Name bar */}
      <div
        className="px-3 py-1.5 flex items-center justify-between text-white text-xs"
        style={{ backgroundColor: player.color }}
      >
        <span className="font-bold truncate">
          {isGovernor && <span className="mr-1">👑</span>}
          {player.name}
        </span>
        {isActive && (
          <span className="ml-1 text-[10px] bg-white/20 px-1.5 rounded">thinking...</span>
        )}
      </div>

      {/* Stats */}
      <div className="px-3 py-2 space-y-1.5">
        {/* Doubloons + VP */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-amber-700">
            <span className="text-sm">💰</span>
            <strong>{player.doubloons}</strong>
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="text-sm">⭐</span>
            <strong>{player.victoryPoints}</strong>
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <span className="text-sm">👷</span>
            <span>{player.colonists}</span>
          </span>
        </div>

        {/* Plantations & Buildings count */}
        <div className="flex items-center gap-2 text-[10px] text-amber-600">
          <span>🌱 {plantationCount}</span>
          <span>🏛 {buildingCount}</span>
          <span>📦 {totalGoods}</span>
        </div>

        {/* Resource mini-bar */}
        <div className="flex items-center gap-1">
          {RESOURCE_ORDER.map(r => (
            player.goods[r] > 0 ? (
              <div key={r} className="flex items-center gap-0.5">
                <ResourceIcon type={r} size={12} />
                <span className="text-[10px] font-bold text-amber-800">{player.goods[r]}</span>
              </div>
            ) : null
          ))}
          {totalGoods === 0 && <span className="text-[10px] text-amber-400 italic">no goods</span>}
        </div>
      </div>
    </div>
  );
}
