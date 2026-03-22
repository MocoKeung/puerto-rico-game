import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useGameEngine from '../../../store/gameEngine';
import RoleCard from '../RoleCard';

export default function RoleSelectionPanel() {
  const { t } = useTranslation();
  const { roles, selectRole, waitingForHuman } = useGameEngine();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => { if (el) el.removeEventListener('scroll', updateScrollState); };
  }, [roles]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#c9870c]/40 border-t-[#c9870c] animate-spin" />
          <p className="text-[#5a2e10] font-cinzel text-sm tracking-wide">
            {t('roleSelection.opponentChoosing')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9870c]/60" />
          <h2 className="font-cinzel text-3xl font-black text-[#3d1f0a] tracking-wide">
            {t('roleSelection.chooseRole')}
          </h2>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9870c]/60" />
        </div>
        <p className="font-crimson text-base text-[#5a2e10]/75 italic">
          {t('roleSelection.subtitle')}
        </p>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#3d1f0a]/80 text-white/90 flex items-center justify-center shadow-lg hover:bg-[#3d1f0a] transition-colors -ml-2"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#3d1f0a]/80 text-white/90 flex items-center justify-center shadow-lg hover:bg-[#3d1f0a] transition-colors -mr-2"
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Left fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-parchment to-transparent z-10 pointer-events-none" />
        )}

        {/* Right fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-parchment to-transparent z-10 pointer-events-none" />
        )}

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2 snap-x snap-mandatory justify-center"
        >
          {roles.map((role, i) => (
            <div key={role.type} className="snap-center">
              <RoleCard
                role={role}
                disabled={!role.available}
                onSelect={() => selectRole(0, role.type)}
                animationDelay={i * 60}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
