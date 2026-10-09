import React from 'react';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width="44" height="44" viewBox="0 0 120 120" fill="none" aria-label="ASK MOTORS logo" style={{ flex: 'none', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))', ...style }}>
    <defs>
      <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e2026"/>
        <stop offset="45%" stopColor="#111216"/>
        <stop offset="100%" stopColor="#08090b"/>
      </linearGradient>
      <linearGradient id="chromeBezel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="25%" stopColor="#d0d4dc"/>
        <stop offset="50%" stopColor="#7a8291"/>
        <stop offset="75%" stopColor="#b8becc"/>
        <stop offset="100%" stopColor="#4a505e"/>
      </linearGradient>
      <linearGradient id="crimsonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff4757"/>
        <stop offset="50%" stopColor="#e52d27"/>
        <stop offset="100%" stopColor="#8a0c10"/>
      </linearGradient>
      <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd32a"/>
        <stop offset="100%" stopColor="#ff9f1a"/>
      </linearGradient>
    </defs>
    <path d="M60 4 L106 20 C106 66 84 98 60 114 C36 98 14 66 14 20 Z" fill="url(#shieldBg)" stroke="url(#chromeBezel)" strokeWidth="3"/>
    <path d="M60 10 L100 24 C100 62 80 92 60 106 C40 92 20 62 20 24 Z" fill="none" stroke="url(#crimsonGlow)" strokeWidth="2" opacity="0.9"/>
    <path d="M32 38 L88 38 M30 46 L90 46 M32 54 L88 54" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.25"/>
    <path d="M24 30 C42 42 54 44 60 56 C66 44 78 42 96 30 C80 50 68 56 60 68 C52 56 40 50 24 30 Z" fill="url(#chromeBezel)"/>
    <path d="M34 33 C46 41 55 44 60 52 C65 44 74 41 86 33 C74 47 66 51 60 60 C54 51 46 47 34 33 Z" fill="url(#crimsonGlow)"/>
    <polygon points="60,20 68,36 60,42 52,36" fill="url(#chromeBezel)"/>
    <polygon points="60,24 65,35 60,39 55,35" fill="url(#goldAccent)"/>
    <text x="60" y="85" textAnchor="middle" fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="900" letterSpacing="4" fill="#ffffff">ASK</text>
    <rect x="36" y="91" width="48" height="12" rx="2" fill="url(#crimsonGlow)"/>
    <text x="60" y="100.5" textAnchor="middle" fontFamily="'Segoe UI', system-ui, -apple-system, sans-serif" fontSize="7.5" fontWeight="800" letterSpacing="3" fill="#ffffff">MOTORS</text>
  </svg>
);

export const IconDash: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/></svg>
);

export const IconCar: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M5 17h14M6 17v2M18 17v2M3 13l2-6a2 2 0 0 1 2-1.4h10A2 2 0 0 1 19 7l2 6v4H3z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/></svg>
);

export const IconClock: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
);

export const IconUsers: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M21 19v-1a4 4 0 0 0-3-3.8M16 4.2a3.5 3.5 0 0 1 0 6.6"/></svg>
);

export const IconCash: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v.01M18 14v.01"/></svg>
);

export const IconChart: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
);

export const IconGear: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
);

export const IconPlus: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M12 5v14M5 12h14"/></svg>
);

export const IconSearch: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
);

export const IconX: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M18 6 6 18M6 6l12 12"/></svg>
);

export const IconCheck: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M20 6 9 17l-5-5"/></svg>
);

export const IconEdit: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>
);

export const IconTrash: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
);

export const IconPrint: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
);

export const IconWhatsApp: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.5z"/><path d="M9 9.5c.3 2 2.2 4.2 4.7 5l1.3-1.3 2 1-.5 1.8c-3.7.3-8.3-3.8-8.3-8l1.8-.5 1 2z"/></svg>
);

export const IconCloud: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
);

export const IconAlert: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
);

export const IconFile: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>
);

export const IconId: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 16c.6-1.6 1.9-2.4 3.5-2.4s2.9.8 3.5 2.4M15 10h3M15 13.5h3"/></svg>
);

export const IconBack: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M15 18l-6-6 6-6"/></svg>
);

export const IconMoon: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
);

export const IconSun: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
);

export const IconDownload: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>
);

export const IconUpload: React.FC<IconProps> = ({ className, style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M12 21V9M7 14l5-5 5 5M5 3h14"/></svg>
);
