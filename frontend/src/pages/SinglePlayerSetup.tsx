import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Swords, Users, Target, Clock, ChevronRight } from 'lucide-react';
import useGameEngine from '../store/gameEngine';
import type { Difficulty } from '../data/constants';
import LanguageToggle from '../components/ui/LanguageToggle';

export default function SinglePlayerSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const initGame = useGameEngine(s => s.initGame);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  function handleStart() {
    initGame(difficulty);
    navigate('/local/play');
  }

  return (
    <div className="min-h-screen bg-ocean-pattern flex flex-col">

      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(201,135,12,0.2)' }}
      >
        <h1 className="font-cinzel font-black text-[#f0a830] text-lg tracking-widest uppercase">
          Puerto Rico
        </h1>
        <LanguageToggle variant="dark" />
      </header>

      {/* Main centered content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
          style={{ background: '#f5e6c8', border: '2px solid rgba(201,135,12,0.4)' }}
        >
          {/* Inner gold border */}
          <div className="absolute inset-[6px] rounded-[18px] pointer-events-none z-10"
            style={{ border: '1px solid rgba(201,135,12,0.25)' }} />

          {/* Top accent stripe */}
          <div className="h-1.5 bg-gradient-to-r from-[#2d6a4f] via-[#c9870c] to-[#1e3a5f]" />

          <div className="relative z-20 px-6 sm:px-8 py-7 sm:py-9">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                style={{ background: 'linear-gradient(135deg, #c9870c22, #c9870c44)', border: '1px solid rgba(201,135,12,0.4)' }}
              >
                <Swords size={22} className="text-[#c9870c]" strokeWidth={1.5} />
              </div>
              <h2 className="font-cinzel font-black text-[#3d1f0a] text-3xl tracking-wide mb-1">
                {t('setup.title')}
              </h2>
              <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#c9870c] to-transparent my-3" />
              <p className="font-crimson text-[#5a2e10]/75 text-base italic">
                {t('setup.subtitle')}
              </p>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <p className="font-cinzel text-[10px] text-[#5a2e10]/60 uppercase tracking-[0.22em] mb-3">
                {t('setup.difficulty')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(['easy', 'medium'] as Difficulty[]).map(d => {
                  const isSelected = difficulty === d;
                  const color = d === 'easy' ? '#2d6a4f' : '#c9870c';
                  return (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`p-4 rounded-2xl text-left transition-all duration-200 ${isSelected ? 'shadow-md scale-[1.02]' : 'hover:scale-[1.01]'}`}
                      style={{
                        border: isSelected ? `2px solid ${color}` : '2px solid rgba(61,31,10,0.12)',
                        background: isSelected ? `${color}18` : 'rgba(61,31,10,0.03)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: isSelected ? color : 'rgba(61,31,10,0.2)' }} />
                        <span className="font-cinzel font-bold text-[#3d1f0a] text-sm capitalize">
                          {d === 'easy' ? t('setup.easy') : t('setup.medium')}
                        </span>
                      </div>
                      <p className="font-crimson text-[#5a2e10]/65 text-xs leading-snug pl-4">
                        {d === 'easy' ? t('setup.easyDesc') : t('setup.mediumDesc')}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game info */}
            <div
              className="rounded-2xl p-4 mb-7 space-y-2"
              style={{ background: 'rgba(61,31,10,0.05)', border: '1px solid rgba(61,31,10,0.08)' }}
            >
              <InfoRow icon={<Users size={13} className="text-[#5a2e10]/60" strokeWidth={2} />} text={t('setup.players')} />
              <InfoRow icon={<Target size={13} className="text-[#5a2e10]/60" strokeWidth={2} />} text={t('setup.objective')} />
              <InfoRow icon={<Clock size={13} className="text-[#5a2e10]/60" strokeWidth={2} />} text={t('setup.duration')} />
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl font-cinzel font-bold text-white text-base tracking-wide transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #b8760a 0%, #f0a830 50%, #b8760a 100%)',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              {t('setup.begin')}
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>

            <button
              onClick={() => navigate('/lobby')}
              className="w-full mt-3 py-2 font-crimson text-[#5a2e10]/50 hover:text-[#5a2e10] text-sm transition-colors italic"
            >
              {t('setup.back')}
            </button>
          </div>

          {/* Bottom accent stripe */}
          <div className="h-1 bg-gradient-to-r from-[#1e3a5f] via-[#c9870c] to-[#2d6a4f]" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <span className="font-crimson text-[#3d1f0a]/75 text-sm">{text}</span>
    </div>
  );
}
