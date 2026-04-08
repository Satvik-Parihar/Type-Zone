import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Target, Trophy, Users, TrendingUp, Clock, Award, BarChart3 } from 'lucide-react';
import TypingArea from '../components/TypingArea';

const HomePage = () => {
  const sampleText = "The quick brown fox jumps over the lazy dog. This is a sample typing test to demonstrate the interface.";

  const features = [
    {
      icon: Zap,
      title: 'Live Metrics',
      description: 'Real-time WPM, accuracy, and consistency tracking with smooth animations.',
    },
    {
      icon: Users,
      title: 'Multiplayer Races',
      description: 'Compete with players worldwide in real-time typing competitions.',
    },
    {
      icon: Target,
      title: 'Custom Themes',
      description: 'Choose from multiple beautiful themes to match your style and reduce eye strain.',
    },
    {
      icon: BarChart3,
      title: 'Accuracy Analytics',
      description: 'Detailed statistics and progress tracking to improve your typing skills.',
    },
    {
      icon: Clock,
      title: 'Practice Drills',
      description: 'Targeted exercises for numbers, symbols, and common mistakes.',
    },
    {
      icon: Award,
      title: 'Leaderboards',
      description: 'Climb the ranks and see how you stack up against other typists.',
    },
  ];

  const stats = [
    { label: 'Users', value: '10,000+', icon: Users },
    { label: 'Tests Taken', value: '500,000+', icon: BarChart3 },
    { label: 'Avg WPM', value: '65', icon: Zap },
    { label: 'Top WPM', value: '180+', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-text mb-6">
                Master typing with
                <span className="text-accent"> precision</span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Experience the next generation of typing tests. Real-time metrics,
                beautiful animations, and a focus on what matters most - your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/typing"
                  className="px-8 py-4 bg-accent text-background font-semibold rounded-xl hover:bg-accent/90 transition-colors text-center"
                >
                  Start Typing Test
                </Link>
                <Link
                  to="/practice"
                  className="px-8 py-4 border border-border text-text rounded-xl hover:bg-hover transition-colors text-center"
                >
                  Practice Drills
                </Link>
              </div>
            </motion.div>

            {/* Right side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="backdrop-blur-md bg-surface/50 rounded-2xl p-8 border border-border">
                <TypingArea text={sampleText} mode="time" duration={30} />
              </div>
              <div className="absolute -top-4 -right-4 backdrop-blur-md bg-accent/20 rounded-xl p-4 border border-accent/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">87 WPM</div>
                  <div className="text-sm text-accent/80">Live Speed</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-text mb-4">Why TypeZone?</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Built for serious typists who want more than just a speed test.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="backdrop-blur-md bg-surface/50 rounded-xl p-6 border border-border hover:border-accent/50 transition-colors group"
              >
                <feature.icon className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-text mb-4">Community Stats</h2>
            <p className="text-text-secondary">Join thousands of typists improving every day</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center backdrop-blur-md bg-surface/50 rounded-xl p-6 border border-border"
              >
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-4" />
                <div className="text-3xl font-bold text-text mb-2">{stat.value}</div>
                <div className="text-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-text mb-4">Try it now</h2>
            <p className="text-text-secondary mb-8">Experience the smooth typing interface</p>
            <div className="backdrop-blur-md bg-surface/50 rounded-2xl p-8 border border-border">
              <TypingArea text={sampleText} mode="time" duration={60} />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
