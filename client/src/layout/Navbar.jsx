import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, SunMoon, LogIn } from 'lucide-react';
import './Navbar.css';
import ThemePicker from '../components/ThemePicker';

export default function Navbar() {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Typing', href: '/typing' },
    { label: 'Multiplayer', href: '/multiplayer' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Practice', href: '/practice' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
          <div className="logo-icon">
            <div className="logo-key">
              <span className="key-block" />
              <span className="key-block" />
              <span className="key-block accent" />
            </div>
          </div>
          <span className="logo-text">TypeZone</span>
        </Link>

        <div className="navbar-nav-desktop">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`navbar-link ${location.pathname === link.href ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <div style={{ position: 'relative' }}>
            <button
              className="navbar-icon-btn"
              onClick={() => setPickerOpen((v) => !v)}
              title={`Theme: ${currentTheme}`}
            >
              <SunMoon size={18} />
            </button>
            {pickerOpen && <ThemePicker onClose={() => setPickerOpen(false)} />}
          </div>

          {user ? (
            <Link to="/profile" className="navbar-link-btn">
              {user.username}
            </Link>
          ) : (
            <Link to="/login" className="navbar-link-btn">
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>

        <button className="navbar-mobile-btn" onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`navbar-mobile-link ${location.pathname === link.href ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
