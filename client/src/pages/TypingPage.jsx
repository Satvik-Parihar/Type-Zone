import { useEffect, useMemo, useRef, useState } from 'react';
import { generatePrompt } from '../utils/typingData';

const WORD_COUNT = 40;

export default function TypingPage() {
  const [prompt, setPrompt] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    resetTest();
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!startedAt || finished) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setElapsed(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
    }, 250);

    return () => clearInterval(intervalRef.current);
  }, [startedAt, finished]);

  const promptChars = useMemo(() => prompt.split(''), [prompt]);
  const typedChars = useMemo(() => inputValue.split(''), [inputValue]);

  const stats = useMemo(() => {
    const correctCount = promptChars.reduce((count, char, index) => {
      return count + (typedChars[index] === char ? 1 : 0);
    }, 0);

    const typedLength = Math.max(1, typedChars.length);
    const accuracy = Math.round((correctCount / typedLength) * 100);
    const words = Math.round(correctCount / 5);
    const minutes = Math.max(1 / 60, elapsed / 60);
    const wpm = Math.round(words / minutes);
    const errors = typedChars.reduce((count, char, index) => {
      if (index >= promptChars.length) return count + 1;
      return count + (char !== promptChars[index] ? 1 : 0);
    }, 0);

    return {
      accuracy: Number.isNaN(accuracy) ? 100 : Math.max(0, accuracy),
      wpm: finished ? Math.round((correctCount / 5) / Math.max(1, elapsed / 60)) : Math.max(0, Math.round(words / minutes)),
      errors,
      correctCount,
    };
  }, [promptChars, typedChars, elapsed, finished]);

  const characterRows = useMemo(() => {
    return promptChars.map((char, index) => {
      const typedChar = typedChars[index];
      let status = 'pending';

      if (typedChar === undefined) {
        status = 'pending';
      } else if (typedChar === char) {
        status = 'correct';
      } else {
        status = 'incorrect';
      }

      return { char, status, index };
    });
  }, [promptChars, typedChars]);

  const handleInput = (event) => {
    const value = event.target.value;

    if (!startedAt && value.length > 0) {
      setStartedAt(Date.now());
    }

    if (finished) {
      return;
    }

    if (value.length >= prompt.length) {
      setInputValue(value.slice(0, prompt.length));
      setFinished(true);
      return;
    }

    setInputValue(value);
  };

  const resetTest = () => {
    clearInterval(intervalRef.current);
    const nextPrompt = generatePrompt('sentence', WORD_COUNT);
    setPrompt(nextPrompt);
    setInputValue('');
    setStartedAt(null);
    setElapsed(0);
    setFinished(false);
  };

  return (
    <section className="page-section typing-page">
      <div className="section-header">
        <p className="eyebrow">Typing Test</p>
        <h1>Train speed, accuracy, and focus in every session.</h1>
        <p className="section-subtitle">
          Type the prompt below, watch errors appear in real time, and track your progress with clear metrics.
        </p>
      </div>

      <div className="typing-grid">
        <div className="typing-card glass-panel">
          <div className="typing-preview" aria-label="Typing prompt">
            <div className="typing-line">
              {characterRows.map(({ char, status, index }) => (
                <span
                  key={`${char}-${index}`}
                  className={`typing-char ${status} ${index === inputValue.length ? 'current' : ''}`}
                >
                  {char}
                  {index === inputValue.length && !finished && <span className="typing-caret" />}
                </span>
              ))}
            </div>
          </div>

          <label className="form-label" htmlFor="typing-input">
            Start typing below
          </label>
          <textarea
            id="typing-input"
            className="typing-input"
            value={inputValue}
            onChange={handleInput}
            placeholder="Begin typing the passage above..."
            rows={5}
            spellCheck="false"
          />

          <div className="typing-actions">
            <button type="button" className="btn btn-secondary" onClick={resetTest}>
              Reset Test
            </button>
            <div className="typing-summary">
              <span>{finished ? 'Finished' : 'Live'}</span>
              <span>{elapsed}s</span>
            </div>
          </div>
        </div>

        <aside className="typing-sidebar">
          <div className="stat-card">
            <span className="stat-label">WPM</span>
            <strong>{stats.wpm}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Accuracy</span>
            <strong>{stats.accuracy}%</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Errors</span>
            <strong>{stats.errors}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Characters</span>
            <strong>{prompt.length}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
