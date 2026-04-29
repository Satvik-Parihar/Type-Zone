import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, ArrowUp, ArrowDown } from 'lucide-react';
import { SkeletonTable } from '../ui/SkeletonLoader';

const leaders = [
  { name: 'Avery Chen', wpm: 182, accuracy: 99.2, rank: 1, date: '2026-03-28' },
  { name: 'Noah Kim', wpm: 176, accuracy: 98.7, rank: 2, date: '2026-03-29' },
  { name: 'Mila Rodriguez', wpm: 170, accuracy: 97.8, rank: 3, date: '2026-03-27' },
  { name: 'Leo Thompson', wpm: 165, accuracy: 96.5, rank: 4, date: '2026-03-30' },
  { name: 'Zara Patel', wpm: 158, accuracy: 95.9, rank: 5, date: '2026-03-26' },
  { name: 'Ethan Davis', wpm: 152, accuracy: 95.1, rank: 6, date: '2026-03-28' },
  { name: 'Luna Garcia', wpm: 147, accuracy: 94.8, rank: 7, date: '2026-03-25' },
  { name: 'Mason Wilson', wpm: 142, accuracy: 94.2, rank: 8, date: '2026-03-24' },
];

const sortFields = [
  { key: 'rank', label: 'Rank' },
  { key: 'wpm', label: 'WPM' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'date', label: 'Date' },
];

const LeaderboardPage = () => {
  const [sortBy, setSortBy] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const sortedLeaders = useMemo(() => {
    return [...leaders].sort((a, b) => {
      if (sortBy === 'date') {
        const left = new Date(a.date);
        const right = new Date(b.date);
        return sortDirection === 'asc' ? left - right : right - left;
      }

      const left = a[sortBy];
      const right = b[sortBy];
      return sortDirection === 'asc' ? left - right : right - left;
    });
  }, [sortBy, sortDirection]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(field);
    setSortDirection(field === 'rank' ? 'asc' : 'desc');
  };

  const getIndicator = (field) => {
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
          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={8} columns={6} />
            </div>
          ) : (
            <>
          <div className="grid grid-cols-6 gap-4 p-5 border-b border-border bg-background/80 text-text-secondary text-sm uppercase tracking-[0.2em]">
            {sortFields.map((field) => (
              <button
                key={field.key}
                type="button"
                onClick={() => toggleSort(field.key)}
                className="flex items-center gap-2 text-left"
              >
                {field.label}
                {getIndicator(field.key)}
              </button>
            ))}
          </div>

          <div className="divide-y divide-border">
            {sortedLeaders.map((leader, index) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-6 gap-4 p-5 items-center transition hover:bg-white/5 ${
                  leader.rank <= 3 ? 'bg-accent/10' : ''
                }`}
              >
                <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface border border-border text-text font-semibold">
                    {leader.rank <= 3 ? <Crown className="w-5 h-5 text-accent" /> : `#${leader.rank}`}
                  </span>
                </div>
                <div className="col-span-2 text-text font-medium">{leader.name}</div>
                <div className="col-span-1 text-center text-accent font-semibold">{leader.wpm}</div>
                <div className="col-span-1 text-center text-correct font-semibold">{leader.accuracy}%</div>
                <div className="col-span-6 md:col-span-1 text-right text-text-secondary text-sm">{leader.date}</div>
              </motion.div>
            ))}
          </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
