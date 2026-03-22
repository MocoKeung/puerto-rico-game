import { useRef, useState, useEffect } from 'react';
import { Hammer, Star, Coins, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useGameEngine from '../../../store/gameEngine';
import { ResourceIcon } from '../../icons/ResourceIcons';
import { ALL_BUILDINGS, type BuildingDef } from '../../../data/buildings';

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

export default function BuilderPanel() {
  const { t } = useTranslation();
  const { builderBuyBuilding, builderPass, waitingForHuman, players, activePlayerSeat,
          rolePickerSeat, buildingSupply } = useGameEngine();
  const player = players[activePlayerSeat];
  const isBuilder = activePlayerSeat === rolePickerSeat;

  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-bounce mb-3">
            <Hammer size={40} className="text-amber-500 mx-auto" strokeWidth={1.5} />
          </div>
          <p className="text-amber-600 font-medium">{t('builder.opponentBuying', { name: player?.name })}</p>
        </div>
      </div>
    );
  }

  const humanPlayer = players[0];
  if (!humanPlayer) return null;

  const quarryDiscount = humanPlayer.plantations.filter(p => p.type === 'quarry' && p.colonist).length;
  const totalDiscount = (isBuilder ? 1 : 0) + quarryDiscount;
  const usedSlots = humanPlayer.buildings.reduce((s, b) => s + (b.def.size === 'large' ? 2 : 1), 0);

  const production = ALL_BUILDINGS.filter(b => b.category === 'production');
  const violet = ALL_BUILDINGS.filter(b => b.category === 'violet' && b.cost < 10);
  const major = ALL_BUILDINGS.filter(b => b.cost === 10);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-cinzel font-bold text-amber-900">{t('builder.title')}</h2>
          <p className="text-sm text-amber-600">
            {isBuilder ? t('builder.builderDiscount') : t('builder.fullPrice')}
            {quarryDiscount > 0 && ` ${t('builder.quarryDiscount', { n: quarryDiscount })}`}
            {totalDiscount > 0 && <strong> {t('builder.totalDiscount', { n: totalDiscount })}</strong>}
          </p>
        </div>
        <button
          onClick={() => builderPass(0)}
          className="px-4 py-2 border-2 border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 active:scale-[0.97] transition-all text-sm font-cinzel"
        >
          {t('common.pass')}
        </button>
      </div>

      <div className="space-y-6">
        <BuildingCarousel
          title={t('builder.productionBuildings')}
          buildings={production}
          supply={buildingSupply}
          humanPlayer={humanPlayer}
          discount={totalDiscount}
          usedSlots={usedSlots}
          onBuy={(id) => builderBuyBuilding(0, id)}
          t={t}
        />
        <BuildingCarousel
          title={t('builder.violetBuildings')}
          buildings={violet}
          supply={buildingSupply}
          humanPlayer={humanPlayer}
          discount={totalDiscount}
          usedSlots={usedSlots}
          onBuy={(id) => builderBuyBuilding(0, id)}
          t={t}
        />
        <BuildingCarousel
          title={t('builder.majorBuildings')}
          buildings={major}
          supply={buildingSupply}
          humanPlayer={humanPlayer}
          discount={totalDiscount}
          usedSlots={usedSlots}
          onBuy={(id) => builderBuyBuilding(0, id)}
          t={t}
        />
      </div>
    </div>
  );
}

