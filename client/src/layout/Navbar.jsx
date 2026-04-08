import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, SunMoon, LogIn } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { currentTheme, cycleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
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
          <button className="navbar-icon-btn" onClick={cycleTheme} title={`Theme: ${currentTheme}`}>
            <SunMoon size={18} />
          </button>

          <Link to="/login" className="navbar-link-btn">
            <LogIn size={16} />
            Login
          </Link>
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
