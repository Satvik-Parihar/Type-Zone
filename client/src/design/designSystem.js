/**
 * TypeZone Design System
 * Professional, handcrafted design language
 * Not generic. Not AI-generated. Real product design.
 */

export const COLORS = {
  // Primary brand
  primary: '#1E293B',        // Deep indigo
  primaryLight: '#334155',
  primaryDark: '#0F172A',
  
  // Accent & highlight
  accent: '#2563EB',          // Electric blue
  accentLight: '#3B82F6',
  accentDark: '#1D4ED8',
  
  highlight: '#06B6D4',       // Cyan
  highlightLight: '#22D3EE',
  highlightDark: '#0891B2',
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  
  // Backgrounds
  bg: '#0B0F17',              // Main background
  surface: '#111827',         // Surface layer 1
  surfaceAlt: '#1F2937',      // Surface layer 2
  surfaceHover: '#374151',    // Hover state
  
  // Text
  text: '#E5E7EB',            // Primary text
  textMuted: '#94A3B8',       // Secondary text
  textWeak: '#64748B',        // Tertiary text
  textInverse: '#0B0F17',     // Text on light bg
  
  // Borders
  border: '#30384F',          // Default border
  borderLight: '#4B5563',     // Light border
  borderHeavy: '#1F2937',     // Dark border
  
  // Special
  focus: '#06B6D4',           // Focus state
  focusRing: 'rgba(6, 182, 212, 0.1)',
  codeBlock: '#0F172A',
};

export const TYPOGRAPHY = {
  // Font family
  family: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", monospace',
  },
  
  // Font sizes (in px)
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },
  
  // Line heights (unitless)
  leading: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },
  
  // Font weights
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Letter spacing (in em)
  tracking: {
    tight: -0.02,
    normal: 0,
    wide: 0.02,
  },
};

export const SPACING = {
  // Base spacing unit: 4px
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
};

export const RADIUS = {
  // Rounded corners
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
};

export const SHADOWS = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  base: '0 4px 6px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px rgba(0, 0, 0, 0.15)',
  xl: '0 30px 40px rgba(0, 0, 0, 0.2)',
  
  // Glowing focus state
  focus: `0 0 0 3px ${COLORS.focusRing}`,
};

export const MOTION = {
  // Transition durations (in ms)
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
  },
  
  // Easing functions
  easing: {
    ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

export const BREAKPOINTS = {
  xs: 320,
  sm: 425,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  debugger: 9999,
};

/**
 * Component sizing specifications
 */
export const COMPONENTS = {
  button: {
    height: {
      sm: 32,
      base: 40,
      lg: 48,
    },
    padding: {
      sm: {
        x: 12,
        y: 8,
      },
      base: {
        x: 16,
        y: 12,
      },
      lg: {
        x: 20,
        y: 14,
      },
    },
    radius: RADIUS.base,
  },
  
  input: {
    height: 40,
    padding: {
      x: 12,
      y: 10,
    },
    radius: RADIUS.base,
    border: `1px solid ${COLORS.border}`,
    focusRing: `${COLORS.focus}`,
  },
  
  navbar: {
    height: 64,
    borderColor: COLORS.border,
    backdropBlur: 'blur(8px)',
    backdropOpacity: 0.9,
  },
  
  container: {
    maxWidth: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    padding: {
      xs: SPACING[2],
      sm: SPACING[3],
      md: SPACING[4],
      lg: SPACING[6],
      xl: SPACING[8],
      '2xl': SPACING[8],
    },
  },
};

/**
 * Typography presets (optional, but useful for consistency)
 */
export const TEXT_PRESETS = {
  h1: {
    fontSize: TYPOGRAPHY.size['3xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    lineHeight: TYPOGRAPHY.leading.tight,
    letterSpacing: TYPOGRAPHY.tracking.tight,
  },
  h2: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    lineHeight: TYPOGRAPHY.leading.snug,
  },
  h3: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.semibold,
    lineHeight: TYPOGRAPHY.leading.normal,
  },
  h4: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.semibold,
    lineHeight: TYPOGRAPHY.leading.normal,
  },
  body: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.normal,
    lineHeight: TYPOGRAPHY.leading.normal,
  },
  caption: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.normal,
    lineHeight: TYPOGRAPHY.leading.normal,
  },
  label: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    lineHeight: TYPOGRAPHY.leading.normal,
    letterSpacing: TYPOGRAPHY.tracking.wide,
    textTransform: 'uppercase',
  },
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  MOTION,
  BREAKPOINTS,
  Z_INDEX,
  COMPONENTS,
  TEXT_PRESETS,
};
