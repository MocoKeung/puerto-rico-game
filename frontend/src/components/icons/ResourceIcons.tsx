import type { PlantationType } from '../../data/constants';

interface IconProps {
  size?: number;
  className?: string;
}

// ─── Circular token helper ─────────────────────────────────────────────────
// Every resource icon is a circular "game token" with a radial-gradient chip
// background and a clean, filled symbol inside. Uses a unique SVG gradient ID
// so multiple instances on the same page don't clash.

let _uid = 0;
function uid(prefix: string) {
  return `${prefix}-${++_uid}`;
}

export function CornIcon({ size = 24, className = '' }: IconProps) {
  const g = uid('corn');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
      </defs>
      {/* Token chip */}
      <circle cx="16" cy="16" r="15.5" fill="#78350f" opacity="0.35" />
      <circle cx="16" cy="16" r="14.5" fill={`url(#${g})`} />
      {/* Corn body */}
      <ellipse cx="16" cy="19.5" rx="4" ry="5.5" fill="#b45309" />
      <ellipse cx="16" cy="19" rx="3.2" ry="4.6" fill="#fcd34d" />
      {/* Kernel dots */}
      {([14.2, 16, 17.8] as number[]).flatMap((x, xi) =>
        ([16.5, 19, 21.5] as number[]).map((y, yi) => (
          <circle key={`k${xi}${yi}`} cx={x} cy={y} r="0.85" fill="#92400e" opacity="0.45" />
        ))
      )}
      {/* Husk */}
      <path d="M13.5 14.5 Q10.5 9.5 13.5 8 Q14.5 11 13.5 14.5Z" fill="#65a30d" />
      <path d="M18.5 14.5 Q21.5 9.5 18.5 8 Q17.5 11 18.5 14.5Z" fill="#4d7c0f" />
      <path d="M16 13 Q14 7.5 16 6.5 Q18 7.5 16 13Z" fill="#84cc16" />
      {/* Highlight */}
      <circle cx="12.5" cy="12.5" r="2.8" fill="white" opacity="0.18" />
    </svg>
  );
}

export function IndigoIcon({ size = 24, className = '' }: IconProps) {
  const g = uid('indigo');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="60%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#1e3a8a" opacity="0.4" />
      <circle cx="16" cy="16" r="14.5" fill={`url(#${g})`} />
      {/* Indigo dye crystal — three facets */}
      <polygon points="16,8 22,14 16,24 10,14" fill="#1d4ed8" opacity="0.5" />
      <polygon points="16,8 22,14 16,24" fill="#93c5fd" opacity="0.7" />
      <polygon points="16,8 10,14 16,24" fill="#bfdbfe" opacity="0.5" />
      <polygon points="16,8 22,14 16,15 10,14" fill="white" opacity="0.35" />
      <polygon points="16,8 22,14 16,14.5" fill="white" opacity="0.5" />
      {/* Highlight */}
      <circle cx="12.5" cy="12.5" r="2.8" fill="white" opacity="0.2" />
    </svg>
  );
}

export function SugarIcon({ size = 24, className = '' }: IconProps) {
  const g = uid('sugar');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#475569" opacity="0.3" />
      <circle cx="16" cy="16" r="14.5" fill={`url(#${g})`} />
      {/* Sugar crystal — isometric cube */}
      <polygon points="16,8 23,12 23,20 16,24 9,20 9,12" fill="#cbd5e1" />
      <polygon points="16,8 23,12 16,16 9,12" fill="#f8fafc" />
      <polygon points="23,12 23,20 16,24 16,16" fill="#94a3b8" />
      <polygon points="9,12 16,16 16,24 9,20" fill="#e2e8f0" />
      {/* Edge lines */}
      <line x1="16" y1="8" x2="16" y2="16" stroke="#94a3b8" strokeWidth="0.6" opacity="0.5" />
      <line x1="23" y1="12" x2="16" y2="16" stroke="#94a3b8" strokeWidth="0.6" opacity="0.5" />
      <line x1="9" y1="12" x2="16" y2="16" stroke="#94a3b8" strokeWidth="0.6" opacity="0.5" />
      {/* Highlight */}
      <circle cx="12.5" cy="12.5" r="2.8" fill="white" opacity="0.25" />
    </svg>
  );
}

export function TobaccoIcon({ size = 24, className = '' }: IconProps) {
  const g = uid('tobacco');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#14532d" opacity="0.35" />
      <circle cx="16" cy="16" r="14.5" fill={`url(#${g})`} />
      {/* Leaf */}
      <path d="M16 7 C22 9 24 14 22 20 C20 23 16 25 16 25 C16 25 12 23 10 20 C8 14 10 9 16 7Z" fill="#15803d" />
      <path d="M16 7 C19 9 20 14 18.5 19 C17.5 22 16 25 16 25 C14.5 22 13.5 19 12 15 C11 12 12 9 16 7Z" fill="#16a34a" />
      {/* Center vein */}
      <path d="M16 8 Q15.5 16 16 25" stroke="#14532d" strokeWidth="1" opacity="0.4" />
      {/* Side veins */}
      <path d="M15.8 13 Q13 15 11 17" stroke="#14532d" strokeWidth="0.7" opacity="0.35" />
      <path d="M16.2 13 Q19 15 21 17" stroke="#14532d" strokeWidth="0.7" opacity="0.35" />
      <path d="M15.8 17 Q13 18.5 11.5 20" stroke="#14532d" strokeWidth="0.7" opacity="0.35" />
      <path d="M16.2 17 Q19 18.5 20.5 20" stroke="#14532d" strokeWidth="0.7" opacity="0.35" />
      {/* Highlight */}
      <circle cx="12.5" cy="12.5" r="2.8" fill="white" opacity="0.18" />
    </svg>
  );
}

