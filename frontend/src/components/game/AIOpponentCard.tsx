import { Crown, Coins, Star, Users, Leaf, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PlayerState } from '../../store/gameEngine';
import { ResourceIcon } from '../icons/ResourceIcons';
import { RESOURCE_ORDER } from '../../data/constants';

interface AIOpponentCardProps {
  player: PlayerState;
  isActive: boolean;
  isGovernor: boolean;
  onClick?: () => void;
}

export default function AIOpponentCard({ player, isActive, isGovernor, onClick }: AIOpponentCardProps) {
  const { t } = useTranslation();
  const totalGoods = RESOURCE_ORDER.reduce((s, r) => s + player.goods[r], 0);
  const initials = player.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isActive
          ? 'ring-2 ring-[#f0a830] shadow-[0_0_20px_rgba(240,168,48,0.4)] scale-[1.02]'
          : 'ring-1 ring-white/15 hover:ring-[#f0a830]/50'
      } ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
      onClick={onClick}
    >
      {/* Name bar — player color */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{
          background: `linear-gradient(135deg, ${player.color}ff, ${player.color}cc)`,
          borderBottom: '1px solid rgba(0,0,0,0.15)',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-cinzel font-black text-xs text-white flex-shrink-0 shadow"
          style={{ background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.5)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden">
          {isGovernor && <Crown size={10} className="text-[#fde047] flex-shrink-0" strokeWidth={2.5} />}
          <span className="font-cinzel font-black text-white text-sm truncate" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {player.name}
          </span>
        </div>
        {isActive && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
          </div>
        )}
      </div>

      {/* Stats — parchment background for readability */}
      <div className="px-3 py-2 space-y-2" style={{ background: 'rgba(245,230,200,0.95)' }}>
        {/* Primary stats row */}
        <div className="grid grid-cols-3 gap-1">
          <SmallStat icon={<Coins size={10} className="text-[#c9870c]" strokeWidth={2.5} />} value={player.doubloons} />
          <SmallStat icon={<Star size={10} className="text-[#c9870c]" strokeWidth={2.5} />} value={player.victoryPoints} />
          <SmallStat icon={<Users size={10} className="text-[#c9870c]" strokeWidth={2.5} />} value={player.colonists} />
        </div>

        {/* Board counts */}
        <div className="flex items-center justify-between px-1">
          <span className="flex items-center gap-1 text-[#5a2e10]/70">
            <Leaf size={9} strokeWidth={2} />
            <span className="text-[10px] font-cinzel font-bold">{player.plantations.length}</span>
          </span>
          <span className="flex items-center gap-1 text-[#5a2e10]/70">
            <Building2 size={9} strokeWidth={2} />
            <span className="text-[10px] font-cinzel font-bold">{player.buildings.length}</span>
          </span>
          {/* Goods tokens */}
          <div className="flex items-center gap-1">
            {RESOURCE_ORDER.map(r =>
              player.goods[r] > 0 ? (
                <div key={r} className="flex items-center gap-0.5">
                  <ResourceIcon type={r} size={12} />
                  <span className="text-[9px] font-bold text-[#3d1f0a] tabular-nums">{player.goods[r]}</span>
                </div>
              ) : null
            )}
            {totalGoods === 0 && (
              <span className="text-[9px] text-[#5a2e10]/35 font-crimson italic">
                {t('common.noGoods')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallStat({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <div className="flex items-center justify-center gap-1 py-1 rounded-lg" style={{ background: 'rgba(61,31,10,0.06)' }}>
      {icon}
      <span className="font-cinzel font-black text-[#3d1f0a] text-sm tabular-nums leading-none">{value}</span>
    </div>
  );
}
