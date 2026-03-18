import { memo, useMemo } from 'react';

const KEYS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

function KeyboardHeatmap({ entries }) {
  const maxMistakes = useMemo(() => entries.reduce((max, entry) => Math.max(max, entry.count), 1), [entries]);

  const lookup = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => map.set(String(entry.key).toLowerCase(), entry.count));
    return map;
  }, [entries]);

  return (
    <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-200">Keyboard Error Heatmap</h3>
      <div className="space-y-2">
        {KEYS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((key) => {
              const mistakes = lookup.get(key) || 0;
              const intensity = Math.min(1, mistakes / maxMistakes);
              return (
                <div
                  key={key}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-600 text-xs font-medium"
                  style={{
                    backgroundColor: `rgba(239, 68, 68, ${0.1 + (intensity * 0.85)})`
                  }}
                  title={`${key.toUpperCase()} mistakes: ${mistakes}`}
                >
                  {key.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </article>
  );
}

export default memo(KeyboardHeatmap);
