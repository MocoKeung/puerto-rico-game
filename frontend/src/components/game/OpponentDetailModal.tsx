import { X, Crown, Coins, Star, Users, Leaf, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PlayerState, PlantationTile, OwnedBuilding } from '../../store/gameEngine';
import { ResourceIcon } from '../icons/ResourceIcons';
import { RESOURCE_ORDER } from '../../data/constants';

interface OpponentDetailModalProps {
  player: PlayerState;
  isGovernor: boolean;
  onClose: () => void;
}

export default function OpponentDetailModal({ player, isGovernor, onClose }: OpponentDetailModalProps) {
  const { t } = useTranslation();
  const initials = player.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const totalGoods = RESOURCE_ORDER.reduce((s, r) => s + player.goods[r], 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'rgba(12,40,58,0.97)', border: '1px solid rgba(201,135,12,0.35)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-3.5 flex items-center gap-3"
          style={{ backgroundColor: player.color + 'dd' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-cinzel font-bold text-sm text-white flex-shrink-0 shadow-inner"
            style={{ backgroundColor: player.color, border: '2px solid rgba(255,255,255,0.3)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {isGovernor && <Crown size={14} className="text-[#fde047] flex-shrink-0" strokeWidth={2.5} />}
            <span className="font-cinzel font-bold text-white text-base truncate">{player.name}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Primary stats */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard icon={<Coins size={14} className="text-[#fbbf24]" strokeWidth={2.5} />} value={player.doubloons} label={t('common.gold')} />
            <StatCard icon={<Star size={14} className="text-[#fbbf24]" strokeWidth={2.5} />} value={player.victoryPoints} label={t('common.vp')} />
            <StatCard icon={<Users size={14} className="text-[#fbbf24]" strokeWidth={2.5} />} value={player.colonists} label={t('common.col')} />
          </div>

          {/* Goods */}
          <Section icon={<span className="text-sm">📦</span>} label={t('common.goods') || 'Goods'}>
            {totalGoods === 0 ? (
              <span className="text-xs text-white/30 font-crimson italic">{t('common.noGoods')}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {RESOURCE_ORDER.map(r =>
                  player.goods[r] > 0 ? (
                    <div key={r} className="flex items-center gap-1 bg-white/8 rounded-lg px-2.5 py-1.5">
                      <ResourceIcon type={r} size={16} />
                      <span className="text-sm font-bold text-white tabular-nums">{player.goods[r]}</span>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </Section>

          {/* Plantations */}
          <Section
            icon={<Leaf size={13} className="text-emerald-400" strokeWidth={2} />}
            label={`${t('common.plantations') || 'Plantations'} (${player.plantations.length})`}
          >
            {player.plantations.length === 0 ? (
              <span className="text-xs text-white/30 font-crimson italic">None</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {player.plantations.map((p: PlantationTile, i: number) => (
                  <PlantationTileView key={i} tile={p} />
                ))}
              </div>
            )}
          </Section>

          {/* Buildings */}
          <Section
            icon={<Building2 size={13} className="text-sky-400" strokeWidth={2} />}
            label={`${t('common.buildings') || 'Buildings'} (${player.buildings.length})`}
          >
            {player.buildings.length === 0 ? (
              <span className="text-xs text-white/30 font-crimson italic">None</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {player.buildings.map((b: OwnedBuilding, i: number) => (
                  <BuildingBadge key={i} building={b} />
                ))}
              </div>
            )}
          </Section>

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/8 rounded-xl py-2.5 px-2 gap-1">
      <div className="flex items-center gap-1">
        {icon}
        <span className="font-cinzel font-bold text-white text-base tabular-nums leading-none">{value}</span>
      </div>
      <span className="text-[9px] text-white/40 font-cinzel uppercase tracking-wide leading-none">{label}</span>
    </div>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        {icon}
        <span className="font-cinzel text-[10px] text-[#c9870c]/80 uppercase tracking-[0.18em]">{label}</span>
      </div>
      {children}
    </div>
  );
}

function PlantationTileView({ tile }: { tile: PlantationTile }) {
  const icons: Record<string, string> = {
    corn: '🌽', indigo: '💙', sugar: '🍬', tobacco: '🌿', coffee: '☕', quarry: '⛏️',
  };
  return (
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border ${
        tile.colonist
          ? 'border-[#f0a830]/60 bg-[#f0a830]/15'
          : 'border-white/15 bg-white/5'
      }`}
      title={`${tile.type}${tile.colonist ? ' (colonized)' : ''}`}
    >
      {icons[tile.type] ?? '?'}
    </div>
  );
}

function BuildingBadge({ building }: { building: OwnedBuilding }) {
  const filled = building.colonists;
  const max = building.def.maxColonists;
  return (
    <div
      className="px-2.5 py-1.5 rounded-lg border text-xs font-cinzel text-white/80 flex items-center gap-1.5"
      style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(201,135,12,0.25)' }}
    >
      <span>{building.def.name}</span>
      {max > 0 && (
        <span className="text-[9px] text-[#f0a830]/70 tabular-nums">{filled}/{max}</span>
      )}
    </div>
  );
}
