import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Activity, Clock, Keyboard } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';

const CharacterToken = ({ char, status, hasCaret }) => {
  const base = 'relative inline-flex whitespace-pre-wrap break-all text-base sm:text-lg';
  const statusStyles =
    status === 'correct'
      ? 'text-correct'
      : status === 'incorrect'
      ? 'text-error bg-error/10'
      : status === 'current'
      ? 'text-text underline decoration-accent/50 decoration-2'
      : 'text-text-secondary';

  return (
    <span className={`${base} ${statusStyles}`}>
      {char === ' ' ? '\u00A0' : char}
      {hasCaret && (
        <motion.span
          className="absolute -right-0.5 top-0 h-full w-[2px] bg-cursor"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </span>
  );
};

const TypingArea = ({ text, mode = 'time', duration = 60, onComplete, minimal = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const {
    input,
    currentIndex,
    errors,
    isActive,
    isFinished,
    metrics,
    startTest,
    resetTest,
    handleInput,
    inputRef,
  } = useTypingEngine(text, mode, duration);

  useEffect(() => {
    if (isFinished && onComplete) {
      onComplete(metrics);
    }
  }, [isFinished, metrics, onComplete]);

  useEffect(() => {
    const handleReset = () => resetTest();
    window.addEventListener('typezone-reset', handleReset);
    return () => window.removeEventListener('typezone-reset', handleReset);
  }, [resetTest]);

  const characters = useMemo(() => text.split(''), [text]);

  const tokens = useMemo(
    () =>
      characters.map((char, index) => {
        const isTyped = index < input.length;
        const isCurrent = index === currentIndex && isActive;
        const isError = errors.has(index);
        let status = 'pending';

        if (isTyped) {
          status = isError ? 'incorrect' : 'correct';
        } else if (isCurrent) {
          status = 'current';
        }

        return {
          char,
          status,
          hasCaret: isCurrent && !isFinished,
        };
      }),
    [characters, currentIndex, errors, input.length, isActive, isFinished]
  );

  const displayTime = mode === 'time' ? `${metrics?.timeLeft ?? duration}s left` : `${metrics?.words ?? 0}/${duration} words`;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !isActive && !isFinished) {
      event.preventDefault();
      startTest();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      resetTest();
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
      event.preventDefault();
      resetTest();
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Minimal mode for home page preview
  if (minimal) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div
          className="glass-panel p-7 border border-border cursor-text"
          onClick={focusInput}
        >
          <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm p-8 border border-border-dark min-h-[140px]">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(92,225,230,0.08),_transparent_60%)]" />
            <div className="relative z-10 flex flex-wrap gap-1.5 leading-9 font-mono text-sample tracking-wider font-medium">
              {tokens.map((token, index) => (
                <CharacterToken key={index} char={token.char} status={token.status} hasCaret={token.hasCaret} />
              ))}
            </div>
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={(event) => handleInput(event.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full cursor-text opacity-0"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
      </div>
    );
  }

  // Full dashboard mode for typing page
  return (
    <div className="w-full max-w-[900px] mx-auto">
      {/* Typing Area */}
      <div
        className={`glass-panel p-8 border transition-all duration-300 mb-8 ${
          isFocused ? 'border-accent shadow-[0_0_40px_rgba(92,225,230,0.15)]' : 'border-border'
        }`}
        onClick={focusInput}
      >
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm p-8 border border-border-dark min-h-[200px]">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(92,225,230,0.08),_transparent_60%)]" />
          <div className="relative z-10 flex flex-wrap gap-1.5 leading-10 font-mono text-lg tracking-wider font-medium">
            {tokens.map((token, index) => (
              <CharacterToken key={index} char={token.char} status={token.status} hasCaret={token.hasCaret} />
            ))}
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={(event) => handleInput(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute inset-0 w-full h-full cursor-text opacity-0"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Single Row Stats */}
      <div className="flex flex-wrap items-center justify-center gap-8 mb-8 py-6 border-t border-b border-border">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-text-secondary font-semibold">WPM</p>
          <p className="text-3xl font-bold text-accent mt-2">{metrics?.wpm ?? 0}</p>
        </div>
        <div className="hidden sm:block w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Accuracy</p>
          <p className="text-3xl font-bold text-correct mt-2">{metrics?.accuracy ?? 100}%</p>
        </div>
        <div className="hidden sm:block w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Errors</p>
          <p className="text-3xl font-bold text-error mt-2">{metrics?.errors ?? 0}</p>
        </div>
        <div className="hidden sm:block w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Time</p>
          <p className="text-3xl font-bold text-text mt-2">{metrics?.time ?? 0}s</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button type="button" onClick={startTest} className="btn-primary">
          <Play className="w-4 h-4 mr-2" />
          Start typing
        </button>
        <button type="button" onClick={resetTest} className="btn-secondary">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default TypingArea;
