import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Brain, Lock, Keyboard, Flame, ShieldCheck, Activity } from 'lucide-react';
import TypingArea from '../components/TypingArea';
import api from '../utils/api';

const HOME_ROW = 'flask sad glad flak ash gash lash dash flash glass slag';
const TOP_ROW = 'proper tower retype power quote pretty poetry yore';
const BOTTOM_ROW = 'van cab numb zinc cave venom';
const NUMBER_ROWS = '1 2 3 4 5 6 7 8 9 0 10 20 30 42 100 200 512 1024 314 271 618';
const PUNCTUATION_ROWS = 'Hello, world! Ready to type: fast, accurate, and consistent?';

function buildWeakKeyText(weakKeys = []) {
  if (!weakKeys.length) {
    return 'keyboard rhythm keeps your fingers moving with steady control';
  }

  const alphabet = weakKeys.filter(Boolean).map((k) => k.toLowerCase()[0]).slice(0, 6);
  const fragments = alphabet.map((k) => `${k}${k} ${k}a ${k}e ${k}i ${k}o ${k}u`);
  return [`focus on ${alphabet.join(' ')}`, ...fragments, 'repeat with patience and accuracy'].join(' ');
}

function createDrills(weakKeys = []) {
  return [
    {
      id: 'home-row',
      title: 'Home Row Drill',
      icon: Target,
      difficulty: 'Beginner',
      description: 'Build muscle memory around ASDF and JKL; with rhythmic combos.',
      rounds: [{ text: HOME_ROW, mode: 'words', duration: 45 }],
    },
    {
      id: 'top-row',
      title: 'Top Row Drill',
      icon: Keyboard,
      difficulty: 'Beginner',
      description: 'Reach smoothly across qwertyuiop without looking down.',
      rounds: [{ text: TOP_ROW, mode: 'words', duration: 45 }],
    },
    {
      id: 'bottom-row',
      title: 'Bottom Row Drill',
      icon: Flame,
      difficulty: 'Intermediate',
      description: 'Strengthen pinky and ring finger control on zxcvbnm.',
      rounds: [{ text: BOTTOM_ROW, mode: 'words', duration: 45 }],
    },
    {
      id: 'numbers',
      title: 'Numbers Drill',
      icon: Activity,
      difficulty: 'Intermediate',
      description: 'Train number row speed, spacing, and precision.',
      rounds: [{ text: NUMBER_ROWS, mode: 'numbers', duration: 45 }],
    },
    {
      id: 'punctuation',
      title: 'Punctuation Drill',
      icon: ShieldCheck,
      difficulty: 'Intermediate',
      description: 'Keep punctuation sharp while maintaining rhythm.',
      rounds: [{ text: PUNCTUATION_ROWS, mode: 'punctuation', duration: 45 }],
    },
    {
      id: 'speed-burst',
      title: 'Speed Burst',
      icon: Zap,
      difficulty: 'Advanced',
      description: 'Three short timed rounds with increasing pressure.',
      rounds: [
        { text: 'fast hands steady mind sharp focus quick rhythm', mode: 'time', duration: 15 },
        { text: 'speed builds from calm repetition and clean timing', mode: 'time', duration: 15 },
        { text: 'accelerate without losing control or accuracy', mode: 'time', duration: 15 },
      ],
    },
    {
      id: 'accuracy-focus',
      title: 'Accuracy Focus',
      icon: Brain,
      difficulty: 'Advanced',
      description: 'Repeat the same text three times and stay above 95% accuracy.',
      rounds: [
        { text: 'accuracy before speed builds durable confidence', mode: 'time', duration: 30 },
        { text: 'accuracy before speed builds durable confidence', mode: 'time', duration: 30 },
        { text: 'accuracy before speed builds durable confidence', mode: 'time', duration: 30 },
      ],
      failBelowAccuracy: 95,
    },
    {
      id: 'weak-keys',
      title: 'Weak Keys',
      icon: Lock,
      difficulty: 'Expert',
      description: 'Auto-generates text around your least accurate characters.',
      rounds: [{ text: buildWeakKeyText(weakKeys), mode: 'custom', duration: 45 }],
    },
  ];
}

