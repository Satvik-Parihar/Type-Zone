import { memo } from 'react';

const MODES = [
  { value: 'words', label: 'Words' },
  { value: 'time', label: 'Time' },
  { value: 'quote', label: 'Quote' },
  { value: 'code', label: 'Code' },
  { value: 'sentence', label: 'Sentence' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'punctuation', label: 'Punctuation' },
  { value: 'zen', label: 'Zen' },
  { value: 'practice', label: 'Practice' },
  { value: 'challenge', label: 'Challenge' },
  { value: 'custom', label: 'Custom' }
];

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

const THEMES = [
  { value: 'dark', label: 'Graphite Dark' },
  { value: 'light', label: 'Paper Light' },
  { value: 'matrix', label: 'Matrix Neon' },
  { value: 'cyberpunk', label: 'Cyberpunk Grid' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'retro', label: 'Retro Terminal' }
];

function TypingControls({
  theme,
  setTheme,
  mode,
  setMode,
  difficulty,
  setDifficulty,
  timeLimit,
  setTimeLimit,
  wordCount,
  setWordCount,
  raceRoom,
  setRaceRoom
}) {
  return (
    <section className="mb-4 grid gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 md:grid-cols-2 lg:grid-cols-7">
      <label className="text-xs">
        Theme
        <select className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={theme} onChange={(e) => setTheme(e.target.value)}>
          {THEMES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>

      <label className="text-xs">
        Mode
        <select className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={mode} onChange={(e) => setMode(e.target.value)}>
          {MODES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>

      <label className="text-xs">
        Difficulty
        <select className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {DIFFICULTIES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>

      <label className="text-xs">
        Time
        <select className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}>
          <option value={15}>15s</option>
          <option value={30}>30s</option>
          <option value={60}>60s</option>
          <option value={120}>120s</option>
        </select>
      </label>

      <label className="text-xs">
        Word Count
        <select className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={250}>250</option>
        </select>
      </label>

      <label className="text-xs lg:col-span-2">
        Race Room
        <input className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={raceRoom} onChange={(e) => setRaceRoom(e.target.value)} />
      </label>
    </section>
  );
}

export default memo(TypingControls);
