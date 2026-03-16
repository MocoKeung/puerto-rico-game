import { useTranslation } from 'react-i18next';
import useGameEngine from '../../../store/gameEngine';
import { ResourceIcon } from '../../icons/ResourceIcons';
import { ALL_BUILDINGS, type BuildingDef } from '../../../data/buildings';

export default function BuilderPanel() {
  const { t } = useTranslation();
  const { builderBuyBuilding, builderPass, waitingForHuman, players, activePlayerSeat,
          rolePickerSeat, buildingSupply, phase } = useGameEngine();
  const player = players[activePlayerSeat];
  const isBuilder = activePlayerSeat === rolePickerSeat;

  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-bounce text-4xl mb-3">🏗️</div>
          <p className="text-amber-600 font-medium">{t('builder.opponentBuying', { name: player?.name })}</p>
        </div>
      </div>
    );
  }

  const humanPlayer = players[0];
  const quarryDiscount = humanPlayer.plantations.filter(p => p.type === 'quarry' && p.colonist).length;
  const totalDiscount = (isBuilder ? 1 : 0) + quarryDiscount;
  const usedSlots = humanPlayer.buildings.reduce((s, b) => s + (b.def.size === 'large' ? 2 : 1), 0);

  // Group buildings
  const production = ALL_BUILDINGS.filter(b => b.category === 'production');
  const violet = ALL_BUILDINGS.filter(b => b.category === 'violet' && b.cost < 10);
  const major = ALL_BUILDINGS.filter(b => b.cost === 10);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-amber-900">{t('builder.title')}</h2>
          <p className="text-sm text-amber-600">
            {isBuilder ? t('builder.builderDiscount') : t('builder.fullPrice')}
            {quarryDiscount > 0 && ` ${t('builder.quarryDiscount', { n: quarryDiscount })}`}
            {totalDiscount > 0 && <strong> {t('builder.totalDiscount', { n: totalDiscount })}</strong>}
          </p>
        </div>
        <button
          onClick={() => builderPass(0)}
          className="px-4 py-2 border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
        >
          {t('common.pass')}
        </button>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <BuildingSection
          title={t('builder.productionBuildings')}
          buildings={production}
          supply={buildingSupply}
          player={humanPlayer}
          discount={totalDiscount}
          usedSlots={usedSlots}
          onBuy={(id) => builderBuyBuilding(0, id)}
        />
        <BuildingSection
          title={t('builder.violetBuildings')}
          buildings={violet}
          supply={buildingSupply}
          player={humanPlayer}
          discount={totalDiscount}
          usedSlots={usedSlots}
          onBuy={(id) => builderBuyBuilding(0, id)}
        />
        <BuildingSection
          title={t('builder.majorBuildings')}
          buildings={major}
          supply={buildingSupply}
          player={humanPlayer}
          discount={totalDiscount}
          usedSlots={usedSlots}
          onBuy={(id) => builderBuyBuilding(0, id)}
        />
      </div>
    </div>
  );
}

function BuildingSection({
  title, buildings, supply, player, discount, usedSlots, onBuy,
}: {
  title: string;
  buildings: BuildingDef[];
  supply: Record<string, number>;
  player: ReturnType<typeof useGameEngine.getState>['players'][0];
  discount: number;
  usedSlots: number;
  onBuy: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {buildings.map(b => {
          const remaining = supply[b.id] ?? 0;
          const cost = Math.max(0, b.cost - discount);
          const canAfford = player.doubloons >= cost;
          const alreadyOwned = b.category === 'violet' && player.buildings.some(pb => pb.def.id === b.id);
          const neededSlots = b.size === 'large' ? 2 : 1;
          const noSpace = usedSlots + neededSlots > 12;
          const disabled = remaining <= 0 || !canAfford || alreadyOwned || noSpace;

          return (
            <button
              key={b.id}
              onClick={() => !disabled && onBuy(b.id)}
              disabled={disabled}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                disabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-amber-200 bg-white hover:border-amber-400 hover:shadow-md cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-amber-900">{b.name}</span>
                    {b.size === 'large' && (
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded">{t('builder.large')}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-600 mt-0.5 leading-tight">{b.description}</p>
                  {b.productionType && (
                    <div className="mt-1 flex items-center gap-1">
                      <ResourceIcon type={b.productionType} size={14} />
                      <span className="text-[10px] text-amber-500 capitalize">{t(`resources.${b.productionType}`, { defaultValue: b.productionType })}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    {discount > 0 && cost < b.cost && (
                      <span className="text-xs text-gray-400 line-through">{b.cost}</span>
                    )}
                    <span className={`text-sm font-bold ${canAfford ? 'text-emerald-600' : 'text-red-500'}`}>
                      💰{cost}
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-500">{t('builder.vp', { n: b.vp })}</div>
                  <div className="text-[10px] text-amber-400">{t('builder.workers', { n: b.maxColonists })}</div>
                  <div className="text-[10px] text-gray-400">{t('builder.left', { n: remaining })}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
