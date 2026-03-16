import { useTranslation } from 'react-i18next';

export default function ProspectorPanel() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">🪙</div>
        <h2 className="text-lg font-bold text-amber-900 mb-2">{t('prospector.title')}</h2>
        <p className="text-sm text-amber-600">{t('prospector.collected')}</p>
      </div>
    </div>
  );
}
