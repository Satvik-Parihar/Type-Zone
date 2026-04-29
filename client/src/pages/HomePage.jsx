import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, BarChart3, Keyboard, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import TypingArea from '../components/TypingArea';
import { SkeletonLoader } from '../ui/SkeletonLoader';

const TEST_WORDS = [
  'the quick brown fox jumps over the lazy dog several times each day',
  'productivity and creativity are the keys to success in the modern world',
  'technology evolves at lightning speed disrupting established industries',
  'passion drives innovation and innovation drives progress forward always',
  'excellence is not a skill but a habit repeated daily with discipline'
];

export default function HomePage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalUsers: 0,
    activeUsers: 0,
    topWpm24h: 0,
    avgWpm: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [testWords, setTestWords] = useState(TEST_WORDS[0]);
  const [testComplete, setTestComplete] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const hasCommunityStats =
    stats.totalSessions > 0 ||
    stats.totalUsers > 0 ||
    stats.activeUsers > 0 ||
    stats.topWpm24h > 0 ||
    stats.avgWpm > 0;

  useEffect(() => {
    // Fetch real stats
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch('/api/typing/stats/global');
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();

    // Change test words periodically
    const interval = setInterval(() => {
      const randomText = TEST_WORDS[Math.floor(Math.random() * TEST_WORDS.length)];
      setTestWords(randomText);
      setTestComplete(false);
      setTestResult(null);
    }, 30000); // Change every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleTestComplete = (metrics) => {
    setTestComplete(true);
    setTestResult(metrics);
  };

  const features = [
    {
      icon: Zap,
      title: 'Live WPM Tracking',
      description: 'Real-time typing speed with visual feedback'
    },
    {
      icon: Users,
      title: 'Race Others',
      description: 'Compete with friends in multiplayer races'
    },
    {
      icon: BarChart3,
      title: 'Full Analytics',
      description: 'Detailed statistics and performance insights'
    },
    {
      icon: Keyboard,
      title: 'Multiple Modes',
      description: 'Time, words, quotes, and custom text modes'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold text-text mb-6">
            type <span className="text-accent">faster</span>
            <span
              className="text-accent ml-1"
              style={{ animation: 'blink 1s step-end infinite' }}
            >.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            The next-generation typing platform. Test your speed, track your progress, and compete with the world.
          </p>
          <Link to="/type" className="btn-primary inline-block">
            Start Typing Now <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>

      {/* Mini Typing Test */}
      <div className="px-4 py-12 border-t border-b border-border bg-card/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-text mb-8 text-center">Try It Now</h2>
          <TypingArea text={testWords} mode="time" duration={30} onComplete={handleTestComplete} minimal={true} />
          
          {testResult && testComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <p className="text-4xl font-bold text-accent mb-2">{Math.round(testResult.wpm || 0)} WPM</p>
              <p className="text-text-secondary mb-6">{Math.round(testResult.accuracy || 100)}% accuracy</p>
              <Link to="/type" className="btn-primary">
                <Play className="w-4 h-4 mr-2" />
                Full Test
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Community Stats */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text mb-12 text-center">Community Statistics</h2>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="card p-4 text-center space-y-3">
                  <SkeletonLoader height="h-4" className="w-3/4 mx-auto" />
                  <SkeletonLoader height="h-8" className="w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : hasCommunityStats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Sessions', value: stats.totalSessions.toLocaleString() },
                { label: 'Active Users', value: stats.activeUsers.toLocaleString() },
                { label: 'Total Users', value: stats.totalUsers.toLocaleString() },
                { label: 'Avg WPM', value: Math.round(stats.avgWpm) },
                { label: 'Top WPM (24h)', value: Math.round(stats.topWpm24h) }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card p-4 text-center"
                >
                  <p className="text-text-secondary text-xs mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-accent">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-text-secondary">
              Community stats will appear after the first live sessions are recorded.
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text mb-12 text-center">Why TypeZone?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card p-6"
                >
                  <Icon className="w-8 h-8 text-accent mb-4" />
                  <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                  <p className="text-text-secondary text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 text-center border-t border-border">
        <h2 className="text-3xl font-bold text-text mb-6">Ready to test your typing?</h2>
        <Link to="/type" className="btn-primary inline-block">
          Start Your First Test
        </Link>
      </div>
    </div>
  );
}
