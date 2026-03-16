import { Crown, Coins, Star, Users, Leaf, Building2, Package } from 'lucide-react';
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
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        isActive
          ? 'ring-2 ring-[#f0a830] shadow-[0_0_16px_rgba(240,168,48,0.35)] scale-[1.015]'
          : 'ring-1 ring-white/8 hover:ring-[#f0a830]/40'
      } ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
      onClick={onClick}
    >
      {/* Name bar */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: player.color + 'dd' }}
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-cinzel font-bold text-[11px] text-white flex-shrink-0 shadow-inner"
          style={{ backgroundColor: player.color, border: '2px solid rgba(255,255,255,0.25)' }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden">
          {isGovernor && <Crown size={10} className="text-[#fde047] flex-shrink-0" strokeWidth={2.5} />}
          <span className="font-cinzel font-bold text-white text-xs truncate">{player.name}</span>
          {isActive && (
            <span className="text-[9px] text-white/60 font-crimson italic flex-shrink-0 ml-auto">
              {t('common.thinking')}
            </span>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-3 pt-2 pb-1.5 space-y-2">
        {/* 3 primary stats */}
        <div className="grid grid-cols-3 gap-1">
          <MiniStat icon={<Coins size={11} className="text-[#fbbf24]" strokeWidth={2.5} />} value={player.doubloons} label={t('common.gold')} />
          <MiniStat icon={<Star size={10} className="text-[#fbbf24]" strokeWidth={2.5} />} value={player.victoryPoints} label={t('common.vp')} />
          <MiniStat icon={<Users size={10} className="text-[#fbbf24]" strokeWidth={2.5} />} value={player.colonists} label={t('common.col')} />
        </div>

        {/* Board overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-white/50">
            <Leaf size={9} strokeWidth={2} />
            <span className="text-[10px] font-cinzel ml-0.5">{player.plantations.length}</span>
          </div>
          <div className="flex items-center gap-0.5 text-white/50">
            <Building2 size={9} strokeWidth={2} />
            <span className="text-[10px] font-cinzel ml-0.5">{player.buildings.length}</span>
          </div>
          <div className="flex items-center gap-0.5 text-white/50">
            <Package size={9} strokeWidth={2} />
            <span className="text-[10px] font-cinzel ml-0.5">{totalGoods}</span>
          </div>
        </div>

        {/* Goods tokens row */}
        <div className="flex items-center gap-1 min-h-[18px]">
          {RESOURCE_ORDER.map(r =>
            player.goods[r] > 0 ? (
              <div key={r} className="flex items-center gap-0.5">
                <ResourceIcon type={r} size={14} />
                <span className="text-[10px] font-bold text-white/80 tabular-nums">{player.goods[r]}</span>
              </div>
            ) : null
          )}
          {totalGoods === 0 && (
            <span className="text-[10px] text-white/20 font-crimson italic">
              {t('common.noGoods')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/8 rounded-lg py-1 px-1 gap-0.5">
      <div className="flex items-center gap-0.5">
        {icon}
        <span className="font-cinzel font-bold text-white text-xs tabular-nums leading-none">{value}</span>
      </div>
      <span className="text-[8px] text-white/35 font-cinzel uppercase tracking-wide leading-none">{label}</span>
    </div>
  );
}
