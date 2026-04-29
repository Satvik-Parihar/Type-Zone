import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemePicker.css';

export default function ThemePicker({ onClose }) {
  const { themes, currentTheme, switchTheme } = useTheme();
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  return (
    <div className="theme-picker" ref={ref} role="dialog" aria-label="Theme picker">
      <div className="theme-grid">
        {Object.entries(themes).map(([id, t]) => (
          <button
            key={id}
            className={`theme-card ${currentTheme === id ? 'active' : ''}`}
            onClick={() => {
              switchTheme(id);
              onClose();
            }}
            title={t.name}
          >
            <div className="swatches">
              {t.preview.map((c, i) => (
                <span key={i} className="swatch" style={{ background: c }} />
              ))}
            </div>
            <div className="theme-name">{t.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
