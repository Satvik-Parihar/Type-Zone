import { useTheme as useThemeContext } from '../context/ThemeContext';

// Compatibility wrapper so older call sites can keep using changeTheme/themes/getTheme.
export const useTheme = () => {
  const ctx = useThemeContext();

  return {
    ...ctx,
    changeTheme: ctx.switchTheme,
    themes: ctx.themeKeys,
    getTheme: () => ctx.theme,
  };
};