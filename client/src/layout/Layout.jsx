import { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Layout({ children }) {
  const { currentTheme, changeTheme, themes } = useTheme();

  useEffect(() => {
    const handleThemeShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
        event.preventDefault();
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        changeTheme(nextTheme);
      }
    };

    window.addEventListener('keydown', handleThemeShortcut);
    return () => window.removeEventListener('keydown', handleThemeShortcut);
  }, [currentTheme, changeTheme, themes]);

  return (
    <div className="min-h-screen bg-background text-text selection:bg-accent/25 selection:text-background antialiased">
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
