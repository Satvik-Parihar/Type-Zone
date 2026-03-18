import { memo } from 'react';

function AudioSettingsPanel({ settings, onChange }) {
  return (
    <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Audio and Ambience</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={settings.soundEnabled} onChange={(e) => onChange({ soundEnabled: e.target.checked })} />
          Master Sound
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={settings.keypressSoundEnabled} onChange={(e) => onChange({ keypressSoundEnabled: e.target.checked })} />
          Keypress Sounds
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={settings.ambienceEnabled} onChange={(e) => onChange({ ambienceEnabled: e.target.checked })} />
          Ambient Tone
        </label>

        <label className="text-sm text-slate-300">
          Sound Profile
          <select
            className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2"
            value={settings.typingSoundProfile}
            onChange={(e) => onChange({ typingSoundProfile: e.target.value })}
          >
            <option value="classic">Classic</option>
            <option value="soft">Soft</option>
            <option value="clicky">Clicky</option>
            <option value="mechanical">Mechanical</option>
            <option value="typewriter">Typewriter</option>
            <option value="spring">Spring</option>
            <option value="silent">Silent</option>
          </select>
        </label>

        <label className="text-sm text-slate-300 md:col-span-2">
          Ambience Volume
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            className="mt-2 w-full"
            value={settings.ambienceVolume}
            onChange={(e) => onChange({ ambienceVolume: Number(e.target.value) })}
          />
        </label>
      </div>
    </article>
  );
}

export default memo(AudioSettingsPanel);
