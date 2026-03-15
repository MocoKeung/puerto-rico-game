import type { ResourceType, PlantationType } from '../../data/constants';

interface IconProps {
  size?: number;
  className?: string;
}

export function CornIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path d="M12 2C10 6 8 10 8 14c0 4 2 8 4 8s4-4 4-8c0-4-2-8-4-12z" fill="#eab308" />
      <path d="M10 8c-2 1-3 3-3 5s1 3 3 3M14 8c2 1 3 3 3 5s-1 3-3 3" stroke="#ca8a04" strokeWidth="1" />
      <path d="M12 2v20" stroke="#65a30d" strokeWidth="1.5" />
    </svg>
  );
}

export function IndigoIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="8" fill="#3b82f6" />
      <circle cx="12" cy="12" r="5" fill="#60a5fa" />
      <circle cx="12" cy="12" r="2.5" fill="#93c5fd" />
    </svg>
  );
}

export function SugarIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <rect x="5" y="5" width="14" height="14" rx="3" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
      <rect x="8" y="8" width="8" height="8" rx="1" fill="#e5e7eb" />
      <circle cx="10" cy="10" r="1" fill="#d1d5db" />
      <circle cx="14" cy="14" r="1" fill="#d1d5db" />
    </svg>
  );
}

export function TobaccoIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path d="M12 3C8 3 6 7 6 11c0 3 2 6 4 8l2 2 2-2c2-2 4-5 4-8 0-4-2-8-6-8z" fill="#22c55e" />
      <path d="M12 5v14" stroke="#15803d" strokeWidth="1.5" />
      <path d="M9 8l3 2M15 8l-3 2M9 12l3 2M15 12l-3 2" stroke="#15803d" strokeWidth="0.8" />
    </svg>
  );
}

export function CoffeeIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <ellipse cx="12" cy="13" rx="7" ry="6" fill="#78350f" />
      <ellipse cx="12" cy="13" rx="5" ry="4" fill="#92400e" />
      <path d="M12 7v12" stroke="#451a03" strokeWidth="1.5" />
      <path d="M8 10c1-1 3-2 4-2s3 1 4 2" stroke="#451a03" strokeWidth="0.8" />
    </svg>
  );
}

export function QuarryIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 20l8-16 8 16H4z" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
      <path d="M12 4l3 6h-6l3-6z" fill="#6b7280" />
      <circle cx="10" cy="15" r="1" fill="#4b5563" />
      <circle cx="14" cy="13" r="1.2" fill="#4b5563" />
    </svg>
  );
}

export function ColonistIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="8" r="4" fill="#92400e" />
      <path d="M6 22c0-4 3-7 6-7s6 3 6 7" fill="#92400e" />
    </svg>
  );
}

export function DoubloonIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7" fill="#fbbf24" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e">$</text>
    </svg>
  );
}

export function VPIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
    </svg>
  );
}

export function ShipIcon({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <path d="M2 16l3-8h14l3 8H2z" fill="#92400e" />
      <path d="M4 8V6h2V4h12v2h2v2" stroke="#78350f" strokeWidth="1" fill="#b45309" />
      <path d="M12 4V1" stroke="#6b7280" strokeWidth="1.5" />
      <path d="M12 1l6 3H12V1z" fill="#dc2626" />
      <path d="M1 16c3 3 6 4 11 4s8-1 11-4" stroke="#0c4a6e" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// Resource icon dispatcher
const RESOURCE_ICONS: Record<string, React.FC<IconProps>> = {
  corn: CornIcon,
  indigo: IndigoIcon,
  sugar: SugarIcon,
  tobacco: TobaccoIcon,
  coffee: CoffeeIcon,
  quarry: QuarryIcon,
};

export function ResourceIcon({ type, size = 24, className = '' }: { type: PlantationType } & IconProps) {
  const Icon = RESOURCE_ICONS[type];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
