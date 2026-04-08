import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Target, Trophy, Users, Clock, Award, BarChart3 } from 'lucide-react';
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
      {/* Hero Section - Centered */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl sm:text-7xl font-bold text-text mb-6 leading-tight">
              Master typing with
              <span className="text-accent"> precision</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Experience the next generation of typing tests. Real-time metrics,
              beautiful animations, and a focus on what matters most - your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/typing"
                className="px-8 py-4 btn-primary font-semibold rounded-xl text-center"
              >
                Start Typing Test
              </Link>
              <Link
                to="/practice"
                className="px-8 py-4 btn-secondary font-semibold rounded-xl text-center"
              >
                Practice Drills
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Typing Preview Section - Centered Large */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-text mb-4">See it in action</h2>
            <p className="text-lg text-text-secondary mb-12">Fast, smooth, and distraction-free typing experience</p>
            <TypingArea text={sampleText} mode="time" duration={30} minimal={true} />
          </motion.div>
        </div>
      </section>

      {/* Features Section - 3 Column Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-text mb-4">Why TypeZone?</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
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
                className="glass-panel p-6 rounded-xl hover:border-accent/50 transition-colors group"
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-text mb-4">Community Stats</h2>
            <p className="text-text-secondary text-lg">Join thousands of typists improving every day</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center glass-panel p-8 rounded-xl"
              >
                <stat.icon className="w-8 h-8 text-accent mx-auto mb-4" />
                <div className="text-4xl font-bold text-text mb-2">{stat.value}</div>
                <div className="text-text-secondary font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
