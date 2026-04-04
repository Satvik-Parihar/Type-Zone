import { memo, useEffect, useMemo, useRef } from 'react';

function charState(expected, actual, index, inputLength, isFinished) {
  if (index >= expected.length) {
    return 'extra';
  }

  if (index >= inputLength) {
    return isFinished ? 'missing' : 'pending';
  }

  return actual === expected[index] ? 'correct' : 'incorrect';
}

function TypingPanel({ prompt, inputValue, active, finished }) {
  const activeCharRef = useRef(null);

  const model = useMemo(() => {
    if (!prompt) {
      return [];
    }

    const maxLength = Math.max(prompt.length, inputValue.length);
    const rows = [];
    for (let index = 0; index < maxLength; index += 1) {
      const expected = prompt[index] || '';
      const actual = inputValue[index] || '';
      const value = expected || actual;

      rows.push({
        index,
        value: value === ' ' ? ' ' : value,
        state: charState(prompt, actual, index, inputValue.length, finished)
      });
    }

    return rows;
  }, [prompt, inputValue, finished]);

  useEffect(() => {
    if (!active || !activeCharRef.current) {
      return;
    }

    activeCharRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }, [active, inputValue.length]);

  if (!prompt) {
    return <div className="min-h-24 rounded-xl border border-slate-700/50 bg-slate-950/70 p-4 text-lg leading-8 tracking-wide text-slate-300">Press Start to begin.</div>;
  }

  return (
    <div className="typing-panel min-h-24 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-950/70 p-4 text-lg leading-8 tracking-wide text-slate-300">
      <div className="typing-text relative whitespace-pre-wrap break-words">
        {model.map((item) => {
          const isCaret = active && item.index === inputValue.length;
          return (
            <span key={item.index} className={`typing-char ${item.state}`} ref={isCaret ? activeCharRef : null}>
              {isCaret && <span className="typing-caret" aria-hidden="true" />}
              {item.value || ' '}
            </span>
          );
        })}
        {active && inputValue.length >= prompt.length && <span className="typing-caret" aria-hidden="true" />}
      </div>
    </div>
  );
}

export default memo(TypingPanel);
