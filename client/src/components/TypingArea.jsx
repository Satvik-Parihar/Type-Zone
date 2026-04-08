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

const TypingArea = ({ text, mode = 'time', duration = 60, onComplete }) => {
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

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="grid gap-6 md:grid-cols-[1fr_280px] mb-8">
        <div className="glass-panel p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Live metrics</p>
              <h2 className="text-2xl font-bold text-text mt-2">Typing performance</h2>
            </div>
            <div className="rounded-lg bg-card/60 backdrop-blur-sm px-4 py-2.5 border border-border-dark text-sm font-medium text-text-secondary">
              {displayTime}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold">WPM</p>
              <p className="text-4xl font-bold text-accent mt-3">{metrics?.wpm ?? 0}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Accuracy</p>
              <p className="text-4xl font-bold text-correct mt-3">{metrics?.accuracy ?? 100}%</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Errors</p>
              <p className="text-4xl font-bold text-error mt-3">{metrics?.errors ?? 0}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Correct</p>
              <p className="text-4xl font-bold text-text mt-3">{metrics?.correct ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-start gap-3 mb-6">
            <Activity className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-text">Focus on precision</p>
              <p className="text-xs text-text-secondary mt-1">Speed follows accuracy naturally.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-card/60 backdrop-blur-sm p-3.5 border border-border-dark">
              <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Start</p>
              <p className="mt-2 text-lg font-bold text-text">Enter</p>
            </div>
            <div className="rounded-lg bg-card/60 backdrop-blur-sm p-3.5 border border-border-dark">
              <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Reset</p>
              <p className="mt-2 text-lg font-bold text-text">Esc</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`glass-panel p-7 border transition-all duration-300 ${
          isFocused ? 'border-accent shadow-[0_0_40px_rgba(92,225,230,0.15)]' : 'border-border'
        }`}
        onClick={focusInput}
      >
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Prompt</p>
            <p className="mt-1 text-sm text-text-secondary">Keep your eyes on the target text.</p>
          </div>
          <div className="rounded-lg bg-accent/15 px-4 py-2 text-sm font-semibold text-accent border border-accent/30">
            {mode === 'time' ? `${duration}s Mode` : `${duration} Words`}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm p-7 border border-border-dark min-h-[200px]">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(92,225,230,0.08),_transparent_60%)]" />
          <div className="relative z-10 flex flex-wrap gap-1.5 leading-10 font-mono text-base sm:text-lg tracking-wider font-medium">
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

        <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center gap-3">
          <button type="button" onClick={startTest} className="btn-primary text-sm">
            <Play className="w-4 h-4 mr-2" />
            Start test
          </button>
          <button type="button" onClick={resetTest} className="btn-secondary text-sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </button>
          <div className="rounded-lg bg-card/60 backdrop-blur-sm px-4 py-2.5 text-xs text-text-secondary border border-border-dark font-medium">
            <Clock className="w-3.5 h-3.5 inline-block mr-2" />
            Tab to switch mode
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingArea;
