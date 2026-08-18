'use client';

interface BrandIconProps {
  brand: string;
  color: string;
  size?: number;
}

function SamsungIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" fill={color} opacity="0.15" />
      <path d="M23.5 15.5c-1.5-.8-4-.7-4.8.7-.7 1.3.1 2.4 1.5 3l1.8.8c2.2 1 3.2 2.5 2.5 4.5-.8 2.3-3.5 3.2-6 2.4-1.2-.4-2.2-1.1-2.8-2l1.8-1.2c.5.7 1.3 1.1 2.2 1.2 1.4.2 2.5-.4 2.7-1.5.2-.9-.4-1.7-1.7-2.3l-1.7-.8c-2-1-2.8-2.4-2.3-4.2.6-2 2.9-3 5.4-2.5 1 .2 1.9.7 2.5 1.4l-1.8 1.5z" fill={color} />
    </svg>
  );
}

function AppleIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" fill={color} opacity="0.12" />
      <path d="M25 8.5c-1.1 1.3-2.8 2.3-4.5 2.1-.2-1.7.6-3.5 1.6-4.6 1.2-1.3 3-2.3 4.5-2.3.2 1.7-.5 3.5-1.6 4.8z" fill={color} />
      <path d="M27.2 22.4c-.4 1-.8 1.8-1.4 2.6-.8 1.1-1.6 2.2-2.9 2.2-1.2 0-1.6-.8-3-.8-1.4 0-1.9.8-3.1.8-1.2 0-2-1-2.8-2.1-2.1-2.9-3.7-7.8-1.5-11.3 1-1.7 2.9-2.7 4.7-2.7 1.3 0 2.4.8 3.2.8s2.4-.9 3.9-.8c.7.1 2.5.3 3.7 2-.1 0-2.2 1.3-2.2 3.8 0 2.9 2.6 4 2.9 4z" fill={color} />
    </svg>
  );
}

function TecnoIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="6" fill={color} opacity="0.12" />
      <rect x="9" y="11" width="22" height="4" rx="2" fill={color} />
      <rect x="18" y="11" width="4" height="18" rx="2" fill={color} />
    </svg>
  );
}

function InfinixIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="6" fill={color} opacity="0.12" />
      <line x1="11" y1="11" x2="29" y2="29" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <line x1="29" y1="11" x2="11" y2="29" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function XiaomiIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="8" fill={color} opacity="0.12" />
      <rect x="8" y="13" width="4" height="14" rx="2" fill={color} />
      <rect x="8" y="13" width="24" height="4" rx="2" fill={color} />
      <rect x="18" y="13" width="4" height="14" rx="2" fill={color} />
      <rect x="28" y="13" width="4" height="14" rx="2" fill={color} />
    </svg>
  );
}

function HPIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" fill={color} opacity="0.12" />
      <rect x="8" y="12" width="3.5" height="16" rx="1.5" fill={color} />
      <rect x="8" y="18" width="10" height="3.5" rx="1.5" fill={color} />
      <rect x="14.5" y="12" width="3.5" height="16" rx="1.5" fill={color} />
      <rect x="21" y="12" width="3.5" height="16" rx="1.5" fill={color} />
      <rect x="21" y="12" width="8" height="3.5" rx="1.5" fill={color} />
      <rect x="25.5" y="12" width="3.5" height="8" rx="1.5" fill={color} />
      <rect x="21" y="16.5" width="8" height="3.5" rx="1.5" fill={color} />
    </svg>
  );
}

function LenovoIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="32" height="32" rx="6" fill={color} opacity="0.12" />
      <rect x="10" y="10" width="4" height="18" rx="2" fill={color} />
      <rect x="10" y="24" width="20" height="4" rx="2" fill={color} />
    </svg>
  );
}

function SonyIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="16" fill={color} opacity="0.12" />
      <path d="M25 17c-1.2-.7-3.3-.6-3.9.6-.6 1 .1 2 1.2 2.5l1.5.7c1.8.8 2.6 2.1 2 3.7-.7 1.9-2.9 2.6-4.9 2-.9-.3-1.7-.9-2.3-1.7l1.5-1c.4.6 1 .9 1.8 1 1.1.2 2-.3 2.2-1.2.1-.7-.4-1.4-1.4-1.9l-1.4-.6c-1.6-.8-2.3-2-1.9-3.5.5-1.7 2.4-2.5 4.5-2.1.8.2 1.5.6 2 1.1L25 17z" fill={color} />
    </svg>
  );
}

const BRAND_ICONS: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  samsung:  SamsungIcon,
  apple:    AppleIcon,
  tecno:    TecnoIcon,
  infinix:  InfinixIcon,
  xiaomi:   XiaomiIcon,
  hp:       HPIcon,
  lenovo:   LenovoIcon,
  sony:     SonyIcon,
};

export default function BrandIcon({ brand, color, size = 40 }: BrandIconProps) {
  const IconComp = BRAND_ICONS[brand.toLowerCase()];
  if (!IconComp) {
    return (
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, fontSize: size * 0.45, fontWeight: 900, color,
      }}>
        {brand.charAt(0).toUpperCase()}
      </span>
    );
  }
  return <IconComp color={color} size={size} />;
}
