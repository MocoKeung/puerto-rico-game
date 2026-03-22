import { useTranslation } from 'react-i18next';
import type { RoleState } from '../../store/gameEngine';
import type { RoleType } from '../../data/constants';

// ── Per-role visual config ──────────────────────────────────────────────────

const ROLE_CONFIG: Record<RoleType, {
  label: string;
  borderColor: string;
  badgeBg: string;
  watermark: string;
  image: string;
  privilege: string;
  action: string;
}> = {
  settler: {
    label: 'Settler',
    borderColor: '#2d6a4f',
    badgeBg: 'bg-[#2d6a4f]',
    watermark: '🗺️',
    image: '/images/roles/Settler.png',
    privilege: 'TAKE A QUARRY instead of a Plantation tile (if available).',
    action:    'Starting with you, each player takes one face-up PLANTATION tile.',
  },
  builder: {
    label: 'Builder',
    borderColor: '#1e3a5f',
    badgeBg: 'bg-[#1e3a5f]',
    watermark: '📐',
    image: '/images/roles/Builder.png',
    privilege: 'BUILD at a DISCOUNT of 1 doubloon.',
    action:    'Starting with you, each player may buy one BUILDING from the supply.',
  },
  mayor: {
    label: 'Mayor',
    borderColor: '#4a1d7a',
    badgeBg: 'bg-[#4a1d7a]',
    watermark: '👑',
    image: '/images/roles/Mayor.png',
    privilege: 'TAKE 1 EXTRA COLONIST from the colonist supply.',
    action:    'Distribute all COLONISTS from the ship; each player gets their share, then refill ship.',
  },
  craftsman: {
    label: 'Craftsman',
    borderColor: '#7a3010',
    badgeBg: 'bg-[#7a3010]',
    watermark: '⚒️',
    image: '/images/roles/Craftman.png',
    privilege: 'PRODUCE 1 EXTRA GOOD of your choice (after production).',
    action:    'Each player PRODUCES GOODS from their colonized production buildings.',
  },
  captain: {
    label: 'Captain',
    borderColor: '#0a3d5c',
    badgeBg: 'bg-[#0a3d5c]',
    watermark: '⚓',
    image: '/images/roles/Captain.png',
    privilege: 'EARN 1 EXTRA VP when shipping goods this phase.',
    action:    'Starting with you, each player MUST ship goods on cargo ships to earn Victory Points.',
  },
  trader: {
    label: 'Trader',
    borderColor: '#6b4500',
    badgeBg: 'bg-[#6b4500]',
    watermark: '⚖️',
    image: '/images/roles/Trader.png',
    privilege: 'EARN 1 EXTRA DOUBLOON when selling a good this phase.',
    action:    'Starting with you, each player may SELL ONE GOOD to the trading house.',
  },
  prospector: {
    label: 'Prospector',
    borderColor: '#3a3a3a',
    badgeBg: 'bg-[#3a3a3a]',
    watermark: '💎',
    image: '/images/roles/Prospector.png',
    privilege: 'COLLECT 1 DOUBLOON from the bank (privilege only — no action for others).',
    action:    'No action for other players.',
  },
};

// ── Component ───────────────────────────────────────────────────────────────

interface RoleCardProps {
  role: RoleState;
  onSelect: () => void;
  disabled: boolean;
  animationDelay?: number;
}

export default function RoleCard({ role, onSelect, disabled, animationDelay = 0 }: RoleCardProps) {
  const { t } = useTranslation();
  const cfg = ROLE_CONFIG[role.type];

  return (
    <div
      onClick={() => !disabled && onSelect()}
      className={`
        relative flex-shrink-0 w-[185px] rounded-xl overflow-hidden
        border-2 select-none
        transition-all duration-300 ease-out
        animate-card-in
        ${disabled
          ? 'opacity-40 cursor-not-allowed grayscale'
          : 'cursor-pointer hover:-translate-y-3 hover:scale-[1.04] card-glow'
        }
      `}
      style={{
        borderColor: cfg.borderColor,
        animationDelay: `${animationDelay}ms`,
        boxShadow: disabled ? 'none' : `0 4px 20px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Inner gold border overlay */}
      <div
        className="absolute inset-[5px] rounded-[6px] pointer-events-none z-10"
        style={{ border: '1px solid rgba(201,135,12,0.45)' }}
      />

      {/* ── Title area ─────────────────────────────────────────────── */}
      <div
        className="relative px-3 pt-3 pb-2 text-center"
        style={{ background: `linear-gradient(180deg, ${cfg.borderColor}ee, ${cfg.borderColor}bb)` }}
      >
        {/* Bonus doubloons badge */}
        {role.bonusDoubloons > 0 && !disabled && (
          <div className="absolute -top-1.5 right-2 z-20 flex items-center gap-0.5 bg-[#c9870c] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md font-cinzel">
            +{role.bonusDoubloons} 💰
          </div>
        )}
        <p className="text-[9px] text-white/60 font-cinzel tracking-[0.2em] uppercase">Puerto Rico</p>
        <h3 className="text-white font-cinzel font-bold text-[15px] tracking-wide leading-tight mt-0.5">
          {cfg.label}
        </h3>
      </div>

      {/* ── Art area ───────────────────────────────────────────────── */}
      <div className="relative h-[200px] overflow-hidden flex items-center justify-center bg-black/30">
        {/* Role image */}
        <img
          src={cfg.image}
          alt={cfg.label}
          className="w-full h-full object-contain"
        />

        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* ── Divider ────────────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9870c]/60 to-transparent" />

      {/* ── Bottom parchment section ───────────────────────────────── */}
      <div className="bg-parchment px-3 py-2.5 space-y-2">

        {/* Privilege row */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#c9870c] flex items-center justify-center shadow-sm mt-0.5">
            <span className="text-white font-cinzel font-bold text-[9px]">P</span>
          </div>
          <div>
            <p className="text-[8px] font-bold text-[#5a2e10] uppercase tracking-wide font-cinzel leading-none mb-0.5">
              Privilege <span className="text-[7px] font-normal normal-case tracking-normal">(for me)</span>
            </p>
            <p className="text-[9px] text-[#3d1f0a] font-crimson leading-tight">
              {cfg.privilege}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#c9870c]/20" />

        {/* Action row */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#8a8a8a] flex items-center justify-center shadow-sm mt-0.5">
            <span className="text-white font-cinzel font-bold text-[9px]">A</span>
          </div>
          <div>
            <p className="text-[8px] font-bold text-[#5a2e10] uppercase tracking-wide font-cinzel leading-none mb-0.5">
              Action <span className="text-[7px] font-normal normal-case tracking-normal">(for all)</span>
            </p>
            <p className="text-[9px] text-[#3d1f0a] font-crimson leading-tight">
              {cfg.action}
            </p>
          </div>
        </div>
      </div>

      {/* ── Taken overlay ──────────────────────────────────────────── */}
      {disabled && role.selectedBySeat !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
          <span className="bg-black/60 text-white text-xs font-cinzel px-4 py-1.5 rounded-full tracking-wider uppercase">
            {t('roleSelection.taken', { defaultValue: 'Taken' })}
          </span>
        </div>
      )}
    </div>
  );
}