function DrillCard({ drill, completed, onOpen }) {
  const Icon = drill.icon;
  const progress = completed ? 100 : 0;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onOpen}
      className="text-left"
    >
      <div className={`card p-6 h-full transition ${completed ? 'border-accent/70' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <Icon className="w-8 h-8 text-accent" />
          <span className={`text-xs px-2 py-1 rounded badge ${
            drill.difficulty === 'Beginner'
              ? 'bg-green-500/20 text-correct'
              : drill.difficulty === 'Intermediate'
                ? 'bg-yellow-500/20 text-accent'
                : drill.difficulty === 'Advanced'
                  ? 'bg-red-500/20 text-error'
                  : 'bg-purple-500/20 text-accent'
          }`}>
            {drill.difficulty}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-text mb-2">{drill.title}</h3>
        <p className="text-text-secondary text-sm mb-6">{drill.description}</p>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-text-secondary">{completed ? 'Completed' : 'Not started'}</p>
            <p className="text-xs font-semibold text-accent">{Math.round(progress)}%</p>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-accent h-full rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="text-xs text-text-secondary">
          {drill.rounds.length} round{drill.rounds.length > 1 ? 's' : ''}
        </div>
      </div>
    </motion.button>
  );
}

export default function PracticePage() {
  const [weakKeys, setWeakKeys] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeRound, setActiveRound] = useState(0);
  const [completedDrills, setCompletedDrills] = useState([]);
  const [roundResults, setRoundResults] = useState([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWeakKeys() {
      try {
        const { data } = await api.get('/typing/sessions', { params: { limit: 25 } });
        if (cancelled) return;

        const frequencies = new Map();
        for (const session of data?.sessions || []) {
          const entries = session?.keyAccuracy ? Object.entries(session.keyAccuracy) : [];
          for (const [key, value] of entries) {
            const accuracy = Number(value);
            if (!Number.isFinite(accuracy)) continue;
            if (accuracy < 85) {
              frequencies.set(key, (frequencies.get(key) || 0) + (100 - accuracy));
            }
          }
        }

        const ranked = [...frequencies.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key);
        setWeakKeys(ranked.slice(0, 5));
      } catch (error) {
        setWeakKeys([]);
      }
    }

    loadWeakKeys();
    return () => {
      cancelled = true;
    };
  }, []);

  const drills = useMemo(() => createDrills(weakKeys), [weakKeys]);
  const selectedDrill = drills.find((drill) => drill.id === selectedId) || null;
  const completedCount = completedDrills.length;

  useEffect(() => {
    if (!selectedDrill) return;
    if (activeRound >= selectedDrill.rounds.length) {
      if (!completedDrills.includes(selectedDrill.id)) {
        setCompletedDrills((current) => [...current, selectedDrill.id]);
      }
      setSelectedId(null);
      setActiveRound(0);
      setFailed(false);
      setRoundResults([]);
    }
  }, [activeRound, selectedDrill, completedDrills]);

  const startDrill = (drillId) => {
    setSelectedId(drillId);
    setActiveRound(0);
    setRoundResults([]);
    setFailed(false);
  };

  const handleRoundComplete = (metrics) => {
    if (!selectedDrill) return;

    const nextResults = [...roundResults, metrics];
    setRoundResults(nextResults);

    if (selectedDrill.failBelowAccuracy && (metrics.accuracy || 0) < selectedDrill.failBelowAccuracy) {
      setFailed(true);
      return;
    }

    if (activeRound + 1 >= selectedDrill.rounds.length) {
      setCompletedDrills((current) => (current.includes(selectedDrill.id) ? current : [...current, selectedDrill.id]));
      setSelectedId(null);
      setActiveRound(0);
      return;
    }

    setActiveRound((current) => current + 1);
  };

  const currentRound = selectedDrill?.rounds[activeRound];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-text mb-2">Practice</h1>
          <p className="text-text-secondary">Targeted drills for speed, accuracy, and key control.</p>
        </div>

        <div className="mb-8 card p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-text-secondary uppercase tracking-widest">Drill Progress</p>
              <p className="text-2xl font-semibold text-text">{completedCount}/{drills.length} complete</p>
            </div>
            <p className="text-sm text-text-secondary">Finish all drills to unlock the full practice track.</p>
          </div>
          <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{ width: `${(completedCount / drills.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {drills.map((drill) => (
            <DrillCard
              key={drill.id}
              drill={drill}
              completed={completedDrills.includes(drill.id)}
              onOpen={() => startDrill(drill.id)}
            />
          ))}
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold text-text mb-4">Practice Tips</h2>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex gap-3"><span className="text-accent">•</span><span>Use deliberate, even strokes instead of rushing through repeats.</span></li>
            <li className="flex gap-3"><span className="text-accent">•</span><span>When a drill feels easy, increase speed only after your accuracy stabilizes.</span></li>
            <li className="flex gap-3"><span className="text-accent">•</span><span>Work weak keys in short bursts; consistency beats brute force.</span></li>
          </ul>
        </div>
      </div>

      <AnimatePresence>
        {selectedDrill && currentRound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-secondary mb-2">
                    Round {activeRound + 1} of {selectedDrill.rounds.length}
                  </p>
                  <h2 className="text-3xl font-bold text-text mb-2">{selectedDrill.title}</h2>
                  <p className="text-text-secondary max-w-2xl">{selectedDrill.description}</p>
                </div>
                <button className="btn-ghost" onClick={() => { setSelectedId(null); setActiveRound(0); setRoundResults([]); setFailed(false); }}>
                  Close
                </button>
              </div>

              {failed ? (
                <div className="card p-6 border border-red-500/40 bg-red-500/10 text-red-200">
                  Accuracy dropped below {selectedDrill.failBelowAccuracy}% on this drill. Try again from the first round.
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap gap-2 items-center text-sm text-text-secondary">
                    <span className="badge">{currentRound.mode}</span>
                    <span className="badge">{currentRound.duration}s</span>
                    <span className="badge">{currentRound.text.split(/\s+/).length} words</span>
                  </div>

                  <TypingArea
                    key={`${selectedDrill.id}-${activeRound}`}
                    text={currentRound.text}
                    mode={currentRound.mode}
                    duration={currentRound.duration}
                    onComplete={handleRoundComplete}
                    showModeSelector={false}
                    showActionButtons={true}
                  />

                  <p className="text-center text-xs text-text-secondary mt-2 opacity-60">
                    Tab — restart · Esc — stop
                  </p>

                  {selectedDrill.rounds.length > 1 && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-text-secondary mb-2">
                        <span>Round Progress</span>
                        <span>{activeRound}/{selectedDrill.rounds.length - 1}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-accent"
                          animate={{ width: `${(activeRound / selectedDrill.rounds.length) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {roundResults.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roundResults.map((result, idx) => (
                    <div key={idx} className="card p-4">
                      <p className="text-xs uppercase tracking-widest text-text-secondary mb-2">Round {idx + 1}</p>
                      <p className="text-3xl font-bold text-accent">{Math.round(result.wpm || 0)} WPM</p>
                      <p className="text-sm text-text-secondary">{Math.round(result.accuracy || 0)}% accuracy</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
