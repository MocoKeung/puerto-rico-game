import { useTranslation } from 'react-i18next';
import type { PlayerState } from '../../store/gameEngine';
import { ResourceIcon } from '../icons/ResourceIcons';
import { RESOURCE_ORDER } from '../../data/constants';

interface AIOpponentCardProps {
  player: PlayerState;
  isActive: boolean;
  isGovernor: boolean;
}

export default function AIOpponentCard({ player, isActive, isGovernor }: AIOpponentCardProps) {
  const { t } = useTranslation();
  const totalGoods = RESOURCE_ORDER.reduce((s, r) => s + player.goods[r], 0);
  const initials = player.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden
        transition-all duration-300
        ${isActive
          ? 'ring-2 ring-[#f0a830] shadow-[0_0_14px_rgba(240,168,48,0.4)] scale-[1.02]'
          : 'ring-1 ring-white/10'
        }
      `}
      style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(6px)' }}
    >
      {isActive && <div className="absolute inset-0 animate-shimmer pointer-events-none z-0" />}

      {/* Name bar */}
      <div
        className="relative z-10 px-3 py-1.5 flex items-center gap-2"
        style={{ backgroundColor: player.color + 'cc' }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center font-cinzel font-bold text-[10px] text-white flex-shrink-0 shadow-inner"
          style={{ backgroundColor: player.color, border: '1.5px solid rgba(255,255,255,0.3)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          {isGovernor && <span className="text-[#f0a830] text-[10px] flex-shrink-0">👑</span>}
          <span className="font-cinzel font-bold text-white text-[11px] truncate">{player.name}</span>
          {isActive && (
            <span className="text-[9px] text-white/60 font-crimson italic flex-shrink-0 ml-auto">
              {t('common.thinking')}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 px-3 py-2 space-y-1.5">
        <div className="grid grid-cols-3 gap-1">
          <StatPill icon="💰" value={player.doubloons} label={t('common.gold')} />
          <StatPill icon="⭐" value={player.victoryPoints} label={t('common.vp')} />
          <StatPill icon="👷" value={player.colonists} label={t('common.col')} />
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/50 font-crimson">
          <span>🌱 {player.plantations.length} {t('common.tiles')}</span>
          <span>🏛 {player.buildings.length} {t('common.bldgs')}</span>
          <span>📦 {totalGoods} {t('common.goods')}</span>
        </div>

        <div className="flex items-center gap-1.5 min-h-[16px]">
          {RESOURCE_ORDER.map(r =>
            player.goods[r] > 0 ? (
              <div key={r} className="flex items-center gap-0.5">
                <ResourceIcon type={r} size={12} />
                <span className="text-[10px] font-bold text-white/80">{player.goods[r]}</span>
              </div>
            ) : null
          )}
          {totalGoods === 0 && (
            <span className="text-[10px] text-white/25 font-crimson italic">
              {t('common.noGoods')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/10 rounded-lg py-1 px-1 gap-0.5">
      <div className="flex items-center gap-0.5">
        <span className="text-xs">{icon}</span>
        <span className="font-cinzel font-bold text-white text-xs">{value}</span>
      </div>
      <span className="text-[8px] text-white/40 font-cinzel uppercase tracking-wide">{label}</span>
    </div>
  );
}
