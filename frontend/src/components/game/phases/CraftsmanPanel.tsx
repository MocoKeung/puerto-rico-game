import { useTranslation } from 'react-i18next';
import { useGameContext } from '../../../contexts/GameContext';
import { ResourceIcon } from '../../icons/ResourceIcons';
import { RESOURCE_ORDER, RESOURCE_LABELS } from '../../../data/constants';

export default function CraftsmanPanel() {
  const { t } = useTranslation();
  const { waitingForHuman, craftsmanBonusGood, players, goodsSupply } = useGameContext();
  const humanPlayer = players[0];

  // Craftsman auto-produces. If waitingForHuman, it means we need bonus good choice.
  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⚒️</div>
          <p className="text-amber-600 font-medium">{t('craftsman.producing')}</p>
        </div>
      </div>
    );
  }

  // Human needs to pick bonus good
  const producibleTypes = RESOURCE_ORDER.filter(r => {
    if (r === 'corn') {
      return humanPlayer.plantations.some(p => p.type === 'corn' && p.colonist) && goodsSupply[r] > 0;
    }
    const plantations = humanPlayer.plantations.filter(p => p.type === r && p.colonist).length;
    const buildings = humanPlayer.buildings.filter(b => b.def.productionType === r).reduce((s, b) => s + b.colonists, 0);
    return Math.min(plantations, buildings) > 0 && goodsSupply[r] > 0;
  });

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-amber-900">{t('craftsman.title')}</h2>
        <p className="text-sm text-amber-600">
          {t('craftsman.instructions')}
        </p>
      </div>

      {/* Production summary */}
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 mb-4">
        <h3 className="text-xs font-bold text-emerald-700 uppercase mb-2">{t('craftsman.yourGoods')}</h3>
        <div className="flex gap-3 flex-wrap">
          {RESOURCE_ORDER.map(r => (
            <div key={r} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-emerald-100">
              <ResourceIcon type={r} size={18} />
              <span className="font-bold text-amber-900">{humanPlayer.goods[r]}</span>
              <span className="text-[10px] text-amber-500">{t(`resources.${r}`, { defaultValue: RESOURCE_LABELS[r] })}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus choice */}
      <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">{t('craftsman.chooseBonus')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {producibleTypes.map(resource => (
          <button
            key={resource}
            onClick={() => craftsmanBonusGood(0, resource)}
            className="p-4 rounded-xl border-2 border-amber-200 bg-white hover:border-emerald-400 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 flex flex-col items-center gap-2"
          >
            <ResourceIcon type={resource} size={36} />
            <span className="font-bold text-amber-900 capitalize">{t(`resources.${resource}`, { defaultValue: resource })}</span>
            <span className="text-xs text-emerald-600">{t('craftsman.bonus')}</span>
          </button>
        ))}
      </div>

      {producibleTypes.length === 0 && (
        <p className="text-center text-amber-500 italic py-4">
          {t('craftsman.noneAvailable')}
        </p>
      )}
    </div>
  );
}
