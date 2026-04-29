import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap, Target } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';

// Character token component
const CharacterToken = ({ char, status }) => {
  let className = 'relative inline w-auto text-2xl leading-relaxed font-mono tracking-wider ';
  
  if (status === 'correct') {
    className += 'text-text';
  } else if (status === 'incorrect') {
    className += 'text-error bg-error/20';
  } else if (status === 'extra') {
    className += 'text-error/70';
  } else {
    className += 'text-text-secondary';
  }

  return (
    <span className={className}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
};

// Animated cursor beam
const CursorBeam = ({ isActive }) => (
  isActive ? (
    <motion.div
      className="absolute top-0 h-full w-0.5 bg-cursor shadow-[0_0_8px_var(--color-cursor)]"
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
  ) : null
);

// Live WPM sparkline
const WPMSparkline = ({ wpmHistory = [] }) => {
  if (wpmHistory.length < 2) return null;
  
  const maxWPM = Math.max(...wpmHistory, 100);
  const points = wpmHistory.map((wpm, i) => {
    const x = (i / (wpmHistory.length - 1)) * 100;
    const y = 100 - (wpm / maxWPM) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-16 h-8 ml-2" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-accent"
      />
    </svg>
  );
};

// Mode selector
const ModeSelector = ({ mode, duration, wordCount, onModeChange, onDurationChange, onWordCountChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {[15, 30, 60, 120].map(time => (
        <button
          key={`time-${time}`}
          onClick={() => {
            onModeChange('time');
            onDurationChange(time);
          }}
          className={`badge transition-all ${
            mode === 'time' && duration === time
              ? 'bg-accent text-background border-accent'
              : 'bg-surface border-border hover:border-accent'
          }`}
        >
          {time}s
        </button>
      ))}
      
      {[10, 25, 50, 100].map(count => (
        <button
          key={`words-${count}`}
          onClick={() => {
            onModeChange('words');
            onWordCountChange(count);
          }}
          className={`badge transition-all ${
            mode === 'words' && wordCount === count
              ? 'bg-accent text-background border-accent'
              : 'bg-surface border-border hover:border-accent'
          }`}
        >
          {count} words
        </button>
      ))}
    </div>
  );
};

// Results screen — enhanced with WPM sparkline and character heatmap driven by metrics
const ResultsScreen = ({ metrics, text, onNewTest, onRetry }) => {
  if (!metrics || !metrics.isFinished) return null;

  const wpmHistory = Array.isArray(metrics.wpmHistory) ? metrics.wpmHistory : [];
  const keyAccuracy = metrics.keyAccuracy || {};

  const renderSparkline = (data = []) => {
    if (!data.length) return null;
    const max = Math.max(...data, 100);
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" />
      </svg>
    );
  };

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel p-8 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-4xl font-bold text-text mb-6">Test Complete</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-text-secondary text-sm mb-2">WPM History</p>
            {renderSparkline(wpmHistory)}
          </div>
          <div>
            <p className="text-text-secondary text-sm mb-2">Summary</p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">WPM</p>
                <p className="text-3xl font-bold text-accent">{Math.round(metrics.wpm || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-correct">{Math.round(metrics.accuracy || 100)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Errors</p>
                <p className="text-3xl font-bold text-error">{metrics.errorCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-text-secondary text-sm mb-3">Character Heatmap (accuracy)</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
            {alphabet.map((char) => {
              const val = keyAccuracy[char] ?? null;
              const pct = typeof val === 'number' ? Math.round(val) : null;
              const bg = pct === null ? 'bg-surface' : pct > 80 ? 'bg-green-600/80 text-white' : pct > 60 ? 'bg-amber-500/80 text-white' : 'bg-red-600/80 text-white';
              return (
                <div
                  key={char}
                  className={`w-7 h-7 rounded text-xs flex items-center justify-center font-mono font-bold border border-border ${bg}`}
                  title={pct === null ? `${char}: no data` : `${char}: ${pct}% accuracy`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button onClick={onNewTest} className="btn-primary flex-1">New Test</button>
          <button onClick={onRetry} className="btn-secondary flex-1">Retry</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main TypingArea component
export default function TypingArea({ text = '', mode = 'time', duration = 60, onComplete, minimal = false }) {
  const [selectedMode, setSelectedMode] = useState(mode);
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const [selectedWordCount, setSelectedWordCount] = useState(25);
  const [testText, setTestText] = useState(text);

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
  } = useTypingEngine(testText, selectedMode, selectedDuration);

  const handleModeChange = useCallback((newMode) => {
    setSelectedMode(newMode);
    resetTest();
  }, [resetTest]);

  const handleDurationChange = useCallback((newDuration) => {
    setSelectedDuration(newDuration);
    resetTest();
  }, [resetTest]);

  const handleWordCountChange = useCallback((newCount) => {
    setSelectedWordCount(newCount);
    resetTest();
  }, [resetTest]);

  const handleNewTest = useCallback(() => {
    resetTest();
    setTestText(text);
  }, [resetTest, text]);

  const handleRetry = useCallback(() => {
    resetTest();
  }, [resetTest]);

  useEffect(() => {
    if (isFinished && onComplete) {
      onComplete({ ...metrics, isFinished: true });
    }
  }, [isFinished, metrics, onComplete]);

  const characters = useMemo(() => testText.split(''), [testText]);
  const tokens = useMemo(() => {
    return characters.map((char, index) => {
      const isTyped = index < input.length;
      const isError = errors.has(index);
      let status = 'pending';

      if (isTyped) {
        if (input[index] === undefined) {
          status = 'pending';
        } else if (input[index] === char) {
          status = 'correct';
        } else {
          status = 'incorrect';
        }
      }

      return { char, status };
    });
  }, [characters, input, errors]);

  // Minimal mode for homepage
  if (minimal) {
    return (
      <div className="w-full">
        <div className="glass-panel p-8 rounded-2xl cursor-text" onClick={() => inputRef.current?.focus()}>
          <div className="relative bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border-dark min-h-[120px] overflow-hidden">
            <div className="flex flex-wrap gap-1 leading-relaxed font-mono text-lg">
              {tokens.map((token, idx) => (
                <CharacterToken key={idx} char={token.char} status={token.status} />
              ))}
            </div>
            {!isActive && !isFinished && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                <p className="text-text-secondary">Click to start typing...</p>
              </div>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isActive) startTest();
                if (e.key === 'Escape') resetTest();
              }}
              className="absolute inset-0 opacity-0 cursor-text"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    );
  }

  // Full mode for typing page
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Mode selector */}
      <ModeSelector
        mode={selectedMode}
        duration={selectedDuration}
        wordCount={selectedWordCount}
        onModeChange={handleModeChange}
        onDurationChange={handleDurationChange}
        onWordCountChange={handleWordCountChange}
      />

      {/* Live metrics bar */}
      <div className="flex items-center justify-center gap-8 mb-8 py-4 border-b border-border flex-wrap">
        <div className="flex items-center">
          <div className="text-center">
            <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">WPM</p>
            <div className="flex items-center">
              <p className="text-4xl font-bold text-accent">{Math.round(metrics.wpm || 0)}</p>
              <WPMSparkline wpmHistory={metrics.wpmHistory} />
            </div>
          </div>
        </div>

        <div className="w-px h-12 bg-border hidden sm:block" />

        <div className="text-center">
          <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Accuracy</p>
          <p className="text-4xl font-bold text-correct">{Math.round(metrics.accuracy || 100)}%</p>
        </div>

        <div className="w-px h-12 bg-border hidden sm:block" />

        <div className="text-center">
          <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Time</p>
          <p className="text-4xl font-bold text-text">
            {selectedMode === 'time' ? `${metrics.timeLeft || selectedDuration}s` : `${currentIndex}/${testText.length}`}
          </p>
        </div>
      </div>

      {/* Typing area */}
      <div
        className="glass-panel p-12 rounded-2xl cursor-text mb-8 min-h-[280px] relative"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="relative h-40 overflow-hidden flex flex-col justify-center">
          <div className="flex flex-wrap gap-1 leading-loose font-mono text-2xl break-words">
            {tokens.map((token, idx) => (
              <CharacterToken key={idx} char={token.char} status={token.status} />
            ))}
          </div>
          
          <CursorBeam isActive={isActive} />
        </div>

        {!isActive && !isFinished && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-text-secondary text-lg">Start typing or press Enter to begin...</p>
          </div>
        )}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              resetTest();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              resetTest();
            }
            if (e.key === 'Enter' && !isActive && !isFinished) {
              e.preventDefault();
              startTest();
            }
          }}
          className="absolute inset-0 opacity-0 cursor-text"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {/* Control buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={startTest}
          disabled={isActive}
          className="btn-primary disabled:opacity-50"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isActive ? 'Testing...' : 'Start Test'}
        </button>
        <button onClick={resetTest} className="btn-ghost">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </button>
      </div>

      {/* Results screen */}
      <ResultsScreen
        metrics={metrics}
        text={testText}
        onNewTest={handleNewTest}
        onRetry={handleRetry}
      />
    </div>
  );
}