function BuildingCarousel({
  title, buildings, supply, humanPlayer, discount, usedSlots, onBuy, t,
}: {
  title: string;
  buildings: BuildingDef[];
  supply: Record<string, number>;
  humanPlayer: ReturnType<typeof useGameEngine.getState>['players'][0];
  discount: number;
  usedSlots: number;
  onBuy: (id: string) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', update, { passive: true });
    // Also observe size changes
    const ro = new ResizeObserver(update);
    if (el) ro.observe(el);
    return () => { if (el) el.removeEventListener('scroll', update); ro.disconnect(); };
  }, [buildings]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  return (
    <div>
      <h3 className="text-xs font-cinzel font-bold text-amber-700 uppercase tracking-wider mb-3">{title}</h3>
      <div className="relative">
        {canLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-amber-900/80 text-white flex items-center justify-center shadow-lg hover:bg-amber-900 transition-colors -ml-1"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-amber-900/80 text-white flex items-center justify-center shadow-lg hover:bg-amber-900 transition-colors -mr-1"
          >
            <ChevronRight size={18} />
          </button>
        )}
        {canLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f5e6c8] to-transparent z-10 pointer-events-none" />
        )}
        {canRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f5e6c8] to-transparent z-10 pointer-events-none" />
        )}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory justify-center"
        >
          {buildings.map(b => {
            const remaining = supply[b.id] ?? 0;
            const cost = Math.max(0, b.cost - discount);
            const canAfford = humanPlayer.doubloons >= cost;
            const alreadyOwned = b.category === 'violet' && humanPlayer.buildings.some(pb => pb.def.id === b.id);
            const neededSlots = b.size === 'large' ? 2 : 1;
            const noSpace = usedSlots + neededSlots > 12;
            const outOfStock = remaining <= 0;
            const disabled = outOfStock || !canAfford || alreadyOwned || noSpace;

            return (
              <div key={b.id} className="snap-start flex-shrink-0">
                <BuildingCard
                  building={b}
                  cost={cost}
                  originalCost={b.cost}
                  canAfford={canAfford}
                  disabled={disabled}
                  alreadyOwned={alreadyOwned}
                  outOfStock={outOfStock}
                  noSpace={noSpace}
                  remaining={remaining}
                  discount={discount}
                  onBuy={() => !disabled && onBuy(b.id)}
                  t={t}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BuildingCard({
  building, cost, originalCost, canAfford, disabled, alreadyOwned,
  outOfStock, noSpace, remaining, discount, onBuy, t,
}: {
  building: BuildingDef;
  cost: number;
  originalCost: number;
  canAfford: boolean;
  disabled: boolean;
  alreadyOwned: boolean;
  outOfStock: boolean;
  noSpace: boolean;
  remaining: number;
  discount: number;
  onBuy: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const image = BUILDING_IMAGES[building.id];

  const disabledReason = outOfStock ? 'Out of stock'
    : alreadyOwned ? 'Already owned'
    : noSpace ? 'No space'
    : !canAfford ? `Need ${cost} 💰`
    : null;

  return (
    <button
      onClick={() => !disabled && onBuy()}
      disabled={disabled}
      className={`
        relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-200 flex flex-col
        w-[185px]
        ${disabled
          ? 'opacity-50 cursor-not-allowed border-gray-200 grayscale'
          : 'cursor-pointer border-amber-300 hover:border-amber-500 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
      style={{ background: '#f5e6c8' }}
    >
      {/* Image area — portrait card (896×1200), use object-contain so full card is visible */}
      <div className="relative overflow-hidden bg-amber-900/20 flex items-center justify-center" style={{ aspectRatio: '3/4', maxHeight: 200 }}>
        {image ? (
          <img
            src={image}
            alt={building.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-100">
            {building.productionType
              ? <ResourceIcon type={building.productionType} size={44} />
              : <Star size={36} className="text-amber-400" strokeWidth={1.5} />
            }
          </div>
        )}

        {/* Remaining badge */}
        <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[10px] font-cinzel px-1.5 py-0.5 rounded-full">
          ×{remaining}
        </div>

        {building.size === 'large' && (
          <div className="absolute top-1.5 left-1.5 bg-amber-700/80 text-white text-[9px] font-cinzel px-1.5 py-0.5 rounded-full">
            {t('builder.large')}
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="px-2.5 pt-1.5 pb-2.5 flex-1">
        <p className="font-cinzel font-bold text-[#3d1f0a] text-[11px] leading-tight mb-1">{building.name}</p>

        {building.productionType && (
          <div className="flex items-center gap-1 mb-1">
            <ResourceIcon type={building.productionType} size={12} />
            <span className="text-[9px] text-amber-600 capitalize">
              {t(`resources.${building.productionType}`, { defaultValue: building.productionType })}
            </span>
          </div>
        )}

        <p className="text-[9px] text-[#5a2e10]/70 font-crimson leading-tight line-clamp-2 mb-2">
          {building.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            {discount > 0 && cost < originalCost && (
              <span className="text-[9px] text-gray-400 line-through">{originalCost}</span>
            )}
            <span className={`flex items-center gap-0.5 text-sm font-cinzel font-bold ${canAfford ? 'text-emerald-700' : 'text-red-500'}`}>
              <Coins size={11} strokeWidth={2.5} />{cost}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-amber-600">
            <span className="flex items-center gap-0.5">
              <Star size={9} strokeWidth={2.5} />{building.vp}
            </span>
            <span className="flex items-center gap-0.5">
              <Users size={9} strokeWidth={2.5} />×{building.maxColonists}
            </span>
          </div>
        </div>
      </div>

      {disabled && disabledReason && (
        <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
          <span className="bg-black/60 text-white text-[9px] font-cinzel px-2 py-0.5 rounded-full">
            {disabledReason}
          </span>
        </div>
      )}
    </button>
  );
}
