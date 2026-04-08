import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Menu, X, User, Settings } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Typing', path: '/typing' },
  { label: 'Practice', path: '/practice' },
  { label: 'Multiplayer', path: '/multiplayer' },
  { label: 'Leaderboard', path: '/leaderboard' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { currentTheme, changeTheme, themes } = useTheme();

  const isActive = (path) => location.pathname === path;
  const handleThemeCycle = () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    changeTheme(nextTheme);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-surface/80 border-b border-border-dark shadow-xl h-16"
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 grid place-items-center rounded-lg bg-accent/15 text-accent group-hover:bg-accent/20 transition-all duration-300">
              <Keyboard className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold">TypeZone</p>
              <p className="text-sm font-bold text-text leading-none">Premium Typing</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-2 bg-card/40 backdrop-blur-sm p-1 rounded-xl border border-border-dark">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium ${
                    isActive(item.path)
                      ? 'text-accent bg-accent/10'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleThemeCycle}
              className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-lg bg-card/60 border border-border-dark text-text hover:border-accent hover:bg-card hover:text-accent transition-all duration-300"
              aria-label="Cycle theme"
              title="Cycle theme (Ctrl+T)"
            >
              <Settings className="w-4 h-4" />
            </button>

            <Link
              to="/login"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg btn-primary text-sm font-semibold"
            >
              <User className="w-4 h-4" />
              Login
            </Link>

            <button
              type="button"
              className="md:hidden p-2.5 rounded-lg bg-card/60 border border-border-dark text-text hover:border-accent hover:bg-card hover:text-accent transition-all duration-300"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Open mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed inset-x-0 top-16 z-40 rounded-b-2xl border-b border-border bg-surface/95 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <div className="px-5 py-5 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-4 py-3 transition-all text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-accent/15 text-accent'
                      : 'text-text-secondary hover:text-text hover:bg-card'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <button
                type="button"
                onClick={() => {
                  handleThemeCycle();
                  setMobileOpen(false);
                }}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-medium text-text-secondary hover:text-text hover:border-accent transition-all"
              >
                Cycle theme
              </button>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-3 text-center font-medium text-background btn-primary"
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
