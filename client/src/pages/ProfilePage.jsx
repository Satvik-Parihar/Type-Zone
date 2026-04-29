import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Target, Trophy, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { SkeletonCard, SkeletonTable } from '../ui/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

function ActivityCalendar({ sessions }) {
  const today = new Date();
  const weeks = 52;
  const days = weeks * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);

  const countByDay = {};
  sessions.forEach((session) => {
    const day = new Date(session.createdAt).toDateString();
    countByDay[day] = (countByDay[day] || 0) + 1;
  });

  const cells = Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return { date, count: countByDay[date.toDateString()] || 0 };
  });

  const getColor = (count) => {
    if (count === 0) return 'var(--color-surface)';
    if (count <= 2) return 'color-mix(in srgb, var(--color-accent) 30%, transparent)';
    if (count <= 5) return 'color-mix(in srgb, var(--color-accent) 60%, transparent)';
    return 'var(--color-accent)';
  };

  const weekCols = [];
  for (let week = 0; week < weeks; week += 1) {
    weekCols.push(cells.slice(week * 7, week * 7 + 7));
  }

  return (
    <div className="card p-6 mt-6">
      <h3 className="text-lg font-semibold text-text mb-4">Activity</h3>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weekCols.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((cell, dayIndex) => (
              <div
                key={dayIndex}
                className="w-3 h-3 rounded-sm border border-border/30"
                style={{ background: getColor(cell.count) }}
                title={`${cell.date.toDateString()}: ${cell.count} session${cell.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-text-secondary">
        <span>Less</span>
        {[0, 2, 4, 6, 8].map((value) => (
          <div
            key={value}
            className="w-3 h-3 rounded-sm border border-border/30"
            style={{ background: getColor(value) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    bestWpm: 0,
    avgWpm: 0,
    totalTests: 0,
    totalTimeMs: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: []
  });
  const [sessions, setSessions] = useState([]);
  const [races, setRaces] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true, state: { from: '/profile' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          api.get('/typing/profile/stats'),
          api.get('/typing/sessions?limit=100')
        ]);

        let racesRes = { data: { races: [] } };
        try {
          racesRes = await api.get('/history/races?limit=50');
        } catch (error) {
          console.error('Failed to fetch race history:', error);
        }

        setProfile(statsRes.data || {});
        setSessions(sessionsRes.data?.sessions || []);
        setRaces(racesRes.data?.races || []);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (authLoading) return <SkeletonCard />;
  if (!user) return null;

  const formatTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const exportCSV = () => {
    const headers = ['Date','Mode','WPM','Raw WPM','Accuracy','Consistency','Time(s)'];
    const rows = sessions.map(s => [
      new Date(s.createdAt).toISOString(),
      s.mode,
      Math.round(s.wpm),
      Math.round(s.rawWpm || 0),
      Math.round(s.accuracy),
      Math.round(s.consistency || 100),
      s.timeTaken
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typezone-sessions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPlacementLabel = (placement) => {
    if (placement === 1) return '1st place';
    if (placement === 2) return '2nd place';
    if (placement === 3) return '3rd place';
    return `${placement}th place`;
  };

  const analytics = useMemo(() => {
    if (!sessions.length) {
      return {
        recentWpm: [],
        mergedKeyAccuracy: {},
        weakKeys: [],
        bestSession: null,
        avgAccuracy: 0
      };
    }

    const recent = sessions.slice(0, 20).reverse();
    const recentWpm = recent.map((session, index) => ({
      test: index + 1,
      wpm: Number(session.wpm) || 0,
      accuracy: Number(session.accuracy) || 0
    }));

    const keyBuckets = {};
    for (const session of sessions) {
      const source = session.keyAccuracy || {};
      for (const [rawKey, value] of Object.entries(source)) {
        const key = String(rawKey || '').toLowerCase();
        if (!key || key.length !== 1 || !/[a-z]/.test(key)) continue;

        if (!keyBuckets[key]) {
          keyBuckets[key] = { total: 0, count: 0 };
        }

        keyBuckets[key].total += Number(value) || 0;
        keyBuckets[key].count += 1;
      }
    }

    const mergedKeyAccuracy = Object.fromEntries(
      Object.entries(keyBuckets).map(([key, bucket]) => [
        key,
        Math.round(bucket.total / Math.max(1, bucket.count))
      ])
    );

    const weakKeys = Object.entries(mergedKeyAccuracy)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5);

    const bestSession = sessions.reduce((best, current) => {
      if (!best) return current;
      return (Number(current.wpm) || 0) > (Number(best.wpm) || 0) ? current : best;
    }, null);

    const avgAccuracy = Math.round(
      sessions.reduce((sum, session) => sum + (Number(session.accuracy) || 0), 0) / sessions.length
    );

    const modeOrder = ['time', 'words', 'quote', 'code', 'numbers', 'zen'];
    const personalBests = modeOrder.map(mode => {
      const modeSessions = sessions.filter(s => s.mode === mode);
      if (!modeSessions.length) return null;
      const best = modeSessions.reduce((b, s) => (Number(s.wpm) > Number(b.wpm) ? s : b), modeSessions[0]);
      return {
        mode,
        wpm: Math.round(best.wpm),
        accuracy: Math.round(best.accuracy),
        date: new Date(best.createdAt).toLocaleDateString()
      };
    }).filter(Boolean);

    return {
      recentWpm,
      mergedKeyAccuracy,
      weakKeys,
      bestSession,
      avgAccuracy,
      personalBests
    };
  }, [sessions]);

  const Chart = () => {
    if (!analytics.recentWpm.length) {
      return <p className="text-sm text-text-secondary">No sessions yet for trend analysis.</p>;
    }

    const values = analytics.recentWpm.map((item) => item.wpm);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const spread = Math.max(1, max - min);

    const points = analytics.recentWpm.map((item, index) => {
      const x = (index / Math.max(1, analytics.recentWpm.length - 1)) * 100;
      const y = 100 - ((item.wpm - min) / spread) * 100;
      return `${x},${y}`;
    });

    return (
      <div className="space-y-3">
        <div className="flex items-end justify-between text-sm">
          <p className="text-text-secondary">Last {analytics.recentWpm.length} tests</p>
          <p className="text-accent font-semibold">Peak {max} WPM</p>
        </div>
        <div className="h-44 w-full rounded-xl border border-border p-3 bg-card/40">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    );
  };

  const KeyHeatmap = () => {
    const colorForValue = (value) => {
      if (value >= 95) return 'bg-green-500/20 border-green-500/40 text-green-300';
      if (value >= 85) return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
      if (value > 0) return 'bg-red-500/20 border-red-500/40 text-red-300';
      return 'bg-card border-border text-text-secondary';
    };

    return (
      <div className="space-y-3">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap gap-2">
            {row.map((key) => {
              const acc = analytics.mergedKeyAccuracy[key] || 0;
              return (
                <div
                  key={key}
                  className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center ${colorForValue(acc)}`}
                  title={`${key.toUpperCase()}: ${acc || 0}%`}
                >
                  <span className="text-xs font-semibold uppercase">{key}</span>
                  <span className="text-[10px] leading-none">{acc || 0}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, unit = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-accent">{value}</p>
            {unit && <p className="text-text-secondary">{unit}</p>}
          </div>
        </div>
        <Icon className="w-8 h-8 text-accent opacity-20" />
      </div>
    </motion.div>
  );

  const TabContent = {
    overview: () => (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard icon={TrendingUp} label="Best WPM" value={Math.round(profile.bestWpm)} />
          <StatCard icon={Target} label="Average WPM" value={Math.round(profile.avgWpm)} />
          <StatCard icon={BarChart3} label="Total Tests" value={profile.totalTests} />
          <StatCard icon={Clock} label="Total Time" value={formatTime(profile.totalTimeMs)} />
          <StatCard icon={Trophy} label="Current Streak" value={profile.currentStreak} unit="days" />
          <StatCard icon={Award} label="Longest Streak" value={profile.longestStreak} unit="days" />
        </div>

        {analytics.personalBests && analytics.personalBests.length > 0 && (
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-text mb-4">Personal Bests</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary text-left">
                    <th className="pb-2 font-medium">Mode</th>
                    <th className="pb-2 font-medium">Best WPM</th>
                    <th className="pb-2 font-medium">Accuracy</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.personalBests.map(pb => (
                    <tr key={pb.mode} className="border-b border-border/50 hover:bg-surface/50">
                      <td className="py-2 capitalize font-mono text-accent">{pb.mode}</td>
                      <td className="py-2 font-bold text-text">{pb.wpm}</td>
                      <td className="py-2 text-correct">{pb.accuracy}%</td>
                      <td className="py-2 text-text-secondary">{pb.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {analytics.recentWpm.length > 1 && (
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-text mb-4">WPM over last 20 sessions</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.recentWpm}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="test"
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                  label={{
                    value: 'Session',
                    position: 'insideBottom',
                    offset: -2,
                    fill: 'var(--color-text-secondary)',
                    fontSize: 11,
                  }}
                />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    color: 'var(--color-text)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--color-accent)' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--color-correct)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-text-secondary mt-2">Solid = WPM · Dashed = Accuracy %</p>
          </div>
        )}

        <ActivityCalendar sessions={sessions} />
      </div>
    ),

    sessions: () => (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-text">Recent Tests</h3>
            <button onClick={exportCSV} className="btn-ghost text-sm px-3 py-1">
              Export CSV
            </button>
          </div>
          <p className="text-sm text-text-secondary">{sessions.length} tests</p>
        </div>
        
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No typing tests yet. Start typing to see your history!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sessions.map((session, idx) => (
              <div key={idx} className="card p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-text">{Math.round(session.wpm)} WPM</p>
                  <p className="text-sm text-text-secondary">{session.accuracy}% accuracy</p>
                </div>
                <p className="text-text-secondary text-sm">
                  {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    analysis: () => (
      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Performance Over Time</h3>
          <Chart />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-text-secondary mb-1">Average Accuracy</p>
              <p className="text-xl font-semibold text-text">{analytics.avgAccuracy}%</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-text-secondary mb-1">Personal Best</p>
              <p className="text-xl font-semibold text-accent">{Math.round(analytics.bestSession?.wpm || 0)} WPM</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-text-secondary mb-1">Samples</p>
              <p className="text-xl font-semibold text-text">{sessions.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Keyboard Heatmap</h3>
          <KeyHeatmap />
          <div className="mt-5">
            <p className="text-sm text-text-secondary mb-2">Weakest Keys</p>
            {analytics.weakKeys.length ? (
              <div className="flex flex-wrap gap-2">
                {analytics.weakKeys.map(([key, score]) => (
                  <span key={key} className="px-3 py-1 rounded-full border border-border text-sm text-text">
                    {key.toUpperCase()} {score}%
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">Complete more tests to unlock weak-key insights.</p>
            )}
          </div>
        </div>
      </div>
    ),

    races: () => (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text">Multiplayer Races</h3>
          <p className="text-sm text-text-secondary">{races.length} races</p>
        </div>

        {races.length === 0 ? (
          <div className="card p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-accent opacity-30 mb-4" />
            <p className="text-text-secondary">No race history yet. Challenge your friends to start racing!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
            {races.map((race) => (
              <div key={race._id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-text">{race.roomName}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(race.createdAt).toLocaleString()} · {race.participants} racers
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${race.isWinner ? 'text-accent' : 'text-text'}`}>
                    {getPlacementLabel(race.placement)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {Math.round(race.wpm)} WPM · {Math.round(race.accuracy)}% accuracy · {Math.round(race.finishTime)}s
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    achievements: () => (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text mb-4">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-4 text-center opacity-50">
                <Award className="w-8 h-8 mx-auto text-accent mb-2" />
                <p className="text-xs text-text-secondary">Locked</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-text-secondary text-sm">Earn achievements by completing typing challenges and milestones.</p>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-text mb-2">Profile</h1>
          <p className="text-text-secondary">Your typing journey and statistics</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'sessions', label: 'Sessions Log', icon: Clock },
            { id: 'analysis', label: 'Key Analysis', icon: Target },
            { id: 'races', label: 'Race History', icon: Trophy },
            { id: 'achievements', label: 'Achievements', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent font-semibold'
                    : 'border-transparent text-text-secondary hover:text-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
              <div className="card">
                <SkeletonTable rows={4} columns={4} />
              </div>
            </div>
          ) : (
            TabContent[activeTab]?.() || <div>Tab not found</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
