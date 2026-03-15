import type { RoleState } from '../../store/gameEngine';
import type { RoleType } from '../../data/constants';

// ── Per-role visual config ──────────────────────────────────────────────────

const ROLE_CONFIG: Record<RoleType, {
  label: string;
  artGradient: string;
  borderColor: string;
  badgeBg: string;
  watermark: string;
  privilege: string;
  action: string;
}> = {
  settler: {
    label: 'Settler',
    artGradient: 'from-[#1a5c35] via-[#2d8a52] to-[#5ab07a]',
    borderColor: '#2d6a4f',
    badgeBg: 'bg-[#2d6a4f]',
    watermark: '🗺️',
    privilege: 'TAKE A QUARRY instead of a Plantation tile (if available).',
    action:    'Starting with you, each player takes one face-up PLANTATION tile.',
  },
  builder: {
    label: 'Builder',
    artGradient: 'from-[#1a3060] via-[#2a5aab] to-[#4a8ad4]',
    borderColor: '#1e3a5f',
    badgeBg: 'bg-[#1e3a5f]',
    watermark: '📐',
    privilege: 'BUILD at a DISCOUNT of 1 doubloon.',
    action:    'Starting with you, each player may buy one BUILDING from the supply.',
  },
  mayor: {
    label: 'Mayor',
    artGradient: 'from-[#4a1d7a] via-[#7c3fc0] to-[#a870e8]',
    borderColor: '#4a1d7a',
    badgeBg: 'bg-[#4a1d7a]',
    watermark: '👑',
    privilege: 'TAKE 1 EXTRA COLONIST from the colonist supply.',
    action:    'Distribute all COLONISTS from the ship; each player gets their share, then refill ship.',
  },
  craftsman: {
    label: 'Craftsman',
    artGradient: 'from-[#7a3010] via-[#c05020] to-[#e08040]',
    borderColor: '#7a3010',
    badgeBg: 'bg-[#7a3010]',
    watermark: '⚒️',
    privilege: 'PRODUCE 1 EXTRA GOOD of your choice (after production).',
    action:    'Each player PRODUCES GOODS from their colonized production buildings.',
  },
  captain: {
    label: 'Captain',
    artGradient: 'from-[#0a3d5c] via-[#0e6b9e] to-[#2090c0]',
    borderColor: '#0a3d5c',
    badgeBg: 'bg-[#0a3d5c]',
    watermark: '⚓',
    privilege: 'EARN 1 EXTRA VP when shipping goods this phase.',
    action:    'Starting with you, each player MUST ship goods on cargo ships to earn Victory Points.',
  },
  trader: {
    label: 'Trader',
    artGradient: 'from-[#6b4500] via-[#b07820] to-[#d4a840]',
    borderColor: '#6b4500',
    badgeBg: 'bg-[#6b4500]',
    watermark: '⚖️',
    privilege: 'EARN 1 EXTRA DOUBLOON when selling a good this phase.',
    action:    'Starting with you, each player may SELL ONE GOOD to the trading house.',
  },
  prospector: {
    label: 'Prospector',
    artGradient: 'from-[#3a3a3a] via-[#606060] to-[#909090]',
    borderColor: '#3a3a3a',
    badgeBg: 'bg-[#3a3a3a]',
    watermark: '💎',
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
      <div
        className={`relative h-[110px] bg-gradient-to-b ${cfg.artGradient} flex items-center justify-center overflow-hidden`}
      >
        {/* Role badge — diamond shape, top-left */}
        <div
          className={`absolute top-2 left-2 w-9 h-9 ${cfg.badgeBg} badge-diamond flex items-center justify-center shadow-md z-10`}
          style={{ border: '1.5px solid rgba(201,135,12,0.6)' }}
        >
          <span className="text-[14px] -rotate-0">{cfg.watermark}</span>
        </div>

        {/* Large watermark */}
        <span className="text-[72px] opacity-[0.18] select-none">
          {cfg.watermark}
        </span>

        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
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
          <span className="bg-black/60 text-white text-[10px] font-cinzel px-3 py-1 rounded-full tracking-wider uppercase">
            Taken
          </span>
        </div>
      )}
    </div>
  );
}
