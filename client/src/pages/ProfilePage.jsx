import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Target, Trophy, Award, TrendingUp, Keyboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { SkeletonCard, SkeletonTable } from '../ui/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

const BADGE_DEFINITIONS = {
  'wpm-50': { label: 'Speed Novice', desc: 'Reach 50 WPM', icon: '⚡' },
  'wpm-75': { label: 'Speed Racer', desc: 'Reach 75 WPM', icon: '🚀' },
  'wpm-100': { label: 'Century Typist', desc: 'Reach 100 WPM', icon: '💯' },
  'wpm-150': { label: 'Speed Demon', desc: 'Reach 150 WPM', icon: '👹' },
  'perfect-accuracy': { label: 'Flawless', desc: '100% accuracy on a test', icon: '✨' },
  'accuracy-streak-10': { label: 'Precise', desc: '98%+ accuracy 10 times', icon: '🎯' },
  'sessions-10': { label: 'Getting Started', desc: 'Complete 10 sessions', icon: '🌱' },
  'sessions-100': { label: 'Dedicated', desc: 'Complete 100 sessions', icon: '🏅' },
  'streak-7': { label: 'Week Warrior', desc: '7-day streak', icon: '🔥' },
  'streak-30': { label: 'Monthly Master', desc: '30-day streak', icon: '👑' },
};

const ALL_BADGES = Object.keys(BADGE_DEFINITIONS);

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
          <StatCard
            icon={Clock}
            label="Total Time"
            value={(() => {
              const h = Math.floor((profile.totalTimeMs || 0) / 3600000);
              const m = Math.floor(((profile.totalTimeMs || 0) % 3600000) / 60000);
              return h > 0 ? `${h}h ${m}m` : `${m}m`;
            })()}
          />
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
            {sessions.length > 0 && (
              <button onClick={exportCSV} className="btn-ghost text-sm px-3 py-1">
                Export CSV
              </button>
            )}
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

    keys: () => (
      <div>
        <h3 className="text-lg font-semibold text-text mb-6">Key Analysis</h3>
        {sessions.length === 0 ? (
          <div className="card p-8 text-center text-text-secondary">
            Complete at least one typing session to see per-key accuracy data.
          </div>
        ) : (
          <div className="card p-6">
            <p className="text-sm text-text-secondary mb-4">
              Key accuracy across all sessions (green = strong, red = needs work)
            </p>
            {/* Keyboard heatmap - aggregate keyAccuracy from all sessions */}
            {(() => {
              const totals = {};
              sessions.forEach((s) => {
                if (!s.keyAccuracy) return;
                Object.entries(s.keyAccuracy).forEach(([k, v]) => {
                  if (!totals[k]) totals[k] = { sum: 0, count: 0 };
                  totals[k].sum += Number(v) || 0;
                  totals[k].count += 1;
                });
              });
              const rows = [
                ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                ['z', 'x', 'c', 'v', 'b', 'n', 'm']
              ];
              const offsets = ['', 'ml-4', 'ml-8'];
              return rows.map((row, ri) => (
                <div key={ri} className={`flex gap-2 mb-2 ${offsets[ri]}`}>
                  {row.map((key) => {
                    const d = totals[key];
                    const pct = d ? Math.round(d.sum / d.count) : null;
                    const bg = pct === null
                      ? 'var(--color-surface)'
                      : pct > 85 ? '#16a34a'
                      : pct > 65 ? '#ca8a04'
                      : '#dc2626';
                    const fg = pct === null ? 'var(--color-text-secondary)' : '#fff';
                    return (
                      <div
                        key={key}
                        className="w-9 h-9 rounded-md flex flex-col items-center justify-center border border-border text-xs font-mono font-bold cursor-default"
                        style={{ background: bg, color: fg }}
                        title={pct !== null ? `${key}: ${pct}% accuracy` : `${key}: no data`}
                      >
                        {key}
                        {pct !== null && (
                          <span className="text-[9px] opacity-80">{pct}%</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
            <div className="mt-6 flex items-center gap-3 text-xs text-text-secondary">
              <div className="w-4 h-4 rounded" style={{ background: '#16a34a' }} /> Strong (85%+)
              <div className="w-4 h-4 rounded" style={{ background: '#ca8a04' }} /> Average (65-85%)
              <div className="w-4 h-4 rounded" style={{ background: '#dc2626' }} /> Needs work (&lt;65%)
              <div className="w-4 h-4 rounded border border-border" style={{ background: 'var(--color-surface)' }} /> No data
            </div>
          </div>
        )}
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
        <h3 className="text-lg font-semibold text-text mb-6">Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_BADGES.map((key) => {
            const def = BADGE_DEFINITIONS[key];
            const earned = (profile.achievements || []).includes(key);
            return (
              <div
                key={key}
                className={`card p-5 flex items-start gap-4 transition-all ${earned ? 'border-accent/40' : 'opacity-50 grayscale'}`}
              >
                <div className="text-3xl">{def.icon}</div>
                <div>
                  <p className={`font-semibold mb-1 ${earned ? 'text-text' : 'text-text-secondary'}`}>
                    {def.label}
                  </p>
                  <p className="text-xs text-text-secondary">{def.desc}</p>
                  {earned && (
                    <span className="text-xs text-accent mt-1 inline-block">Earned ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
            { id: 'keys', label: 'Key Analysis', icon: Keyboard },
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
