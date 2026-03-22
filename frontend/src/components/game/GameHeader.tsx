import { Crown, Swords } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useGameEngine from '../../store/gameEngine';
import LanguageToggle from '../ui/LanguageToggle';

export default function GameHeader() {
  const { t } = useTranslation();
  const { round, phase, governorSeat, activePlayerSeat, players, rolePickerSeat } = useGameEngine();
  const governor = players[governorSeat];
  const activePlayer = players[activePlayerSeat];
  const rolePicker = players[rolePickerSeat];

  const phaseLabel = t(`roles.${phase}`, { defaultValue: phase });
  const isYourTurn = activePlayer?.isHuman;

  return (
    <header className="flex-shrink-0 bg-wood shadow-[0_2px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)',
        }}
      />

      <div className="relative max-w-screen-xl mx-auto px-4 py-2.5 flex items-center gap-3">

        {/* Left: title + round */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="font-cinzel font-bold text-[#f0a830] text-lg tracking-widest uppercase leading-none">
              Puerto Rico
            </h1>
          </div>
          <div className="h-4 w-px bg-[#c9870c]/40" />
          <span className="font-cinzel font-bold text-[#f0a830] text-sm">
            {t('common.round', { n: round })}
          </span>
        </div>

        {/* Center: phase pill */}
        <div className="flex items-center gap-2 mx-auto">
          <div className="flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: 'rgba(201,135,12,0.25)', border: '1px solid rgba(201,135,12,0.5)' }}>
            <Swords size={13} className="text-[#f0a830]" />
            <span className="text-[10px] text-[#f0a830]/80 font-cinzel tracking-[0.15em] uppercase">
              {t('common.phase')}
            </span>
            <span className="font-cinzel font-bold text-[#f5d080] text-sm">{phaseLabel}</span>
          </div>
          {phase !== 'role_selection' && phase !== 'game_over' && rolePicker && (
            <div className="text-xs text-white/45 font-crimson italic hidden sm:block">
              by <span className="text-white/65 not-italic font-semibold">{rolePicker.name}</span>
            </div>
          )}
        </div>

        {/* Right: governor + turn + language toggle */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {governor && (
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <Crown size={13} className="text-[#f0a830]" strokeWidth={2.5} />
              <span className="font-crimson text-sm text-white/65">{governor.name}</span>
            </div>
          )}

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          {isYourTurn ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f0a830] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f0a830]" />
              </span>
              <span className="font-cinzel font-bold text-[#f0a830] text-xs tracking-wide uppercase">
                {t('common.yourTurn')}
              </span>
            </div>
          ) : (
            <span className="text-white/70 font-crimson text-sm italic hidden md:block">
              {t('common.turn', { name: activePlayer?.name })}
            </span>
          )}

          <LanguageToggle variant="dark" />
        </div>
      </div>
    </header>
  );
}
