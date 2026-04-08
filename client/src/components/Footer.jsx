import React from 'react';
import { Code2, Mail, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    {
      label: 'Product',
      items: [
        { name: 'Typing Practice', href: '#' },
        { name: 'Multiplayer', href: '#' },
        { name: 'Leaderboard', href: '#' },
        { name: 'Stats', href: '#' },
      ]
    },
    {
      label: 'Resources',
      items: [
        { name: 'Blog', href: '#' },
        { name: 'Docs', href: '#' },
        { name: 'API', href: '#' },
        { name: 'Support', href: '#' },
      ]
    },
    {
      label: 'Legal',
      items: [
        { name: 'Privacy', href: '#' },
        { name: 'Terms', href: '#' },
        { name: 'Security', href: '#' },
      ]
    },
  ];

  const socials = [
    { icon: Code2, href: 'https://github.com/Satvik-Parihar/Type-Zone', label: 'GitHub' },
    { icon: Mail, href: 'mailto:contact@typezone.dev', label: 'Email' },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main content */}
        <div className="footer-content">
          {/* Brand section */}
          <div className="footer-section footer-brand">
            <h3 className="footer-brand-name">TypeZone</h3>
            <p className="footer-brand-desc">
              Master typing at your own pace. Compete globally. Improve continuously.
            </p>
            <div className="footer-socials">
              {socials.map(social => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link"
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links sections */}
          {links.map(section => (
            <div key={section.label} className="footer-section footer-links">
              <h4 className="footer-section-title">{section.label}</h4>
              <ul className="footer-links-list">
                {section.items.map(item => (
                  <li key={item.name}>
                    <a href={item.href} className="footer-link">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            <span>&copy; {currentYear} TypeZone. All rights reserved.</span>
            <span>Made with <Heart size={14} /> for typists</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
