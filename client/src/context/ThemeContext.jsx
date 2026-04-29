import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

const THEMES = {
  midnight: {
    name: 'Midnight',
    type: 'dark',
    preview: ['#0f0f23', '#00d4ff', '#e0e0e0'],
    vars: {
      '--color-background': '#0f0f23',
      '--color-surface': '#161629',
      '--color-card': '#1a1a2e',
      '--color-text': '#e0e0e0',
      '--color-text-secondary': '#a0a0b8',
      '--color-accent': '#00d4ff',
      '--color-accent-alt': '#0099bb',
      '--color-error': '#ff4757',
      '--color-correct': '#2ed573',
      '--color-cursor': '#00d4ff',
      '--color-border': 'rgba(255,255,255,0.08)',
      '--color-border-dark': 'rgba(255,255,255,0.04)',
      '--color-hover': 'rgba(0,212,255,0.08)',
      '--shadow-glow': '0 0 30px rgba(0,212,255,0.15)',
    },
  },
  dracula: {
    name: 'Dracula',
    type: 'dark',
    preview: ['#282a36', '#bd93f9', '#f8f8f2'],
    vars: {
      '--color-background': '#282a36',
      '--color-surface': '#313344',
      '--color-card': '#363749',
      '--color-text': '#f8f8f2',
      '--color-text-secondary': '#6272a4',
      '--color-accent': '#bd93f9',
      '--color-accent-alt': '#ff79c6',
      '--color-error': '#ff5555',
      '--color-correct': '#50fa7b',
      '--color-cursor': '#bd93f9',
      '--color-border': 'rgba(255,255,255,0.08)',
      '--color-border-dark': 'rgba(255,255,255,0.04)',
      '--color-hover': 'rgba(189,147,249,0.1)',
      '--shadow-glow': '0 0 30px rgba(189,147,249,0.2)',
    },
  },
  nord: {
    name: 'Nord',
    type: 'dark',
    preview: ['#2e3440', '#88c0d0', '#eceff4'],
    vars: {
      '--color-background': '#2e3440',
      '--color-surface': '#3b4252',
      '--color-card': '#434c5e',
      '--color-text': '#eceff4',
      '--color-text-secondary': '#8fa3b1',
      '--color-accent': '#88c0d0',
      '--color-accent-alt': '#81a1c1',
      '--color-error': '#bf616a',
      '--color-correct': '#a3be8c',
      '--color-cursor': '#88c0d0',
      '--color-border': 'rgba(255,255,255,0.08)',
      '--color-border-dark': 'rgba(255,255,255,0.04)',
      '--color-hover': 'rgba(136,192,208,0.1)',
      '--shadow-glow': '0 0 30px rgba(136,192,208,0.15)',
    },
  },
  catppuccin: {
    name: 'Catppuccin',
    type: 'dark',
    preview: ['#1e1e2e', '#cba6f7', '#cdd6f4'],
    vars: {
      '--color-background': '#1e1e2e',
      '--color-surface': '#181825',
      '--color-card': '#313244',
      '--color-text': '#cdd6f4',
      '--color-text-secondary': '#7f849c',
      '--color-accent': '#cba6f7',
      '--color-accent-alt': '#89b4fa',
      '--color-error': '#f38ba8',
      '--color-correct': '#a6e3a1',
      '--color-cursor': '#f5c2e7',
      '--color-border': 'rgba(255,255,255,0.08)',
      '--color-border-dark': 'rgba(255,255,255,0.04)',
      '--color-hover': 'rgba(203,166,247,0.1)',
      '--shadow-glow': '0 0 30px rgba(203,166,247,0.2)',
    },
  },
  ocean: {
    name: 'Ocean',
    type: 'dark',
    preview: ['#0d2137', '#4fc3f7', '#e8f4f8'],
    vars: {
      '--color-background': '#0d2137',
      '--color-surface': '#132d4a',
      '--color-card': '#1a3a5c',
      '--color-text': '#e8f4f8',
      '--color-text-secondary': '#7fb3cc',
      '--color-accent': '#4fc3f7',
      '--color-accent-alt': '#29b6f6',
      '--color-error': '#ff8a80',
      '--color-correct': '#69f0ae',
      '--color-cursor': '#4fc3f7',
      '--color-border': 'rgba(255,255,255,0.08)',
      '--color-border-dark': 'rgba(255,255,255,0.04)',
      '--color-hover': 'rgba(79,195,247,0.1)',
      '--shadow-glow': '0 0 30px rgba(79,195,247,0.15)',
    },
  },
  cyber: {
    name: 'Cyber',
    type: 'dark',
    preview: ['#0d0d0d', '#ff0080', '#00ff88'],
    vars: {
      '--color-background': '#0d0d0d',
      '--color-surface': '#141414',
      '--color-card': '#1a1a1a',
      '--color-text': '#00ff88',
      '--color-text-secondary': '#00cc66',
      '--color-accent': '#ff0080',
      '--color-accent-alt': '#ff00aa',
      '--color-error': '#ff4444',
      '--color-correct': '#00ff88',
      '--color-cursor': '#ff0080',
      '--color-border': 'rgba(0,255,136,0.15)',
      '--color-border-dark': 'rgba(0,255,136,0.06)',
      '--color-hover': 'rgba(255,0,128,0.1)',
      '--shadow-glow': '0 0 30px rgba(255,0,128,0.3)',
    },
  },
  sunset: {
    name: 'Sunset',
    type: 'dark',
    preview: ['#1a0a2e', '#ff6b35', '#ffecd1'],
    vars: {
      '--color-background': '#1a0a2e',
      '--color-surface': '#241040',
      '--color-card': '#2d1550',
      '--color-text': '#ffecd1',
      '--color-text-secondary': '#cc9966',
      '--color-accent': '#ff6b35',
      '--color-accent-alt': '#ff9a5c',
      '--color-error': '#ff4757',
      '--color-correct': '#ffa726',
      '--color-cursor': '#ff6b35',
      '--color-border': 'rgba(255,107,53,0.15)',
      '--color-border-dark': 'rgba(255,107,53,0.06)',
      '--color-hover': 'rgba(255,107,53,0.1)',
      '--shadow-glow': '0 0 30px rgba(255,107,53,0.2)',
    },
  },
  forest: {
    name: 'Forest',
    type: 'dark',
    preview: ['#0d1f0d', '#4caf50', '#e8f5e8'],
    vars: {
      '--color-background': '#0d1f0d',
      '--color-surface': '#142814',
      '--color-card': '#1a321a',
      '--color-text': '#e8f5e8',
      '--color-text-secondary': '#7aad7a',
      '--color-accent': '#4caf50',
      '--color-accent-alt': '#66bb6a',
      '--color-error': '#ef5350',
      '--color-correct': '#8bc34a',
      '--color-cursor': '#4caf50',
      '--color-border': 'rgba(76,175,80,0.15)',
      '--color-border-dark': 'rgba(76,175,80,0.06)',
      '--color-hover': 'rgba(76,175,80,0.1)',
      '--shadow-glow': '0 0 30px rgba(76,175,80,0.15)',
    },
  },
  paper: {
    name: 'Paper',
    type: 'light',
    preview: ['#f5f0e8', '#8b6914', '#2c2c2c'],
    vars: {
      '--color-background': '#f5f0e8',
      '--color-surface': '#ede8de',
      '--color-card': '#e5dfd3',
      '--color-text': '#2c2c2c',
      '--color-text-secondary': '#6b5e45',
      '--color-accent': '#8b6914',
      '--color-accent-alt': '#a07820',
      '--color-error': '#c0392b',
      '--color-correct': '#27ae60',
      '--color-cursor': '#8b6914',
      '--color-border': 'rgba(0,0,0,0.1)',
      '--color-border-dark': 'rgba(0,0,0,0.05)',
      '--color-hover': 'rgba(139,105,20,0.08)',
      '--shadow-glow': '0 0 20px rgba(139,105,20,0.1)',
    },
  },
  monochrome: {
    name: 'Monochrome',
    type: 'light',
    preview: ['#ffffff', '#111111', '#555555'],
    vars: {
      '--color-background': '#ffffff',
      '--color-surface': '#f5f5f5',
      '--color-card': '#eeeeee',
      '--color-text': '#111111',
      '--color-text-secondary': '#666666',
      '--color-accent': '#111111',
      '--color-accent-alt': '#333333',
      '--color-error': '#cc0000',
      '--color-correct': '#007700',
      '--color-cursor': '#111111',
      '--color-border': 'rgba(0,0,0,0.12)',
      '--color-border-dark': 'rgba(0,0,0,0.06)',
      '--color-hover': 'rgba(0,0,0,0.06)',
      '--shadow-glow': '0 0 20px rgba(0,0,0,0.08)',
    },
  },
  terminal: {
    name: 'Terminal',
    type: 'dark',
    preview: ['#000000', '#00ff00', '#33ff33'],
    vars: {
      '--color-background': '#000000',
      '--color-surface': '#0a0a0a',
      '--color-card': '#111111',
      '--color-text': '#00ff00',
      '--color-text-secondary': '#007700',
      '--color-accent': '#00ff00',
      '--color-accent-alt': '#33ff33',
      '--color-error': '#ff3300',
      '--color-correct': '#00ff00',
      '--color-cursor': '#00ff00',
      '--color-border': 'rgba(0,255,0,0.15)',
      '--color-border-dark': 'rgba(0,255,0,0.06)',
      '--color-hover': 'rgba(0,255,0,0.08)',
      '--shadow-glow': '0 0 20px rgba(0,255,0,0.2)',
    },
  },
  rosepine: {
    name: 'Rosé Pine',
    type: 'dark',
    preview: ['#191724', '#c4a7e7', '#e0def4'],
    vars: {
      '--color-background': '#191724',
      '--color-surface': '#1f1d2e',
      '--color-card': '#26233a',
      '--color-text': '#e0def4',
      '--color-text-secondary': '#6e6a86',
      '--color-accent': '#c4a7e7',
      '--color-accent-alt': '#ebbcba',
      '--color-error': '#eb6f92',
      '--color-correct': '#31748f',
      '--color-cursor': '#c4a7e7',
      '--color-border': 'rgba(255,255,255,0.08)',
      '--color-border-dark': 'rgba(255,255,255,0.04)',
      '--color-hover': 'rgba(196,167,231,0.1)',
      '--shadow-glow': '0 0 30px rgba(196,167,231,0.15)',
    },
  },
};

const STORAGE_KEY = 'typezone_theme';

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && THEMES[saved] ? saved : 'midnight';
    } catch (e) {
      return 'midnight';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const vars = THEMES[currentTheme]?.vars || THEMES.midnight.vars;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    document.body.style.background = vars['--color-background'];
    localStorage.setItem(STORAGE_KEY, currentTheme);
  }, [currentTheme]);

  const switchTheme = (themeId) => {
    if (THEMES[themeId]) setCurrentTheme(themeId);
  };

  const value = useMemo(
    () => ({ currentTheme, switchTheme, themes: THEMES, theme: THEMES[currentTheme] }),
    [currentTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
