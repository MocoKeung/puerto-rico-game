import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  /** Visual variant: 'dark' for use on wood/dark backgrounds, 'light' for parchment */
  variant?: 'dark' | 'light';
  className?: string;
}

export default function LanguageToggle({ variant = 'dark', className = '' }: LanguageToggleProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const toggle = () => {
    const next = isZh ? 'en' : 'zh';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  const base =
    variant === 'dark'
      ? 'bg-white/10 border-white/20 hover:bg-white/20'
      : 'bg-black/8 border-[#c9870c]/30 hover:bg-[#c9870c]/15';

  const activeColor   = variant === 'dark' ? 'text-[#f0a830] font-bold' : 'text-[#3d1f0a] font-bold';
  const inactiveColor = variant === 'dark' ? 'text-white/35'             : 'text-[#5a2e10]/40';
  const divider       = variant === 'dark' ? 'text-white/20'             : 'text-[#c9870c]/30';

  return (
    <button
      onClick={toggle}
      className={`
        flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-cinzel
        transition-all duration-150 tracking-wider
        ${base} ${className}
      `}
      title={isZh ? 'Switch to English' : '切换为中文'}
      aria-label="Toggle language"
    >
      <span className={isZh ? inactiveColor : activeColor}>EN</span>
      <span className={divider}>|</span>
      <span className={isZh ? activeColor : inactiveColor}>中</span>
    </button>
  );
}
