import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TypingPanel from '../components/TypingPanel';
import { generatePrompt } from '../utils/typingData';

const SETTINGS_KEY = 'typezone_settings_v3';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function metricSnapshot(timeLabel, wpm, accuracy) {
  return { timeLabel, wpm, accuracy };
}

export default function HomePage() {
  const { user, logout } = useAuth();

  const [mode, setMode] = useState('words');
  const [theme, setTheme] = useState('dark');
  const [timeLimit, setTimeLimit] = useState(60);
  const [wordCount, setWordCount] = useState(25);
  const [customText, setCustomText] = useState('');

  const [prompt, setPrompt] = useState('');
  const [textId, setTextId] = useState('');
  const [activeMode, setActiveMode] = useState('words');
  const [inputValue, setInputValue] = useState('');
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(60);

  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);

  const [summary, setSummary] = useState({ testsCompleted: 0, bestWpm: 0, averageWpm: 0, averageAccuracy: 0, streakDays: 0 });
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);

  const [raceRoom, setRaceRoom] = useState('global-room');
  const [racePlayers, setRacePlayers] = useState([]);
  const [raceWinner, setRaceWinner] = useState('');

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const promptRef = useRef('');
  const inputRef = useRef('');
  const debounceRef = useRef(null);
  const trendRef = useRef([]);
  const heatmapRef = useRef({});

  const [trend, setTrend] = useState([]);
  const [heatmapEntries, setHeatmapEntries] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved.mode) setMode(saved.mode);
        if (saved.theme) setTheme(saved.theme);
        if (saved.timeLimit) {
          setTimeLimit(saved.timeLimit);
          setTimer(saved.timeLimit);
        }
        if (saved.wordCount) setWordCount(saved.wordCount);
      } catch (_error) {
        localStorage.removeItem(SETTINGS_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode, theme, timeLimit, wordCount }));
  }, [mode, theme, timeLimit, wordCount]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    async function hydrateDashboard() {
      try {
        const [{ data: profileData }, { data: leaderboardData }, { data: challengeData }, { data: historyData }] = await Promise.all([
          api.get('/user/profile'),
          api.get('/leaderboard'),
          api.get('/challenges/daily'),
          api.get('/typing/history')
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
      } catch (_error) {
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

    socketRef.current.on('race:state', (players) => {
      setRacePlayers(players || []);
    });

    socketRef.current.on('race:finished', (payload) => {
      setRaceWinner(`${payload.winner} (${payload.wpm} WPM)`);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!active) {
      setTimer(timeLimit);
    }
  }, [timeLimit, active]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(debounceRef.current);
    };
  }, []);

  function computeCorrectChars(value, expected) {
    let correct = 0;
    let mistakeCount = 0;
    const maxIndex = Math.min(value.length, expected.length);

    for (let i = 0; i < maxIndex; i += 1) {
      if (value[i] === expected[i]) {
        correct += 1;
      } else {
        mistakeCount += 1;
        heatmapRef.current[i] = (heatmapRef.current[i] || 0) + 1;
      }
    }

    return { correct, mistakeCount };
  }

  function updateMetrics(value, secondsRemaining) {
    const expected = promptRef.current;
    const { correct, mistakeCount } = computeCorrectChars(value, expected);
    const elapsed = Math.max(1, timeLimit - secondsRemaining);
    const nextAccuracy = value.length === 0 ? 100 : Math.round((correct / value.length) * 100);
    const nextWpm = Math.max(0, Math.round(((correct / 5) * 60) / elapsed));

    setWpm(nextWpm);
    setAccuracy(nextAccuracy);
    setErrors(mistakeCount);

    trendRef.current = [...trendRef.current.slice(-29), metricSnapshot(`${elapsed}s`, nextWpm, nextAccuracy)];
    setTrend(trendRef.current);

    return { nextWpm, nextAccuracy, correct, mistakeCount, elapsed };
  }

  function joinRace() {
    setRaceWinner('');
    socketRef.current?.emit('race:join', {
      roomId: raceRoom,
      username: user?.username || 'anonymous'
    });
  }

  async function startTest(useDailyChallenge = false) {
    clearInterval(timerRef.current);
    clearTimeout(debounceRef.current);

    let nextText = '';
    let nextTextId = '';
    let nextMode = mode;

    if (customText.trim()) {
      nextText = customText.trim();
      nextTextId = `custom-${Date.now()}`;
    } else if (useDailyChallenge && dailyChallenge) {
      nextText = dailyChallenge.text;
      nextTextId = dailyChallenge.textId;
      nextMode = dailyChallenge.mode || mode;
      setMode(nextMode);
    } else {
      try {
        const { data } = await api.post('/typing/start', {
          mode: nextMode,
          wordCount
        });
        nextText = data.text;
        nextTextId = data.textId;
      } catch (_error) {
        nextText = generatePrompt(nextMode, wordCount);
        nextTextId = `local-${Date.now()}`;
      }
    }

    promptRef.current = nextText;
    inputRef.current = '';
    heatmapRef.current = {};
    trendRef.current = [];
    setPrompt(nextText);
    setTextId(nextTextId);
    setActiveMode(nextMode);
    setInputValue('');
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setTimer(timeLimit);
    setActive(true);
    setTrend([]);
    setHeatmapEntries([]);

    timerRef.current = setInterval(() => {
      setTimer((previous) => {
        const next = previous - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          finishTest(inputRef.current, 0);
          return 0;
        }

        updateMetrics(inputRef.current, next);
        return next;
      });
    }, 1000);
  }

  async function finishTest(value, secondsRemaining) {
    if (!active && !value) {
      return;
    }

    if (!promptRef.current || !textId) {
      return;
    }

    clearInterval(timerRef.current);
    clearTimeout(debounceRef.current);
    setActive(false);

    const metrics = updateMetrics(value, secondsRemaining);

    const heatmap = Object.entries(heatmapRef.current)
      .map(([position, mistakes]) => ({ position: Number(position), mistakes }))
      .sort((a, b) => b.mistakes - a.mistakes)
      .slice(0, 12);

    setHeatmapEntries(heatmap);

    try {
      await api.post('/typing/submit', {
        textId,
        mode: activeMode,
        wpm: metrics.nextWpm,
        accuracy: metrics.nextAccuracy,
        errors: metrics.mistakeCount,
        timeTaken: metrics.elapsed,
        rawInput: value
      });

      socketRef.current?.emit('race:finish', {
        roomId: raceRoom,
        wpm: metrics.nextWpm
      });

      const [{ data: profileData }, { data: historyData }, { data: leaderboardData }] = await Promise.all([
        api.get('/user/profile'),
        api.get('/typing/history'),
        api.get('/leaderboard')
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
    } catch (_error) {
      return;
    }
  }

  function onInputChange(event) {
    if (!active) return;

    const value = event.target.value;
    setInputValue(value);
    inputRef.current = value;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const metrics = updateMetrics(value, timer);
      const progress = promptRef.current.length ? Math.round((value.length / promptRef.current.length) * 100) : 0;

      socketRef.current?.emit('race:progress', {
        roomId: raceRoom,
        progress,
        wpm: metrics.nextWpm
      });
    }, 60);

    if (value === promptRef.current) {
      finishTest(value, timer);
    }
  }

  const progress = useMemo(() => {
    if (!prompt.length) return 0;
    return Math.min(100, Math.round((inputValue.length / prompt.length) * 100));
  }, [inputValue.length, prompt.length]);

  const historyData = useMemo(() => {
    return history
      .slice(0, 15)
      .reverse()
      .map((item, index) => ({
        run: index + 1,
        wpm: item.wpm,
        accuracy: item.accuracy
      }));
  }, [history]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 text-slate-100 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TypeZone Pro</h1>
          <p className="text-sm text-slate-300">Welcome back, {user?.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={joinRace} className="rounded-lg border border-slate-500/50 px-3 py-2 text-sm hover:bg-slate-800">
            Join Race
          </button>
          <button type="button" onClick={logout} className="rounded-lg border border-slate-500/50 px-3 py-2 text-sm hover:bg-slate-800">
            Logout
          </button>
        </div>
      </header>

      <section className="mb-4 grid gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 md:grid-cols-2 lg:grid-cols-6">
        <label className="text-xs">
          Theme
          <select className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="dark">Graphite Dark</option>
            <option value="light">Professional Light</option>
            <option value="matrix">Matrix Neon</option>
          </select>
        </label>

        <label className="text-xs">
          Mode
          <select className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="words">Words</option>
            <option value="quote">Quote</option>
            <option value="numbers">Numbers</option>
            <option value="code">Code</option>
            <option value="punctuation">Punctuation</option>
          </select>
        </label>

        <label className="text-xs">
          Time
          <select className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}>
            <option value={15}>15s</option>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
            <option value={120}>120s</option>
          </select>
        </label>

        <label className="text-xs">
          Word Count
          <select className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>

        <label className="text-xs lg:col-span-2">
          Race Room
          <input className="mt-1 w-full rounded-md bg-slate-800 px-2 py-2" value={raceRoom} onChange={(e) => setRaceRoom(e.target.value)} />
        </label>
      </section>

      <section className="mb-4 grid gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-3"><p className="text-xs text-slate-400">Live WPM</p><h2 className="text-2xl font-semibold">{wpm}</h2></article>
        <article className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-3"><p className="text-xs text-slate-400">Accuracy</p><h2 className="text-2xl font-semibold">{accuracy}%</h2></article>
        <article className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-3"><p className="text-xs text-slate-400">Errors</p><h2 className="text-2xl font-semibold">{errors}</h2></article>
        <article className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-3"><p className="text-xs text-slate-400">Time</p><h2 className="text-2xl font-semibold">{timer}s</h2></article>
      </section>

      <section className="mb-4 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
        <TypingPanel prompt={prompt} inputValue={inputValue} active={active} />
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
          <button type="button" onClick={() => finishTest(inputRef.current, timer)} className="rounded-lg border border-slate-500/50 px-4 py-2 text-sm hover:bg-slate-800">
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
            placeholder="Paste your own text and press Start Test"
          />
        </label>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData.length ? historyData : trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey={historyData.length ? 'run' : 'timeLabel'} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="wpm" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Your Summary</h3>
          <ul className="space-y-2 text-sm text-slate-300">
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

        <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Race Room</h3>
          {raceWinner ? <p className="mb-2 text-emerald-400">Winner: {raceWinner}</p> : <p className="mb-2 text-slate-400">No winner yet</p>}
          <ul className="space-y-1 text-sm text-slate-300">
            {racePlayers.map((player, idx) => (
              <li key={`${player.username}-${idx}`} className="flex justify-between">
                <span>{player.username}</span>
                <span>{player.progress}% ({player.wpm} wpm)</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Mistake Heatmap</h3>
          <ul className="space-y-1 text-sm text-slate-300">
            {heatmapEntries.length === 0 && <li>No mistakes recorded in this run.</li>}
            {heatmapEntries.map((item) => (
              <li key={item.position} className="flex justify-between">
                <span>Char #{item.position + 1}</span>
                <span>{item.mistakes} mistakes</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
