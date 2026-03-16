import { useMemo } from 'react';

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default function TypingPanel({ prompt, inputValue, active }) {
  const html = useMemo(() => {
    if (!prompt) {
      return 'Press Start to begin.';
    }

    return [...prompt]
      .map((char, index) => {
        const safe = escapeHtml(char);
        if (index < inputValue.length) {
          return `<span class="${inputValue[index] === char ? 'correct' : 'incorrect'}">${safe}</span>`;
        }
        if (active && index === inputValue.length) {
          return `<span class="current">${safe}</span>`;
        }
        return safe;
      })
      .join('');
  }, [prompt, inputValue, active]);

  return <div className="min-h-24 rounded-xl border border-slate-700/50 bg-slate-950/70 p-4 text-lg leading-8 tracking-wide text-slate-300" dangerouslySetInnerHTML={{ __html: html }} />;
}
