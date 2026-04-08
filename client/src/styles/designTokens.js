/**
 * TypeZone Design Tokens & Color System
 * Single source of truth for all design constants
 */

export const COLORS = {
  // Primary gradients
  primary: {
    from: '#00d4ff',    // Cyan
    to: '#0066ff',      // Blue
    accent: '#00bfff',
  },
  
  // Semantic colors
  success: { from: '#10b981', to: '#059669' },
  warning: { from: '#f59e0b', to: '#d97706' },
  danger: { from: '#ef4444', to: '#dc2626' },
  info: { from: '#3b82f6', to: '#1d4ed8' },

  // Grayscale
  background: {
    dark: '#0a0e27',
    muted: '#111827',
    card: '#1a1f3a',
    overlay: 'rgba(10, 14, 39, 0.8)',
  },

  text: {
    primary: '#e5e7eb',
    secondary: '#9ca3af',
    muted: '#6b7280',
    light: '#f3f4f6',
  },

  border: {
    light: 'rgba(229, 231, 235, 0.1)',
    medium: 'rgba(229, 231, 235, 0.2)',
    strong: 'rgba(229, 231, 235, 0.3)',
  },
};

export const SPACING = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
};

export const BREAKPOINTS = {
  mobile: '320px',
  mobileMd: '425px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
  ultraWide: '1600px',
};

export const TYPOGRAPHY = {
  fontFamily: {
    ui: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },
  
  fontSize: {
    xs: 'clamp(12px, 0.8vw, 14px)',
    sm: 'clamp(13px, 0.9vw, 15px)',
    base: 'clamp(14px, 1vw, 16px)',
    lg: 'clamp(16px, 1.2vw, 18px)',
    xl: 'clamp(18px, 1.4vw, 20px)',
    '2xl': 'clamp(20px, 1.6vw, 24px)',
    '3xl': 'clamp(24px, 2vw, 32px)',
    '4xl': 'clamp(32px, 2.5vw, 48px)',
    '5xl': 'clamp(48px, 3.5vw, 64px)',
  },

  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(0, 212, 255, 0.5)',
  glowStrong: '0 0 40px rgba(0, 212, 255, 0.8)',
};

export const TRANSITIONS = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '350ms ease-in-out',
  slowest: '500ms ease-in-out',
};

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.375rem',    // 6px
  base: '0.5rem',    // 8px
  md: '0.75rem',     // 12px
  lg: '1rem',        // 16px
  xl: '1.5rem',      // 24px
  '2xl': '2rem',     // 32px
  full: '9999px',
};

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  tooltip: 1400,
  notification: 1500,
};

export const ANIMATIONS = {
  fadeIn: 'fadeIn 0.3s ease-in-out',
  slideUp: 'slideUp 0.4s ease-out',
  slideDown: 'slideDown 0.4s ease-out',
  slideLeft: 'slideLeft 0.4s ease-out',
  slideRight: 'slideRight 0.4s ease-out',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
};
