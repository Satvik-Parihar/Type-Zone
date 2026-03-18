import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TypingPanel from '../components/TypingPanel';
import { generatePrompt } from '../utils/typingData';
import { useTypingTelemetry } from '../features/typing/hooks/useTypingTelemetry';
import TypingControls from '../features/typing/components/TypingControls';
import AudioSettingsPanel from '../features/typing/components/AudioSettingsPanel';
import LiveMetricsGrid from '../features/stats/components/LiveMetricsGrid';
import PerformanceTrendChart from '../features/stats/components/PerformanceTrendChart';
import KeyboardHeatmap from '../features/stats/components/KeyboardHeatmap';
import RaceRoomPanel from '../features/multiplayer/components/RaceRoomPanel';
import { useAudioEngine } from '../features/typing/hooks/useAudioEngine';

const SETTINGS_KEY = 'typezone_settings_v4';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function HomePage() {
  const { user, logout } = useAuth();

  const [mode, setMode] = useState('words');
  const [difficulty, setDifficulty] = useState('medium');
  const [theme, setTheme] = useState('dark');
  const [timeLimit, setTimeLimit] = useState(60);
  const [wordCount, setWordCount] = useState(25);
  const [customText, setCustomText] = useState('');
  const [userSettings, setUserSettings] = useState({
    soundEnabled: true,
    keypressSoundEnabled: true,
    ambienceEnabled: false,
    ambienceVolume: 0.2,
    typingSoundProfile: 'classic'
  });
  const [settingsHydrated, setSettingsHydrated] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [textId, setTextId] = useState('');
  const [activeMode, setActiveMode] = useState('words');
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(0);

  const [metrics, setMetrics] = useState({
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    errorCount: 0,
    consistency: 100,
    keystrokesPerSecond: 0
  });

  const [summary, setSummary] = useState({ testsCompleted: 0, bestWpm: 0, averageWpm: 0, averageAccuracy: 0, streakDays: 0 });
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [activeTournamentId, setActiveTournamentId] = useState('');

  const [raceRoom, setRaceRoom] = useState('global-room');
  const [racePlayers, setRacePlayers] = useState([]);
  const [raceWinner, setRaceWinner] = useState('');

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const promptRef = useRef('');

  const {
    inputValue,
    applyInput,
    resetTelemetry,
    buildMetrics,
    telemetryPayload,
    topKeyMistakes
  } = useTypingTelemetry();

  const { playKeypress } = useAudioEngine({
    soundEnabled: userSettings.soundEnabled,
    keypressSoundEnabled: userSettings.keypressSoundEnabled,
    ambienceEnabled: userSettings.ambienceEnabled,
    ambienceVolume: userSettings.ambienceVolume,
    typingSoundProfile: userSettings.typingSoundProfile
  });

  const clearRuntime = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const elapsedSeconds = useCallback(() => {
    if (!startedAtRef.current) return 0;
    return Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
  }, []);

  const finishTest = useCallback(async () => {
    if (!active || !promptRef.current || !textId) {
      return;
    }

    clearRuntime();
    setActive(false);
    setFinished(true);

    const elapsed = elapsedSeconds();
    const finalMetrics = buildMetrics(promptRef.current, elapsed);
    setMetrics(finalMetrics);

    try {
      await api.post('/typing/submit', {
        textId,
        mode: activeMode,
        wpm: finalMetrics.wpm,
        rawWpm: finalMetrics.rawWpm,
        accuracy: finalMetrics.accuracy,
        errors: finalMetrics.errorCount,
        consistency: finalMetrics.consistency,
        keystrokesPerSecond: finalMetrics.keystrokesPerSecond,
        timeTaken: elapsed,
        rawInput: telemetryPayload.inputValue,
        keystrokeTimeline: telemetryPayload.keystrokeTimeline,
        correctionPatterns: telemetryPayload.correctionPatterns,
        keyMistakes: telemetryPayload.keyMistakes
      });

      socketRef.current?.emit('race:finish', {
        roomId: raceRoom,
        wpm: finalMetrics.wpm,
        accuracy: finalMetrics.accuracy
      });

      if (activeTournamentId) {
        await api.post('/tournaments/submit', {
          tournamentId: activeTournamentId,
          wpm: finalMetrics.wpm,
          accuracy: finalMetrics.accuracy
        });
      }

      const [{ data: profileData }, { data: historyData }, { data: leaderboardData }, { data: analyticsData }, { data: tournamentData }] = await Promise.all([
        api.get('/user/profile'),
        api.get('/typing/history'),
        api.get('/leaderboard'),
        api.get('/typing/analytics'),
        api.get('/tournaments')
      ]);

      setSummary({
        testsCompleted: profileData.user.typingStats.testsCompleted,
        bestWpm: profileData.user.typingStats.bestWpm,
        averageWpm: profileData.user.typingStats.averageWpm,
        averageAccuracy: profileData.user.typingStats.averageAccuracy,
        streakDays: profileData.user.typingStats.streakDays
      });
      setHistory(historyData.history || []);
      setLeaderboard(leaderboardData.leaderboard || []);
      setAnalytics(analyticsData.analytics?.dailyPerformance || []);
      setTournaments(tournamentData.tournaments || []);
    } catch (_error) {
      return;
    }
  }, [active, activeMode, activeTournamentId, buildMetrics, clearRuntime, elapsedSeconds, raceRoom, telemetryPayload, textId]);

  const recomputeLiveMetrics = useCallback(() => {
    const elapsed = elapsedSeconds();
    const next = buildMetrics(promptRef.current, elapsed);
    setMetrics(next);

    if (activeMode === 'time') {
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimer(remaining);
      if (remaining <= 0 && active) {
        return { shouldFinish: true };
      }
    } else if (activeMode === 'zen') {
      setTimer(null);
    } else {
      setTimer(elapsed);
    }

    return { shouldFinish: false };
  }, [active, activeMode, buildMetrics, elapsedSeconds, timeLimit]);

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved.mode) setMode(saved.mode);
        if (saved.theme) setTheme(saved.theme);
        if (saved.difficulty) setDifficulty(saved.difficulty);
        if (saved.timeLimit) setTimeLimit(saved.timeLimit);
        if (saved.wordCount) setWordCount(saved.wordCount);
      } catch (_error) {
        localStorage.removeItem(SETTINGS_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode, theme, difficulty, timeLimit, wordCount }));
  }, [mode, theme, difficulty, timeLimit, wordCount]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    async function hydrateDashboard() {
      try {
        const [{ data: profileData }, { data: leaderboardData }, { data: challengeData }, { data: historyData }, { data: analyticsData }, { data: tournamentData }] = await Promise.all([
          api.get('/user/profile'),
          api.get('/leaderboard'),
          api.get('/challenges/daily'),
          api.get('/typing/history'),
          api.get('/typing/analytics'),
          api.get('/tournaments')
        ]);

        setSummary({
          testsCompleted: profileData.user.typingStats.testsCompleted,
          bestWpm: profileData.user.typingStats.bestWpm,
          averageWpm: profileData.user.typingStats.averageWpm,
          averageAccuracy: profileData.user.typingStats.averageAccuracy,
          streakDays: profileData.user.typingStats.streakDays
        });
        setLeaderboard(leaderboardData.leaderboard || []);
        setDailyChallenge(challengeData.challenge);
        setHistory(historyData.history || []);
        setAnalytics(analyticsData.analytics?.dailyPerformance || []);
        setTournaments(tournamentData.tournaments || []);
        if (profileData.user.settings) {
          setUserSettings((previous) => ({
            ...previous,
            ...profileData.user.settings
          }));
        }
        setSettingsHydrated(true);
      } catch (_error) {
        setSettingsHydrated(true);
        return;
      }
    }

    hydrateDashboard();
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500
    });

    socketRef.current.on('race:state', (state) => {
      if (Array.isArray(state)) {
        setRacePlayers(state || []);
      } else {
        setRacePlayers(state?.players || []);
      }
    });

    socketRef.current.on('race:finished', (payload) => {
      setRaceWinner(`${payload.winner} (${payload.wpm} WPM)`);
    });

    socketRef.current.on('race:rankedMatch', (payload) => {
      setRaceRoom(payload.roomId);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!active) return () => undefined;

    timerRef.current = setInterval(() => {
      const live = recomputeLiveMetrics();
      if (live?.shouldFinish) {
        clearRuntime();
        finishTest();
      }
    }, 250);

    return () => {
      clearRuntime();
    };
  }, [active, clearRuntime, finishTest, recomputeLiveMetrics]);

  const joinRankedQueue = useCallback(() => {
    socketRef.current?.emit('race:queueRanked', {
      username: user?.username || 'anonymous',
      userId: user?.id || user?._id,
      skill: summary.bestWpm || 0
    });
  }, [summary.bestWpm, user?.username, user?.id, user?._id]);

  const joinRace = useCallback(() => {
    setRaceWinner('');
    socketRef.current?.emit('race:join', {
      roomId: raceRoom,
      username: user?.username || 'anonymous',
      userId: user?.id || user?._id,
      privateRoom: raceRoom.startsWith('private-'),
      ghostRun: { username: user?.username || 'ghost', wpm: summary.bestWpm || 0 }
    });
  }, [raceRoom, summary.bestWpm, user?.username, user?.id, user?._id]);

  const startTest = useCallback(async (useDailyChallenge = false) => {
    clearRuntime();

    let nextText = '';
    let nextTextId = '';
    let nextMode = mode;

    if (customText.trim() && mode === 'custom') {
      nextText = customText.trim();
      nextTextId = `custom-${Date.now()}`;
    } else if (useDailyChallenge && dailyChallenge) {
      nextText = dailyChallenge.text;
      nextTextId = dailyChallenge.textId;
      nextMode = dailyChallenge.mode || mode;
      setMode(nextMode);
    } else {
      const weakKeys = topKeyMistakes.slice(0, 5).map((item) => item.key);
      try {
        const { data } = await api.post('/typing/start', {
          mode: nextMode,
          difficulty,
          timeLimit,
          wordCount,
          customText: customText.trim(),
          weakKeys
        });
        nextText = data.text;
        nextTextId = data.textId;
      } catch (_error) {
        nextText = generatePrompt(nextMode, wordCount);
        nextTextId = `local-${Date.now()}`;
      }
    }

    promptRef.current = nextText;
    setPrompt(nextText);
    setTextId(nextTextId);
    setActiveMode(nextMode);
    setFinished(false);
    setMetrics({
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      errorCount: 0,
      consistency: 100,
      keystrokesPerSecond: 0
    });
    resetTelemetry();

    startedAtRef.current = Date.now();
    setTimer(nextMode === 'time' ? timeLimit : (nextMode === 'zen' ? null : 0));
    setActive(true);
  }, [clearRuntime, customText, dailyChallenge, difficulty, mode, resetTelemetry, timeLimit, topKeyMistakes, wordCount]);

  const onInputChange = useCallback((event) => {
    if (!active) return;

    const nextValue = applyInput(event.target.value, promptRef.current);
    playKeypress();
    const elapsed = elapsedSeconds();
    const liveMetrics = buildMetrics(promptRef.current, elapsed);
    setMetrics(liveMetrics);

    const progress = promptRef.current.length
      ? Math.min(100, Math.round((nextValue.length / promptRef.current.length) * 100))
      : 0;

    socketRef.current?.emit('race:progress', {
      roomId: raceRoom,
      progress,
      wpm: liveMetrics.wpm,
      accuracy: liveMetrics.accuracy
    });

    if (activeMode !== 'zen' && nextValue.length >= promptRef.current.length) {
      finishTest();
    }
  }, [active, activeMode, applyInput, buildMetrics, elapsedSeconds, finishTest, playKeypress, raceRoom]);

  const updateUserSettings = useCallback((patch) => {
    setUserSettings((previous) => ({
      ...previous,
      ...patch
    }));
  }, []);

  const joinTournament = useCallback(async (tournamentId) => {
    try {
      await api.post('/tournaments/join', { tournamentId });
      setActiveTournamentId(tournamentId);
      const { data } = await api.get('/tournaments');
      setTournaments(data.tournaments || []);
    } catch (_error) {
      return;
    }
  }, []);

  useEffect(() => {
    if (!settingsHydrated) return () => undefined;

    const timeout = setTimeout(async () => {
      try {
        await api.patch('/user/settings', userSettings);
      } catch (_error) {
        return;
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [settingsHydrated, userSettings]);

  const progress = useMemo(() => {
    if (!prompt.length) return 0;
    return Math.min(100, Math.round((inputValue.length / prompt.length) * 100));
  }, [inputValue.length, prompt.length]);

  const chartData = useMemo(() => {
    if (analytics.length > 0) {
      return analytics.slice(-20).map((item) => ({
        label: item.day.slice(5),
        wpm: item.averageWpm,
        accuracy: item.averageAccuracy,
        consistency: item.averageConsistency
      }));
    }

    return history
      .slice(0, 20)
      .reverse()
      .map((item, index) => ({
        label: `${index + 1}`,
        wpm: item.wpm,
        accuracy: item.accuracy,
        consistency: item.consistency || 0
      }));
  }, [analytics, history]);

  const aiCoachTips = useMemo(() => {
    const tips = [];

    if (metrics.accuracy < 95) {
      tips.push('Slow down by 8-12 WPM for one run to stabilize precision before speeding up.');
    }
    if (metrics.consistency < 75) {
      tips.push('Your cadence is unstable. Focus on even rhythm rather than bursts.');
    }
    if (topKeyMistakes.length > 0) {
      const weak = topKeyMistakes.slice(0, 3).map((item) => item.key.toUpperCase()).join(', ');
      tips.push(`Practice weak keys: ${weak}. Run Practice mode with hard difficulty for 3 minutes.`);
    }
    if (tips.length === 0) {
      tips.push('Great control. Push raw speed in Time mode and keep accuracy above 97%.');
    }

    return tips;
  }, [metrics.accuracy, metrics.consistency, topKeyMistakes]);

  const progression = useMemo(() => {
    const xp = (summary.testsCompleted * 20) + (summary.bestWpm * 4);
    const level = Math.max(1, Math.floor(xp / 400) + 1);
    const currentLevelXp = xp % 400;
    return { xp, level, currentLevelXp };
  }, [summary.bestWpm, summary.testsCompleted]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 text-slate-100 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TypeZone Prime</h1>
          <p className="text-sm text-slate-300">Welcome back, {user?.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={joinRace} className="rounded-lg border border-slate-500/50 px-3 py-2 text-sm hover:bg-slate-800">
            Join Race
          </button>
          <button
            type="button"
            onClick={joinRankedQueue}
            className="rounded-lg border border-amber-400/50 px-3 py-2 text-sm hover:bg-amber-500/10"
          >
            Ranked Queue
          </button>
          <button type="button" onClick={logout} className="rounded-lg border border-slate-500/50 px-3 py-2 text-sm hover:bg-slate-800">
            Logout
          </button>
        </div>
      </header>

      <TypingControls
        theme={theme}
        setTheme={setTheme}
        mode={mode}
        setMode={setMode}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        timeLimit={timeLimit}
        setTimeLimit={setTimeLimit}
        wordCount={wordCount}
        setWordCount={setWordCount}
        raceRoom={raceRoom}
        setRaceRoom={setRaceRoom}
      />

      <LiveMetricsGrid metrics={metrics} timer={timer} />

      <section className="mb-4 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
        <TypingPanel prompt={prompt} inputValue={inputValue} active={active} finished={finished} />
        <textarea
          className="mt-4 h-24 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-sky-500"
          value={inputValue}
          onChange={onInputChange}
          disabled={!active}
          placeholder="Press Start and begin typing..."
        />

        <div className="mt-3 h-2 w-full rounded bg-slate-800">
          <div className="h-2 rounded bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => startTest(false)} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400">
            {active ? 'Restart' : 'Start Test'}
          </button>
          <button type="button" onClick={() => startTest(true)} className="rounded-lg border border-slate-500/50 px-4 py-2 text-sm hover:bg-slate-800">
            Daily Challenge
          </button>
          <button type="button" onClick={finishTest} className="rounded-lg border border-slate-500/50 px-4 py-2 text-sm hover:bg-slate-800" disabled={!active}>
            Finish
          </button>
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
        <label className="text-xs text-slate-300">
          Custom Text Upload
          <textarea
            className="mt-2 h-20 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-sky-500"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste your own text and switch mode to Custom"
          />
        </label>
      </section>

      <section className="mb-4">
        <AudioSettingsPanel settings={userSettings} onChange={updateUserSettings} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <PerformanceTrendChart data={chartData} />

        <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Progression</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Level: {progression.level}</li>
            <li>Total XP: {progression.xp}</li>
            <li>XP in level: {progression.currentLevelXp}/400</li>
            <li>Tests: {summary.testsCompleted}</li>
            <li>Best WPM: {summary.bestWpm}</li>
            <li>Average WPM: {summary.averageWpm}</li>
            <li>Average Accuracy: {summary.averageAccuracy}%</li>
            <li>Streak: {summary.streakDays} days</li>
          </ul>
        </article>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Leaderboard</h3>
          <ol className="space-y-1 text-sm text-slate-300">
            {leaderboard.slice(0, 8).map((entry, idx) => (
              <li key={`${entry.userId}-${idx}`} className="flex justify-between">
                <span>{idx + 1}. {entry.username}</span>
                <span>{entry.bestWpm} wpm</span>
              </li>
            ))}
          </ol>
        </article>

        <RaceRoomPanel raceWinner={raceWinner} racePlayers={racePlayers} />

        <KeyboardHeatmap entries={topKeyMistakes} />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">AI Typing Coach</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {aiCoachTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Weak-Key Training Recommendation</h3>
          <p className="text-sm text-slate-300">
            {topKeyMistakes.length === 0
              ? 'Complete one timed session to unlock personalized weak-key drills.'
              : `Top weak keys: ${topKeyMistakes.slice(0, 5).map((entry) => entry.key.toUpperCase()).join(', ')}. Use Practice mode with hard difficulty for 3-5 rounds.`}
          </p>
        </article>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Scheduled Tournaments</h3>
          {activeTournamentId && <span className="text-xs text-emerald-400">Joined tournament active</span>}
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          {tournaments.length === 0 && <li>No tournaments available right now.</li>}
          {tournaments.map((tournament) => (
            <li key={tournament._id} className="rounded-lg border border-slate-700/40 bg-slate-900/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium">{tournament.title}</span>
                <span className="text-xs uppercase tracking-wide text-slate-400">{tournament.status}</span>
              </div>
              <div className="mb-2 text-xs text-slate-400">
                Mode: {tournament.mode} | Difficulty: {tournament.difficulty} | Reward: {tournament.rewardXp} XP
              </div>
              <button
                type="button"
                className="rounded-md border border-slate-500/50 px-3 py-1.5 text-xs hover:bg-slate-800"
                onClick={() => joinTournament(tournament._id)}
              >
                Join Tournament
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
