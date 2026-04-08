/**
 * Background Switcher Component
 * Allows users to choose from different background patterns/styles
 */

import { useTheme } from '../context/ThemeContext';

const BACKGROUNDS = [
  {
    id: 'dark-gradient',
    name: 'Dark Gradient',
    style: {
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
    }
  },
  {
    id: 'soft-blur',
    name: 'Soft Blur',
    style: {
      background: 'radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), linear-gradient(135deg, #0a0e27 0%, #111827 100%)',
      backdropFilter: 'blur(10px)',
    }
  },
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    style: {
      background: `
        linear-gradient(0deg, transparent 24%, rgba(0, 212, 255, 0.05) 25%, rgba(0, 212, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, 0.05) 75%, rgba(0, 212, 255, 0.05) 76%, transparent 77%, transparent),
        linear-gradient(90deg, transparent 24%, rgba(0, 212, 255, 0.05) 25%, rgba(0, 212, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, 0.05) 75%, rgba(0, 212, 255, 0.05) 76%, transparent 77%, transparent),
        linear-gradient(135deg, #0a0e27, #111827)
      `,
      backgroundSize: '50px 50px, 50px 50px, 100% 100%',
    }
  },
  {
    id: 'minimal-dots',
    name: 'Minimal Dots',
    style: {
      background: `
        radial-gradient(circle, rgba(0, 212, 255, 0.08) 1px, transparent 1px),
        linear-gradient(135deg, #0a0e27, #111827)
      `,
      backgroundSize: '30px 30px, 100% 100%',
    }
  },
  {
    id: 'glass-morph',
    name: 'Glass Morph',
    style: {
      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 102, 255, 0.05) 100%), linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      backdropFilter: 'blur(20px)',
    }
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    style: {
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, rgba(0, 212, 255, 0.05) 100%)',
      boxShadow: 'inset 0 0 100px rgba(0, 212, 255, 0.1)',
    }
  },
];

export default function BackgroundSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleBackgroundChange = (bgId) => {
    localStorage.setItem('typezone_background', bgId);
    document.documentElement.setAttribute('data-background', bgId);
  };

  const currentBackground = localStorage.getItem('typezone_background') || 'dark-gradient';

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-[var(--color-text)]">
        Background Pattern
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => handleBackgroundChange(bg.id)}
            className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              currentBackground === bg.id
                ? 'border-[var(--color-accent)] scale-105 shadow-lg shadow-cyan-500/50'
                : 'border-[var(--color-border)] hover:border-[var(--color-accent)] hover:scale-105'
            }`}
            title={bg.name}
          >
            {/* Preview box */}
            <div
              className="w-full h-12 relative overflow-hidden"
              style={bg.style}
            />
            
            {/* Label */}
            <div className="bg-[var(--color-card)] px-2 py-1 text-center">
              <p className="text-xs font-medium text-[var(--color-text)] truncate">
                {bg.name}
              </p>
            </div>

            {/* Check mark */}
            {currentBackground === bg.id && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-[var(--color-accent)] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
