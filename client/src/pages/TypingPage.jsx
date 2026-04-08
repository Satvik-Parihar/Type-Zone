import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TypingArea from '../components/TypingArea';
import { Clock, Target } from 'lucide-react';

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
    <div className="min-h-screen bg-background pt-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Mode Selector - Top Center */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-2 bg-card/40 backdrop-blur-sm p-1.5 rounded-lg border border-border-dark">
              <button
                type="button"
                onClick={() => setMode('time')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === 'time' ? 'btn-primary' : 'text-text-secondary hover:text-text'
                }`}
              >
                <Clock className="w-4 h-4 inline-block mr-2" /> Time
              </button>
              <button
                type="button"
                onClick={() => setMode('words')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === 'words' ? 'btn-primary' : 'text-text-secondary hover:text-text'
                }`}
              >
                <Target className="w-4 h-4 inline-block mr-2" /> Words
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {(mode === 'time' ? timeOptions : wordOptions).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDuration(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
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

        {/* Main Typing Area - Centered & Large */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
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
