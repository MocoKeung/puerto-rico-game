import { useEffect, useRef } from 'react';
import { X, Crown, Coins, Star, Users, Leaf, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PlayerState, PlantationTile, OwnedBuilding } from '../../store/gameEngine';
import { ResourceIcon } from '../icons/ResourceIcons';
import { RESOURCE_ORDER, RESOURCE_COLORS } from '../../data/constants';

const BUILDING_IMAGES: Record<string, string> = {
  small_indigo_plant:  '/images/buildings/small_indigo_plant.png',
  small_sugar_mill:    '/images/buildings/small_sugar_mill.png',
  tobacco_storage:     '/images/buildings/tobacco_storage.png',
  coffee_roaster:      '/images/buildings/coffee_roaster.png',
  small_market:        '/images/buildings/small_market.png',
  hacienda:            '/images/buildings/hacienda.png',
  construction_hut:    '/images/buildings/construction_hut.png',
  small_warehouse:     '/images/buildings/small_warehouse.png',
};

const MAX_SLOTS = 12;

interface OpponentDetailModalProps {
  player: PlayerState;
  isGovernor: boolean;
  onClose: () => void;
}

export default function OpponentDetailModal({ player, isGovernor, onClose }: OpponentDetailModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // showModal() puts the dialog in the browser top layer — no z-index needed.
    dialogRef.current?.showModal();
    // No cleanup call to dialog.close() — removing the DOM node is sufficient
    // and avoids the double-fire that prevents re-opening.
  }, []);

  const initials = player.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const totalGoods = RESOURCE_ORDER.reduce((s, r) => s + player.goods[r], 0);

  const usedSlots = player.buildings.reduce((s, b) => s + (b.def.size === 'large' ? 2 : 1), 0);
  const remainingCitySlots = MAX_SLOTS - usedSlots;
  const remainingPlantationSlots = MAX_SLOTS - player.plantations.length;

  return (
    <dialog
      ref={dialogRef}
      // Only close via explicit controls — NOT via native onClose event,
      // which would double-fire and block reopening.
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }}
      className="p-0 w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
      style={{ border: '1px solid rgba(201,135,12,0.4)', background: 'rgba(8,28,44,0.98)' }}
    >
      <style>{`
        dialog[open]::backdrop {
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
        }
        dialog { max-height: 92vh; }
      `}</style>

      {/* ── Header ── */}
      <div
        className="px-6 py-4 flex items-center gap-4 flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${player.color}ee, ${player.color}88)`,
          borderBottom: '1px solid rgba(201,135,12,0.3)',
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-cinzel font-black text-lg text-white flex-shrink-0 shadow-lg"
          style={{ background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.4)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {isGovernor && <Crown size={15} className="text-[#fde047] flex-shrink-0" strokeWidth={2.5} />}
            <span className="font-cinzel font-black text-white text-xl tracking-wide drop-shadow">{player.name}</span>
          </div>
          {isGovernor && (
            <span className="text-[10px] text-[#fde047]/80 font-cinzel uppercase tracking-[0.2em]">Governor</span>
          )}
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <QuickStat icon={<Coins size={14} className="text-[#fbbf24]" strokeWidth={2.5} />} value={player.doubloons} label={t('common.gold')} />
          <QuickStat icon={<Star size={14} className="text-[#fbbf24]" strokeWidth={2.5} />} value={player.victoryPoints} label={t('common.vp')} />
          <QuickStat icon={<Users size={14} className="text-[#fbbf24]" strokeWidth={2.5} />} value={player.colonists} label={t('common.col')} />
        </div>

        <button
          onClick={onClose}
          className="ml-2 p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/15 transition-colors flex-shrink-0"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 90px)' }}>

        {/* Goods row */}
        {totalGoods > 0 && (
          <div className="px-6 pt-4 pb-2 flex items-center gap-3 flex-wrap border-b border-white/10">
            <span className="font-cinzel text-[10px] text-[#c9870c]/70 uppercase tracking-widest">Goods</span>
            {RESOURCE_ORDER.map(r => player.goods[r] > 0 ? (
              <div key={r} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <ResourceIcon type={r} size={14} />
                <span className="font-cinzel font-bold text-white text-xs tabular-nums">{player.goods[r]}</span>
              </div>
            ) : null)}
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Plantations ── */}
          <section
            className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(245,230,200,0.06)', border: '1px solid rgba(45,106,79,0.3)' }}
          >
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#2d6a4f]/20"
              style={{ background: 'rgba(45,106,79,0.12)' }}
            >
              <h3 className="font-cinzel font-bold text-[#52c78a] text-xs tracking-wider uppercase flex items-center gap-2">
                <Leaf size={12} strokeWidth={2.5} />
                {t('island.yourPlantations') || 'Plantations'}
              </h3>
              <span className="font-cinzel text-[10px] text-[#52c78a]/70 font-bold">
                {player.plantations.length}/{MAX_SLOTS}
              </span>
            </div>
            <div className="p-3 grid grid-cols-4 gap-1.5">
              {player.plantations.map((tile, i) => (
                <ModalPlantationTile key={i} tile={tile} />
              ))}
              {Array.from({ length: remainingPlantationSlots }).map((_, i) => (
                <ModalEmptySlot key={`ep-${i}`} color="#2d6a4f" />
              ))}
            </div>
          </section>

          {/* ── City / Buildings ── */}
          <section
            className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(245,230,200,0.06)', border: '1px solid rgba(90,46,16,0.3)' }}
          >
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#5a2e10]/20"
              style={{ background: 'rgba(90,46,16,0.12)' }}
            >
              <h3 className="font-cinzel font-bold text-[#d4956a] text-xs tracking-wider uppercase flex items-center gap-2">
                <Building2 size={12} strokeWidth={2.5} />
                {t('island.yourCity') || 'City'}
              </h3>
              <span className="font-cinzel text-[10px] text-[#d4956a]/70 font-bold">
                {usedSlots}/{MAX_SLOTS}
              </span>
            </div>
            <div className="p-3 grid grid-cols-4 gap-1.5 items-start">
              {player.buildings.map((building, i) => (
                <ModalBuildingTile key={i} building={building} />
              ))}
              {Array.from({ length: remainingCitySlots }).map((_, i) => (
                <ModalEmptySlot key={`ec-${i}`} color="#5a2e10" aspectRatio="3/4" />
              ))}
            </div>
          </section>

        </div>
      </div>
    </dialog>
  );
}

