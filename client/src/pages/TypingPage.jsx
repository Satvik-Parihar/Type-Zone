import { useState, useCallback } from 'react';
import TypingArea from '../components/TypingArea';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TEST_TEXTS = [
  'the quick brown fox jumps over the lazy dog several times each day under the bright sun',
  'in the age of technology innovation drives progress and shapes the future of humanity',
  'practice makes perfect and consistency is the key to mastering any skill over time',
  'typing speed is not just about velocity but also about accuracy and maintaining focus',
  'every character matters and attention to detail separates good typists from great ones',
];

export default function TypingPage() {
  const [testText, setTestText] = useState(TEST_TEXTS[0]);
  const [currentMode, setCurrentMode] = useState('time');
  const [currentDuration, setCurrentDuration] = useState(60);
  const [testResults, setTestResults] = useState(null);
  const { user } = useAuth();
  const toast = useToast();

  const handleTestComplete = useCallback(async (metrics) => {
    setTestResults(metrics);

    if (!user) {
      return;
    }

    try {
      await api.post('/typing/sessions', {
        textId: 'practice-generated',
        mode: currentMode,
        wpm: metrics.wpm,
        rawWpm: metrics.rawWpm,
        accuracy: metrics.accuracy,
        consistency: metrics.consistency,
        errorCount: metrics.errors,
        timeTaken: metrics.time,
        keystrokesPerSecond: metrics.kps,
        wpmHistory: metrics.wpmHistory || [],
        keyAccuracy: metrics.keyAccuracy || {},
        keystrokeTimeline: metrics.keystrokeTimeline || []
      });
      toast.success('Session saved to your profile');
    } catch (error) {
      toast.warning('Session finished, but could not be saved');
    }
  }, [currentMode, toast, user]);

  const handleNewTest = useCallback(() => {
    const randomText = TEST_TEXTS[Math.floor(Math.random() * TEST_TEXTS.length)];
    setTestText(randomText);
    setTestResults(null);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <TypingArea
          text={testText}
          mode={currentMode}
          duration={currentDuration}
          onComplete={handleTestComplete}
        />
      </div>
    </div>
  );
}
