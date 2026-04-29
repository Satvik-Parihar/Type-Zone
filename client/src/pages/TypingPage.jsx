import { useCallback } from 'react';
import TypingArea from '../components/TypingArea';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function TypingPage() {
  const { user } = useAuth();
  const toast = useToast();

  const handleTestComplete = useCallback(async (metrics) => {
    if (!user) {
      return;
    }

    try {
      const { data } = await api.post('/typing/sessions', {
        textId: 'practice-generated',
        mode: metrics.mode || 'time',
        wpm: metrics.wpm,
        rawWpm: metrics.rawWpm || 0,
        accuracy: metrics.accuracy,
        consistency: metrics.consistency || 100,
        errorCount: metrics.errorCount || 0,
        timeTaken: metrics.time,
        keystrokesPerSecond: metrics.keystrokesPerSecond || 0,
        wpmHistory: metrics.wpmHistory || [],
        keyAccuracy: metrics.keyAccuracy || {},
        keystrokeTimeline: metrics.keystrokeTimeline || []
      });
      toast.success('Session saved');

      if (Array.isArray(data?.newAchievements)) {
        data.newAchievements.forEach((achievement) => {
          toast.success(`Achievement unlocked: ${achievement.title || achievement.key || 'Unknown'}`);
        });
      }
    } catch (error) {
      toast.warning('Could not save session');
    }
  }, [toast, user]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <TypingArea onComplete={handleTestComplete} />
      </div>
    </div>
  );
}
