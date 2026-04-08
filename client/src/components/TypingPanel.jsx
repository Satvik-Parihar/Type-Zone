import { memo, useEffect, useMemo, useRef } from 'react';
import './TypingPanel.css';

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
        value: value === ' ' ? '·' : value,
        state: charState(prompt, actual, index, inputValue.length, finished),
        isSpace: value === ' ',
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
    return (
      <div className="typing-panel typing-panel-loading">
        <div className="typing-panel-placeholder">
          <p>Start a typing test to begin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`typing-panel ${active ? 'active' : ''} ${finished ? 'finished' : ''}`}>
      <div className="typing-panel-content">
        <div className="typing-text" role="log" aria-live="polite">
          {model.map((item) => {
            const isCaret = active && item.index === inputValue.length;
            const isCorrect = item.state === 'correct';
            const isIncorrect = item.state === 'incorrect';
            const isExtra = item.state === 'extra';

            return (
              <span
                key={item.index}
                className={`typing-char typing-char-${item.state} ${isCaret ? 'has-caret' : ''}`}
                ref={isCaret ? activeCharRef : null}
                data-state={item.state}
              >
                {item.value || ' '}
              </span>
            );
          })}
          {active && inputValue.length >= prompt.length && (
            <span className="typing-caret" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(TypingPanel);
