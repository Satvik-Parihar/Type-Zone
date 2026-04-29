import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, ArrowUp, ArrowDown } from 'lucide-react';
import { SkeletonTable } from '../ui/SkeletonLoader';
import api from '../utils/api';

const filters = [
  { key: 'alltime', label: 'All Time' },
  { key: 'month', label: 'This Month' },
  { key: 'week', label: 'This Week' },
];

const columns = [
  { key: 'rank', label: 'Rank' },
  { key: 'wpm', label: 'WPM' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'tests', label: 'Tests' },
  { key: 'date', label: 'Last Active' },
];

export default function LeaderboardPage() {
  const [mode, setMode] = useState('alltime');
  const [sortBy, setSortBy] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get('/leaderboard', { params: { mode, limit: 50 } });
        if (!cancelled) {
          setLeaders(Array.isArray(data?.leaders) ? data.leaders : []);
        }
      } catch (error) {
        if (!cancelled) setLeaders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const rows = useMemo(() => {
    const mapped = leaders.map((leader, index) => ({
      ...leader,
      rank: index + 1,
      name: leader.username,
      wpm: Number(leader.bestWpm) || 0,
      accuracy: Number(leader.avgAccuracy) || 0,
      tests: Number(leader.totalTests) || 0,
      date: leader.lastActive,
    }));

    return mapped.sort((a, b) => {
      let left = a[sortBy];
      let right = b[sortBy];

      if (sortBy === 'date') {
        left = left ? new Date(left).getTime() : 0;
        right = right ? new Date(right).getTime() : 0;
      }

      if (typeof left === 'string') left = left.toLowerCase();
      if (typeof right === 'string') right = right.toLowerCase();

      if (left < right) return sortDirection === 'asc' ? -1 : 1;
      if (left > right) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leaders, sortBy, sortDirection]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortDirection(field === 'rank' ? 'asc' : 'desc');
  };

  const indicator = (field) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background pt-8 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-accent" />
            <h1 className="text-5xl font-semibold text-text">Leaderboard</h1>
          </div>
          <p className="text-lg text-text-secondary">
            Track the top typists and see where your best score ranks in the zone.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setMode(filter.key)}
                className={`badge transition-all ${mode === filter.key ? 'bg-accent text-background border-accent' : 'bg-surface border-border hover:border-accent'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={8} columns={6} />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-text-secondary">
              No sessions recorded yet. Be the first to set a record!
            </div>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-4 p-5 border-b border-border bg-background/80 text-text-secondary text-sm uppercase tracking-[0.2em]">
                {columns.map((column) => (
                  <button
                    key={column.key}
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="flex items-center gap-2 text-left"
                  >
                    {column.label}
                    {indicator(column.key)}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-border">
                {rows.map((leader, index) => (
                  <motion.div
                    key={`${leader.userId || leader.name}-${leader.rank}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-6 gap-4 p-5 items-center transition hover:bg-white/5 ${leader.rank <= 3 ? 'bg-accent/10' : ''}`}
                  >
                    <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface border border-border text-text font-semibold">
                        {leader.rank <= 3 ? <Crown className="w-5 h-5 text-accent" /> : `#${leader.rank}`}
                      </span>
                    </div>
                    <div className="col-span-2 text-text font-medium">{leader.name}</div>
                    <div className="col-span-1 text-center text-accent font-semibold">{leader.wpm}</div>
                    <div className="col-span-1 text-center text-correct font-semibold">{Math.round(leader.accuracy)}%</div>
                    <div className="col-span-1 text-center text-text-secondary font-semibold">{leader.tests}</div>
                    <div className="col-span-6 md:col-span-1 text-right text-text-secondary text-sm">
                      {leader.date ? new Date(leader.date).toLocaleDateString() : '—'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
