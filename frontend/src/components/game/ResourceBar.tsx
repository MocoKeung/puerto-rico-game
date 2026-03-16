import { useTranslation } from 'react-i18next';
import useGameEngine from '../../store/gameEngine';
import { ResourceIcon, DoubloonIcon, VPIcon, ColonistIcon } from '../icons/ResourceIcons';
import { RESOURCE_ORDER } from '../../data/constants';

interface ResourceBarProps {
  onToggleLog: () => void;
}

export default function ResourceBar({ onToggleLog }: ResourceBarProps) {
  const { t } = useTranslation();
  const player = useGameEngine(s => s.players[0]);
  const { vpSupply, colonistSupply, colonistShip } = useGameEngine();

  if (!player) return null;

  return (
    <div
      className="flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
      style={{
        background: 'linear-gradient(180deg, rgba(61,31,10,0.97) 0%, rgba(45,20,5,0.99) 100%)',
        borderTop: '1px solid rgba(201,135,12,0.3)',
      }}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9870c]/60 to-transparent" />

      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-3 flex-wrap">

        {/* Primary stats */}
        <div className="flex items-center gap-2">
          <TokenBadge icon={<DoubloonIcon size={16} />} value={player.doubloons} label={t('common.coins')} />
          <TokenBadge icon={<VPIcon size={16} />} value={player.victoryPoints} label={t('common.vp')} />
          <TokenBadge icon={<ColonistIcon size={14} />} value={player.colonists} label={t('common.free')} />
        </div>

        <div className="h-5 w-px bg-[#c9870c]/25" />

        {/* Goods */}
        <div className="flex items-center gap-1 flex-wrap">
          {RESOURCE_ORDER.map(resource => (
            <div
              key={resource}
              className={`
                flex items-center gap-1 px-1.5 py-1 rounded-lg transition-opacity duration-200
                ${player.goods[resource] > 0 ? 'bg-white/10 ring-1 ring-[#c9870c]/25' : 'opacity-30'}
              `}
            >
              <ResourceIcon type={resource} size={14} />
              <span className={`font-cinzel font-bold text-xs ${player.goods[resource] > 0 ? 'text-white' : 'text-white/40'}`}>
                {player.goods[resource]}
              </span>
              <span className="text-[9px] text-white/40 font-crimson hidden sm:inline">
                {t(`resources.${resource}`)}
              </span>
            </div>
          ))}
        </div>

        {/* Supply info + Log button */}
        <div className="ml-auto flex items-center gap-3">
          <div className="text-[9px] text-[#c9870c]/50 font-cinzel tracking-wide hidden md:flex items-center gap-1.5">
            <span>{t('common.vpSupply', { n: vpSupply })}</span>
            <span className="text-[#c9870c]/25">·</span>
            <span>{t('common.colonistSupply', { supply: colonistSupply, ship: colonistShip })}</span>
          </div>

          <button
            onClick={onToggleLog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel text-[#f0a830] tracking-wide transition-all duration-150 hover:bg-[#c9870c]/25 active:bg-[#c9870c]/35 focus:outline-none focus:ring-1 focus:ring-[#c9870c]/60"
            style={{ background: 'rgba(201,135,12,0.12)', border: '1px solid rgba(201,135,12,0.25)' }}
          >
            📜 <span className="hidden sm:inline">{t('common.log')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function TokenBadge({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style={{ background: 'rgba(201,135,12,0.12)', border: '1px solid rgba(201,135,12,0.2)' }}
    >
      {icon}
      <span className="font-cinzel font-bold text-[#f0a830] text-sm leading-none">{value}</span>
      <span className="text-[9px] text-[#c9870c]/60 font-cinzel tracking-wide uppercase hidden sm:inline">{label}</span>
    </div>
  );
}
