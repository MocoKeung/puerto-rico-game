import { useTranslation } from 'react-i18next';

export default function MayorPanel() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-4xl mb-3">👑</div>
        <h2 className="text-lg font-bold text-amber-900 mb-2">{t('mayor.title')}</h2>
        <p className="text-sm text-amber-600 max-w-md">
          {t('mayor.distributed')}{' '}
          {t('mayor.checkBoard')}
        </p>
      </div>
    </div>
  );
}
