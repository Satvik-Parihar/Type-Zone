import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Layout({ children }) {
  useTheme();

  useKeyboardShortcuts();
  const location = useLocation();

  const breadcrumbLabels = {
    typing: 'Typing',
    type: 'Typing',
    practice: 'Practice',
    multiplayer: 'Multiplayer',
    leaderboard: 'Leaderboard',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    room: 'Room',
    race: 'Race'
  };

  const breadcrumbItems = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, segments) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const label = breadcrumbLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      return { path, label };
    });

  return (
    <div className="min-h-screen bg-background text-text selection:bg-accent/25 selection:text-background antialiased">
      <Navbar />
      {breadcrumbItems.length > 0 && (
        <div className="border-b border-border bg-card/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-secondary overflow-x-auto">
            <Link to="/" className="hover:text-text transition-colors whitespace-nowrap">
              Home
            </Link>
            {breadcrumbItems.map((item) => (
              <span key={item.path} className="flex items-center gap-2 whitespace-nowrap">
                <ChevronRight className="w-4 h-4" />
                <Link to={item.path} className="hover:text-text transition-colors">
                  {item.label}
                </Link>
              </span>
            ))}
          </div>
        </div>
      )}
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
