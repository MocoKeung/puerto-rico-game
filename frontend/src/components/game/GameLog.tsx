import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '../../contexts/GameContext';

interface GameLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameLog({ isOpen, onClose }: GameLogProps) {
  const { t } = useTranslation();
  const gameLog = useGameContext(s => s.gameLog);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameLog, isOpen]);

  return (
    <>
      {isOpen && (
        <div className="absolute inset-0 bg-black/40 z-20 backdrop-blur-[1px]" onClick={onClose} />
      )}

      <div
        className={`
          absolute top-0 right-0 h-full w-72 sm:w-80
          flex flex-col
          shadow-[-6px_0_24px_rgba(0,0,0,0.4)]
          transform transition-transform duration-300 ease-in-out
          z-30
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ background: '#f5e6c8', borderLeft: '1px solid rgba(201,135,12,0.35)' }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 px-4 py-3 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #3d1f0a, #5a2e10)',
            borderBottom: '1px solid rgba(201,135,12,0.3)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">📜</span>
            <h2 className="font-cinzel font-bold text-[#f0a830] text-sm tracking-wider uppercase">
              {t('log.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#c9870c]/60 hover:text-[#f0a830] hover:bg-white/10 transition-colors text-sm font-bold"
            aria-label="Close log"
          >
            ✕
          </button>
        </div>

        <div className="h-px flex-shrink-0 bg-gradient-to-r from-transparent via-[#c9870c]/50 to-transparent" />

        {/* Entries */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1">
          {gameLog.length === 0 ? (
            <p className="text-center text-xs font-crimson italic text-[#5a2e10]/40 py-6">
              {t('log.noEvents')}
            </p>
          ) : (
            gameLog.map((entry, i) => (
              <div
                key={i}
                className={`
                  text-xs px-2.5 py-1.5 rounded-lg font-crimson leading-snug
                  ${entry.seat === null
                    ? 'bg-amber-100/80 text-amber-800 border border-amber-200/60 font-semibold'
                    : entry.seat === 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40'
                      : 'text-[#5a2e10]/65 border-b border-[#c9870c]/10'}
                `}
              >
                {entry.message}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex-shrink-0 px-4 py-2 text-[10px] font-cinzel text-[#c9870c]/50 border-t tracking-wider"
          style={{ borderColor: 'rgba(201,135,12,0.2)' }}
        >
          {t(gameLog.length === 1 ? 'log.events_one' : 'log.events_other', { count: gameLog.length })}
        </div>
      </div>
    </>
  );
}
