import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export default function SettingsPanel({ isOpen, onClose }) {
  const { currentTheme, switchTheme, allThemes } = useTheme();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('typezone_settings');
    return saved ? JSON.parse(saved) : {
      soundEnabled: true,
      keypressSoundEnabled: true,
      ambienceEnabled: false,
      volume: 70,
      cursorStyle: 'block',
      fontSize: 'md',
      fontFamily: 'fira-code',
      showTimerInTab: true,
      focusMode: false,
      smoothScroll: true,
      matchWordBoundaries: true,
    };
  });

  const handleSettingChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('typezone_settings', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Modal */}
      <Card variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Settings</h2>
          <button
            onClick={onClose}
            className="text-2xl text-[var(--color-muted)] hover:text-[var(--color-accent)] transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          {/* Theme Selection */}
          <section>
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Theme</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(allThemes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => switchTheme(key)}
                  className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    currentTheme === key
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                  }`}
                >
                  <div
                    className="w-full h-12 rounded-lg mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.text})`,
                    }}
                  ></div>
                  <p className="text-xs font-semibold">{theme.name}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Sound Settings */}
          <section>
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Sound</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--color-card)]">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-[var(--color-text)]">Enable Sound Effects</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--color-card)]">
                <input
                  type="checkbox"
                  checked={settings.keypressSoundEnabled}
                  onChange={(e) => handleSettingChange('keypressSoundEnabled', e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-[var(--color-text)]">Keypress Sounds</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--color-card)]">
                <input
                  type="checkbox"
                  checked={settings.ambienceEnabled}
                  onChange={(e) => handleSettingChange('ambienceEnabled', e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-[var(--color-text)]">Ambient Background</span>
              </label>
              <div className="p-3 rounded-lg hover:bg-[var(--color-card)]">
                <label className="text-sm text-[var(--color-muted)] mb-2 block">Volume: {settings.volume}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--color-border)] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Display Settings */}
          <section>
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Display</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg hover:bg-[var(--color-card)]">
                <label className="block text-sm text-[var(--color-muted)] mb-2 font-semibold">Font Size</label>
                <div className="flex gap-2">
                  {['sm', 'md', 'lg', 'xl'].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSettingChange('fontSize', size)}
                      className={`px-4 py-2 rounded-lg border transition ${
                        settings.fontSize === size
                          ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                          : 'border-[var(--color-border)] text-[var(--color-text)]'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg hover:bg-[var(--color-card)]">
                <label className="block text-sm text-[var(--color-muted)] mb-2 font-semibold">Font Family</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)]"
                >
                  <option value="fira-code">Fira Code</option>
                  <option value="courier">Courier New</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>

              <div className="p-3 rounded-lg hover:bg-[var(--color-card)]">
                <label className="block text-sm text-[var(--color-muted)] mb-2 font-semibold">Cursor Style</label>
                <div className="flex gap-2">
                  {[
                    { id: 'block', label: 'Block', symbol: '█' },
                    { id: 'line', label: 'Line', symbol: '|' },
                    { id: 'outline', label: 'Outline', symbol: '▯' },
                  ].map((cursor) => (
                    <button
                      key={cursor.id}
                      onClick={() => handleSettingChange('cursorStyle', cursor.id)}
                      className={`px-4 py-2 rounded-lg border transition flex items-center gap-2 ${
                        settings.cursorStyle === cursor.id
                          ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                          : 'border-[var(--color-border)] text-[var(--color-text)]'
                      }`}
                    >
                      <span className="text-xl">{cursor.symbol}</span>
                      {cursor.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Behavior Settings */}
          <section>
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Behavior</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--color-card)]">
                <input
                  type="checkbox"
                  checked={settings.focusMode}
                  onChange={(e) => handleSettingChange('focusMode', e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-[var(--color-text)]">Focus Mode (Hide stats during test)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--color-card)]">
                <input
                  type="checkbox"
                  checked={settings.smoothScroll}
                  onChange={(e) => handleSettingChange('smoothScroll', e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-[var(--color-text)]">Smooth Scroll</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--color-card)]">
                <input
                  type="checkbox"
                  checked={settings.showTimerInTab}
                  onChange={(e) => handleSettingChange('showTimerInTab', e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-[var(--color-text)]">Show Timer in Browser Tab</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--color-card)]">
                <input
                  type="checkbox"
                  checked={settings.matchWordBoundaries}
                  onChange={(e) => handleSettingChange('matchWordBoundaries', e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-[var(--color-text)]">Match Word Boundaries on Space</span>
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-[var(--color-border)]">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={() => {
            localStorage.removeItem('typezone_settings');
            setSettings({
              soundEnabled: true,
              keypressSoundEnabled: true,
              ambienceEnabled: false,
              volume: 70,
              cursorStyle: 'block',
              fontSize: 'md',
              fontFamily: 'fira-code',
              showTimerInTab: true,
              focusMode: false,
              smoothScroll: true,
              matchWordBoundaries: true,
            });
          }}>
            Reset to Defaults
          </Button>
        </div>
      </Card>
    </div>
  );
}
