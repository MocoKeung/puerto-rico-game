import { Coins, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useGameEngine from '../../../store/gameEngine';
import { ResourceIcon } from '../../icons/ResourceIcons';
import { RESOURCE_ORDER, RESOURCE_LABELS, TRADE_PRICES } from '../../../data/constants';

export default function TraderPanel() {
  const { t } = useTranslation();
  const { tradingHouse, traderSellGood, traderPass, waitingForHuman,
          players, activePlayerSeat, rolePickerSeat } = useGameEngine();
  const player = players[activePlayerSeat];

  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-bounce mb-3"><Coins size={40} className="text-amber-500 mx-auto" strokeWidth={1.5} /></div>
          <p className="text-amber-600 font-medium">{t('trader.opponentTrading', { name: player?.name })}</p>
        </div>
      </div>
    );
  }

  const humanPlayer = players[0];
  const isTrader = activePlayerSeat === rolePickerSeat;
  const hasSmallMarket = humanPlayer.buildings.some(b => b.def.id === 'small_market' && b.colonists > 0);
  const hasLargeMarket = humanPlayer.buildings.some(b => b.def.id === 'large_market' && b.colonists > 0);
  const hasOffice = humanPlayer.buildings.some(b => b.def.id === 'office' && b.colonists > 0);
  const houseFull = tradingHouse.every(s => s !== null);

  const tradeBonus = (isTrader ? 1 : 0) + (hasSmallMarket ? 1 : 0) + (hasLargeMarket ? 2 : 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2"><Store size={18} strokeWidth={2} />{t('trader.title')}</h2>
          <p className="text-sm text-amber-600">
            {t('trader.instructions')}
            {tradeBonus > 0 && (
              <strong> {tradeBonus === 1 ? t('trader.bonus', { n: tradeBonus }) : t('trader.bonusPlural', { n: tradeBonus })}</strong>
            )}
          </p>
        </div>
        <button
          onClick={() => traderPass(0)}
          className="px-4 py-2 border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
        >
          {t('common.pass')}
        </button>
      </div>

      {/* Trading House */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4 mb-4">
        <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
          {t('trader.tradingHouse', { filled: tradingHouse.filter(s => s !== null).length })}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {tradingHouse.map((slot, i) => (
            <div
              key={i}
              className={`h-16 rounded-lg border-2 border-dashed flex items-center justify-center ${
                slot ? 'border-amber-300 bg-amber-100' : 'border-amber-200 bg-white'
              }`}
            >
              {slot ? (
                <div className="flex flex-col items-center">
                  <ResourceIcon type={slot} size={24} />
                  <span className="text-[10px] text-amber-600 capitalize">{t(`resources.${slot}`, { defaultValue: slot })}</span>
                </div>
              ) : (
                <span className="text-amber-300 text-xs">{t('common.empty')}</span>
              )}
            </div>
          ))}
        </div>
        {houseFull && (
          <p className="mt-2 text-xs text-red-500 font-medium">{t('trader.houseFull')}</p>
        )}
      </div>

      {/* Your goods to sell */}
      <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">{t('trader.yourGoods')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {RESOURCE_ORDER.map(resource => {
          const qty = humanPlayer.goods[resource];
          const inHouse = tradingHouse.includes(resource);
          const canSell = qty > 0 && !houseFull && (!inHouse || hasOffice);
          const price = TRADE_PRICES[resource] + tradeBonus;

          return (
            <button
              key={resource}
              onClick={() => canSell && traderSellGood(0, resource)}
              disabled={!canSell}
              className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                canSell
                  ? 'border-amber-200 bg-white hover:border-emerald-400 hover:shadow-md cursor-pointer'
                  : 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ResourceIcon type={resource} size={24} />
                <span className="font-bold text-amber-900">{t(`resources.${resource}`, { defaultValue: RESOURCE_LABELS[resource] })}</span>
                <span className="text-xs text-amber-500">×{qty}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-emerald-600 font-bold">{t('trader.price', { price })}</span>
                {tradeBonus > 0 && (
                  <span className="text-[10px] text-amber-400">{t('trader.priceBreakdown', { base: TRADE_PRICES[resource], bonus: tradeBonus })}</span>
                )}
              </div>
              {inHouse && !hasOffice && (
                <p className="text-[10px] text-red-400 mt-1">{t('trader.alreadyInHouse')}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
