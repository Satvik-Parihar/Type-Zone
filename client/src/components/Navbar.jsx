import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Settings, LogOut, User, Keyboard, Sun, Moon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = [
    { label: 'Typing', href: '/typing', icon: null },
    { label: 'Multiplayer', href: '/multiplayer', icon: null },
    { label: 'Leaderboard', href: '/leaderboard', icon: null },
    { label: 'Practice', href: '/practice', icon: null },
  ];

  return (
    <nav className="navbar">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="navbar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"><Keyboard size={20} /></div>
          <span className="logo-text">TypeZone</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav-desktop">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className="navbar-link"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="navbar-right">
          {user ? (
            <>
              {/* Theme Toggle */}
              <button
                className="navbar-icon-btn"
                onClick={toggleTheme}
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Profile Menu */}
              <div className="profile-menu">
                <button
                  className="profile-trigger"
                  onClick={() => setProfileOpen(!profileOpen)}
                  title={user.username}
                >
                  <div className="profile-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <Link
                      to="/profile"
                      className="profile-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="profile-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="profile-item profile-logout"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-link-btn">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className="navbar-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