/* ── Sub-components ── */

function QuickStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/10 rounded-xl py-2 px-3 gap-0.5 border border-white/10 min-w-[52px]">
      <div className="flex items-center gap-1">
        {icon}
        <span className="font-cinzel font-black text-white text-base tabular-nums leading-none">{value}</span>
      </div>
      <span className="text-[9px] text-white/45 font-cinzel uppercase tracking-wider">{label}</span>
    </div>
  );
}

function ModalEmptySlot({ color, aspectRatio }: { color: string; aspectRatio?: string }) {
  return (
    <div
      className="rounded-xl"
      style={{
        border: `1.5px dashed ${color}33`,
        background: `${color}08`,
        ...(aspectRatio ? { aspectRatio } : { height: 56 }),
      }}
    />
  );
}

function ModalPlantationTile({ tile }: { tile: PlantationTile }) {
  const isQuarry = tile.type === 'quarry';
  const color = isQuarry ? '#6b7280' : (RESOURCE_COLORS[tile.type as keyof typeof RESOURCE_COLORS] ?? '#888');
  const hasColonist = tile.colonist;

  return (
    <div
      className="relative rounded-xl p-1.5 flex flex-col items-center gap-1 transition-all"
      style={{
        background: hasColonist ? `${color}28` : `${color}14`,
        border: hasColonist ? `1.5px solid ${color}55` : `1px solid ${color}30`,
        height: 56,
        justifyContent: 'center',
      }}
      title={`${tile.type}${hasColonist ? ' (colonized)' : ''}`}
    >
      <ResourceIcon type={tile.type} size={22} />
      {hasColonist && (
        <div
          className="absolute -top-1 -right-1 rounded-full flex items-center justify-center shadow"
          style={{ backgroundColor: '#c9870c', border: '1.5px solid #f0a830', width: 14, height: 14 }}
        >
          <Users size={7} className="text-white" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

function ModalBuildingTile({ building }: { building: OwnedBuilding }) {
  const isLarge = building.def.size === 'large';
  const isProduction = building.def.category === 'production';
  const accent = isProduction ? '#2a5aab' : '#7c3fc0';
  const accentBorder = isProduction ? '#1e3a5f' : '#4a1d7a';
  const image = BUILDING_IMAGES[building.def.id];

  return (
    <div
      className={`rounded-xl overflow-hidden flex flex-col ${isLarge ? 'col-span-2' : ''}`}
      style={{ border: `1.5px solid ${accentBorder}55`, background: '#f5e6c8' }}
    >
      {/* Image — full portrait card */}
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{ background: `${accentBorder}18`, aspectRatio: '3/4' }}
      >
        {image ? (
          <img src={image} alt={building.def.name} className="w-full h-full object-contain" />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            {building.def.productionType
              ? <ResourceIcon type={building.def.productionType} size={32} />
              : <Star size={24} className="text-amber-400" strokeWidth={1.5} />
            }
          </div>
        )}
      </div>
      {/* Info */}
      <div className="px-1.5 pt-1 pb-1.5 flex flex-col gap-0.5">
        <span className="font-cinzel font-bold text-[#3d1f0a] text-[9px] leading-tight line-clamp-1">
          {building.def.name}
        </span>
        {building.def.maxColonists > 0 && (
          <div className="flex items-center gap-0.5 flex-wrap">
            {Array.from({ length: building.def.maxColonists }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full border flex-shrink-0"
                style={{
                  backgroundColor: i < building.colonists ? accent : 'transparent',
                  borderColor: i < building.colonists ? accent : `${accentBorder}44`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
