import { useState, useEffect, useMemo } from 'react';
import { themes, defaultTheme } from '../design/themes';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('typezone-theme');
    return saved && themes[saved] ? saved : defaultTheme;
  });

  const themeKeys = useMemo(() => Object.keys(themes), []);

  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;

    Object.entries(theme).forEach(([key, value]) => {
      if (key !== 'name') {
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    localStorage.setItem('typezone-theme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const getTheme = () => themes[currentTheme];

  return {
    currentTheme,
    changeTheme,
    getTheme,
    themes: themeKeys,
  };
};