export function CoffeeIcon({ size = 24, className = '' }: IconProps) {
  const g = uid('coffee');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#1c0a00" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#1c0a00" opacity="0.4" />
      <circle cx="16" cy="16" r="14.5" fill={`url(#${g})`} />
      {/* Coffee bean — oval with center groove */}
      <ellipse cx="16" cy="16.5" rx="6" ry="7.5" fill="#451a03" />
      <ellipse cx="16" cy="16" rx="5.2" ry="6.8" fill="#78350f" />
      <ellipse cx="16" cy="16" rx="3.8" ry="5.4" fill="#92400e" />
      {/* Center groove */}
      <path d="M16 10 Q14.5 16 16 22" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bean sheen */}
      <ellipse cx="14" cy="13" rx="1.8" ry="2.5" fill="white" opacity="0.12" transform="rotate(-15,14,13)" />
      {/* Highlight */}
      <circle cx="12.5" cy="12.5" r="2.8" fill="white" opacity="0.15" />
    </svg>
  );
}

export function QuarryIcon({ size = 24, className = '' }: IconProps) {
  const g = uid('quarry');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#1e293b" opacity="0.35" />
      <circle cx="16" cy="16" r="14.5" fill={`url(#${g})`} />
      {/* Rock mountain silhouette */}
      <path d="M5 23 L10 14 L14 18 L16 11 L18 16 L21 12 L27 23 Z" fill="#475569" />
      <path d="M16 11 L18 16 L21 12 L27 23 L16 23 Z" fill="#64748b" />
      <path d="M5 23 L10 14 L14 18 L16 19 L16 23 Z" fill="#334155" />
      {/* Snow cap */}
      <path d="M16 11 L17.5 14.5 L14.5 14.5 Z" fill="white" opacity="0.55" />
      {/* Highlight */}
      <circle cx="12.5" cy="12.5" r="2.8" fill="white" opacity="0.2" />
    </svg>
  );
}

// ─── Token chips for player stats ─────────────────────────────────────────

export function ColonistIcon({ size = 24, className = '' }: IconProps) {
  const g = uid('col');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#78350f" opacity="0.35" />
      <circle cx="16" cy="16" r="14.5" fill={`url(#${g})`} />
      {/* Person silhouette */}
      <circle cx="16" cy="11.5" r="4" fill="#92400e" />
      <path d="M9 26 C9 20 12 17 16 17 C20 17 23 20 23 26 Z" fill="#92400e" />
      {/* Highlight */}
      <circle cx="12.5" cy="12.5" r="2.8" fill="white" opacity="0.18" />
    </svg>
  );
}

export function DoubloonIcon({ size = 24, className = '' }: IconProps) {
  const g = uid('dbl');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#78350f" opacity="0.35" />
      <circle cx="16" cy="16" r="14.5" fill={`url(#${g})`} />
      {/* Coin rim */}
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="#d97706" strokeWidth="1.5" opacity="0.6" />
      {/* Dollar sign */}
      <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fontFamily="Georgia,serif" fill="#92400e">$</text>
      {/* Highlight */}
      <circle cx="12.5" cy="12.5" r="2.8" fill="white" opacity="0.2" />
    </svg>
  );
}

export function VPIcon({ size = 24, className = '' }: IconProps) {
  const g = uid('vp');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#78350f" opacity="0.35" />
      <circle cx="16" cy="16" r="14.5" fill={`url(#${g})`} />
      {/* 5-point star */}
      <polygon
        points="16,7 18.4,13.6 25.5,13.6 19.8,17.8 22,24.4 16,20.4 10,24.4 12.2,17.8 6.5,13.6 13.6,13.6"
        fill="#92400e"
        opacity="0.6"
      />
      <polygon
        points="16,8.5 18.1,14.5 24.5,14.5 19.4,18.2 21.3,24.2 16,20.6 10.7,24.2 12.6,18.2 7.5,14.5 13.9,14.5"
        fill="#fef3c7"
      />
      {/* Highlight */}
      <circle cx="12.5" cy="12.5" r="2.8" fill="white" opacity="0.2" />
    </svg>
  );
}

export function ShipIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Hull */}
      <path d="M4 20 L6 14 L26 14 L28 20 Q16 27 4 20Z" fill="#92400e" />
      <path d="M6 14 L26 14 L28 20 Q16 26 4 20Z" fill="#b45309" opacity="0.7" />
      {/* Mast */}
      <line x1="16" y1="14" x2="16" y2="6" stroke="#78350f" strokeWidth="1.5" />
      {/* Sail */}
      <path d="M16 6 L24 11 L16 14Z" fill="#fef3c7" />
      <path d="M16 6 L8 11 L16 14Z" fill="#e5e7eb" opacity="0.7" />
      {/* Water line */}
      <path d="M2 21 Q8 24 16 22 Q24 20 30 23" stroke="#0369a1" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

// ─── Resource icon dispatcher ──────────────────────────────────────────────

const RESOURCE_ICONS: Record<string, React.FC<IconProps>> = {
  corn:    CornIcon,
  indigo:  IndigoIcon,
  sugar:   SugarIcon,
  tobacco: TobaccoIcon,
  coffee:  CoffeeIcon,
  quarry:  QuarryIcon,
};

export function ResourceIcon({
  type, size = 24, className = '',
}: { type: PlantationType } & IconProps) {
  const Icon = RESOURCE_ICONS[type];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
