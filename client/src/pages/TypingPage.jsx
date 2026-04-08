import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TypingArea from '../components/TypingArea';
import { Clock, Target, Zap } from 'lucide-react';

const samplePrompts = [
  'The sunrise painted the sky with gold and violet.',
  'Precision matters more than speed in the early stages.',
  'Every keystroke shapes your rhythm and consistency.',
];

const TypingPage = () => {
  const [mode, setMode] = useState('time');
  const [duration, setDuration] = useState(60);
  const [text, setText] = useState(samplePrompts[0]);

  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        setMode((current) => (current === 'time' ? 'words' : 'time'));
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        window.dispatchEvent(new Event('typezone-reset'));
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleComplete = (metrics) => {
    console.log('Results:', metrics);
  };

  return (
    <div className="min-h-screen bg-background pt-12 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-3">Typing test</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-text mb-4 leading-tight">Build speed with structure</h1>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Switch between time and word mode, push your consistency, and master accuracy under pressure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 sm:p-7 mb-10"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 rounded-lg bg-card/60 backdrop-blur-sm px-4 py-2.5 border border-border-dark text-xs text-text-secondary font-semibold uppercase tracking-wider">
                <Zap className="w-4 h-4 text-accent" />
                Tab to switch mode • Ctrl + R to restart
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setMode('time')}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    mode === 'time' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <Clock className="w-4 h-4 inline-block mr-2" /> Time
                </button>
                <button
                  type="button"
                  onClick={() => setMode('words')}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    mode === 'words' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <Target className="w-4 h-4 inline-block mr-2" /> Words
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-auto">
              {(mode === 'time' ? timeOptions : wordOptions).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDuration(value)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    duration === value 
                      ? 'btn-primary' 
                      : 'bg-card/60 border border-border-dark text-text-secondary hover:border-accent hover:text-accent'
                  }`}
                >
                  {mode === 'time' ? `${value}s` : `${value}w`}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
        >
          <TypingArea
            text={text}
            mode={mode}
            duration={duration}
            onComplete={handleComplete}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default TypingPage;
