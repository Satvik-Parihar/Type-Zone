import { useEffect, useMemo, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap, Target } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { generatePrompt } from '../utils/typingData';
import { playSound } from '../utils/sounds';

// Character token component
const CharacterToken = ({ char, status, innerRef }) => {
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
    <span ref={innerRef} className={className}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
};

// Animated cursor beam positioned to follow current character
const CursorBeam = ({ isActive, left = 0, top = 0, height = 24 }) => (
  isActive ? (
    <motion.div
      className="absolute bg-cursor shadow-[0_0_12px_var(--color-accent)]"
      style={{ 
        width: 2, 
        left, 
        top, 
        height,
        boxShadow: '0 0 12px var(--color-accent), 0 0 6px var(--color-accent, rgba(92, 225, 230, 0.6))',
      }}
      animate={{ opacity: [1, 0.4, 1], boxShadow: ['0 0 12px var(--color-accent)', '0 0 20px var(--color-accent)', '0 0 12px var(--color-accent)'] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
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
const ModeSelector = ({
  mode,
  duration,
  wordCount,
  onModeChange,
  onDurationChange,
  onWordCountChange,
  codeLang,
  onCodeLangChange,
  customText,
  onCustomChange,
  onCustomStart,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap justify-center gap-2 mb-4">
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

        <button
          onClick={() => onModeChange('quote')}
          className={`badge ${mode === 'quote' ? 'bg-accent text-background' : 'bg-surface border-border'}`}
        >
          Quote
        </button>

        <button
          onClick={() => onModeChange('code')}
          className={`badge ${mode === 'code' ? 'bg-accent text-background' : 'bg-surface border-border'}`}
        >
          Code
        </button>

        <button
          onClick={() => onModeChange('numbers')}
          className={`badge ${mode === 'numbers' ? 'bg-accent text-background' : 'bg-surface border-border'}`}
        >
          Numbers
        </button>

        <button
          onClick={() => onModeChange('custom')}
          className={`badge ${mode === 'custom' ? 'bg-accent text-background' : 'bg-surface border-border'}`}
        >
          Custom
        </button>

        <button
          onClick={() => onModeChange('zen')}
          className={`badge ${mode === 'zen' ? 'bg-accent text-background' : 'bg-surface border-border'}`}
        >
          Zen
        </button>
      </div>

      {mode === 'code' && (
        <div className="flex justify-center gap-2 mb-4">
          {['javascript', 'python', 'go'].map((lang) => (
            <button
              key={lang}
              onClick={() => onCodeLangChange(lang)}
              className={`badge ${codeLang === lang ? 'bg-accent text-background' : 'bg-surface border-border'}`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {mode === 'custom' && (
        <div className="flex flex-col items-center gap-2">
          <textarea
            placeholder="Paste custom text here"
            value={customText}
            onChange={(e) => onCustomChange(e.target.value)}
            className="w-full max-w-2xl p-3 bg-surface border border-border rounded-md text-text"
            rows={4}
          />
          <div>
            <button onClick={() => onCustomStart()} className="btn-primary">Start</button>
          </div>
        </div>
      )}
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
    const max = Math.max(...data, 1);
    const pts = data.map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    }).join(' ');
    const first = '0,100';
    const last = '100,100';
    const area = `${first} ${pts} ${last}`;

    return (
      <svg className="w-full h-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#spark-fill)" />
        <polyline points={pts} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">WPM</p>
                <p className="text-3xl font-bold text-accent">{Math.round(metrics.wpm || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Raw WPM</p>
                <p className="text-3xl font-bold text-text">{Math.round(metrics.rawWpm || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-correct">{Math.round(metrics.accuracy || 100)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">Consistency</p>
                <p className="text-3xl font-bold text-text-secondary">{Math.round(metrics.consistency || 100)}%</p>
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
export default function TypingArea({
  text = '',
  mode = 'time',
  duration = 60,
  onComplete,
  minimal = false,
  showModeSelector = true,
  showActionButtons = true,
}) {
  const [selectedMode, setSelectedMode] = useState(mode);
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const [selectedWordCount, setSelectedWordCount] = useState(25);
  const [testText, setTestText] = useState(text);
  const [codeLang, setCodeLang] = useState('javascript');
  const [customText, setCustomText] = useState('');
  const [outerHeight, setOuterHeight] = useState(120); // pixels for 3 lines default
  const [translateY, setTranslateY] = useState(0);
  const [cursorPos, setCursorPos] = useState({ left: 0, top: 0, height: 24 });
  
  // Load sound settings from localStorage
  const [settings] = useState(() => {
    const saved = localStorage.getItem('typezone_settings');
    return saved ? JSON.parse(saved) : {
      soundEnabled: true,
      keypressSoundEnabled: true,
      volume: 70,
    };
  });
  
  const prevErrorCountRef = useRef(0);
  const prevInputLenRef = useRef(0);

  const {
    input,
    currentIndex,
    errors,
    isActive,
    isFinished,
    metrics,
    startTest,
    resetTest,
    handleInput: baseHandleInput,
    inputRef,
  } = useTypingEngine(testText, selectedMode, selectedDuration);
  
  // Wrapped input handler with sound integration
  const handleInput = useCallback((value) => {
    baseHandleInput(value);
    prevInputLenRef.current = value.length;
  }, [baseHandleInput]);
  
  // Play sounds on error detection or keypress via effect
  useEffect(() => {
    if (!isActive) return;
    
    const currentErrorCount = errors.size;
    const inputIncremented = input.length > prevInputLenRef.current;
    
    // Play keypress sound when character typed
    if (settings.soundEnabled && settings.keypressSoundEnabled && inputIncremented) {
      playSound('keypress');
    }
    
    // Play error sound when new errors detected
    if (settings.soundEnabled && currentErrorCount > prevErrorCountRef.current) {
      playSound('error');
    }
    
    prevErrorCountRef.current = currentErrorCount;
  }, [input.length, errors.size, isActive, settings]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        resetTest();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [resetTest, inputRef]);

  // Reset error tracking when test is reset
  useEffect(() => {
    if (!isActive && !isFinished) {
      prevErrorCountRef.current = 0;
      prevInputLenRef.current = 0;
    }
  }, [isActive, isFinished]);

  // Watch for external text changes (e.g. homepage rotating testWords)
  useEffect(() => {
    if (text && text !== testText) {
      setTestText(text);
      resetTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

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

  const buildGeneratedText = useCallback(() => {
    if (selectedMode === 'quote') {
      return generatePrompt('quote', selectedWordCount, 'english');
    }

    if (selectedMode === 'code') {
      return generatePrompt('code', selectedWordCount, codeLang);
    }

    if (selectedMode === 'numbers') {
      return generatePrompt('numbers', selectedWordCount, 'english');
    }

    if (selectedMode === 'custom') {
      return customText || '';
    }

    if (selectedMode === 'zen') {
      return generatePrompt('paragraph', 200, 'english');
    }

    if (selectedMode === 'words') {
      return generatePrompt('words', selectedWordCount, 'english');
    }

    return generatePrompt('time', Math.max(selectedWordCount, 120), 'english');
  }, [codeLang, customText, selectedMode, selectedWordCount]);

  const handleNewTest = useCallback(() => {
    resetTest();
    setTestText(buildGeneratedText());
  }, [buildGeneratedText, resetTest]);

  const handleRetry = useCallback(() => {
    resetTest();
  }, [resetTest]);

  useEffect(() => {
    if (isFinished && onComplete) {
      if (settings.soundEnabled) {
        playSound('complete');
      }
      onComplete({ ...metrics, isFinished: true, mode: selectedMode });
    }
  }, [isFinished, metrics, onComplete, settings, selectedMode]);

  // Generate content when mode changes
  useEffect(() => {
    setTestText(buildGeneratedText());
  }, [buildGeneratedText, selectedDuration]);

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

  const innerRef = useRef(null);
  const outerRef = useRef(null);
  const currentCharRef = useRef(null);

  // Measure and set outer height to be 3 lines
  useLayoutEffect(() => {
    const el = innerRef.current?.firstElementChild || currentCharRef.current;
    if (el) {
      const lh = el.getBoundingClientRect().height;
      setOuterHeight(Math.round(lh * 3));
      setCursorPos((p) => ({ ...p, height: lh }));
    }
  }, [testText]);

  // Update cursor position and translateY when currentIndex changes
  useLayoutEffect(() => {
    const charEl = currentCharRef.current;
    const innerEl = innerRef.current;
    if (!charEl || !innerEl) return;
    const innerRect = innerEl.getBoundingClientRect();
    const charRect = charEl.getBoundingClientRect();
    const left = charRect.left - innerRect.left + innerEl.scrollLeft;
    const top = charRect.top - innerRect.top + innerEl.scrollTop;
    setCursorPos({ left, top, height: charRect.height });

    const lineHeight = charRect.height;
    const line = Math.floor(top / lineHeight);
    const desired = Math.max(0, (line - 1) * lineHeight);
    setTranslateY(desired);
  }, [currentIndex, testText]);

  // Minimal mode for homepage
  if (minimal) {
    return (
      <div className="w-full">
        <div className="glass-panel p-8 rounded-2xl cursor-text" onClick={() => inputRef.current?.focus()}>
          <div className="relative bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border min-h-[120px] overflow-hidden">
            <div ref={outerRef} style={{ height: outerHeight, overflow: 'hidden' }}>
              <div ref={innerRef} className="flex flex-wrap gap-1 leading-relaxed font-mono text-lg" style={{ transform: `translateY(-${translateY}px)` }}>
                {tokens.map((token, idx) => (
                  <CharacterToken
                    key={idx}
                    char={token.char}
                    status={token.status}
                    innerRef={idx === currentIndex ? (el) => (currentCharRef.current = el) : null}
                  />
                ))}
              </div>
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
      {showModeSelector && (
        <ModeSelector
          mode={selectedMode}
          duration={selectedDuration}
          wordCount={selectedWordCount}
          onModeChange={handleModeChange}
          onDurationChange={handleDurationChange}
          onWordCountChange={handleWordCountChange}
          codeLang={codeLang}
          onCodeLangChange={(l) => { setCodeLang(l); resetTest(); }}
          customText={customText}
          onCustomChange={(v) => setCustomText(v)}
          onCustomStart={() => {
            setTestText(customText);
            resetTest();
            startTest();
          }}
        />
      )}

      {showModeSelector && (
        <p className="text-center text-xs text-text-secondary mb-4 opacity-60">
          Tab — restart · Esc — stop
        </p>
      )}

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
        <div className="relative overflow-hidden flex flex-col justify-center">
          <div ref={outerRef} style={{ height: outerHeight, overflow: 'hidden' }}>
            <div ref={innerRef} className="flex flex-wrap gap-1 leading-loose font-mono text-2xl break-words" style={{ transform: `translateY(-${translateY}px)` }}>
              {tokens.map((token, idx) => (
                <CharacterToken
                  key={idx}
                  char={token.char}
                  status={token.status}
                  innerRef={idx === currentIndex ? (el) => (currentCharRef.current = el) : null}
                />
              ))}
            </div>
          </div>

          <CursorBeam isActive={isActive} left={cursorPos.left} top={cursorPos.top} height={cursorPos.height} />
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
      {showActionButtons && (
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
      )}

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
