import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  dark: {
    id: 'dark',
    name: 'Dark',
  },
  'dark-pro': {
    id: 'dark-pro',
    name: 'Dark Pro',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
  },
  glass: {
    id: 'glass',
    name: 'Glass',
  },
};

const STORAGE_KEY = 'typezone_theme';
const THEME_ORDER = Object.keys(THEMES);

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('dark-pro');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) {
      setCurrentTheme(saved);
    }
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.remove(...THEME_ORDER.map((themeId) => `theme-${themeId}`));
    body.classList.add(`theme-${currentTheme}`);
    localStorage.setItem(STORAGE_KEY, currentTheme);
  }, [currentTheme]);

  const switchTheme = (themeId) => {
    if (THEMES[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  const cycleTheme = () => {
    const index = THEME_ORDER.indexOf(currentTheme);
    const nextTheme = THEME_ORDER[(index + 1) % THEME_ORDER.length];
    setCurrentTheme(nextTheme);
  };

  const value = useMemo(
    () => ({
      currentTheme,
      switchTheme,
      cycleTheme,
      theme: THEMES[currentTheme],
      allThemes: THEMES,
      themeKeys: THEME_ORDER,
    }),
    [currentTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
