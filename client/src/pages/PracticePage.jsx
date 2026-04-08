import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hash, Slash, ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const drills = [
  {
    title: 'Numbers Surge',
    icon: Hash,
    description: 'Push your number accuracy with focused numeric sequences and rhythm training.',
  },
  {
    title: 'Symbol Mastery',
    icon: Slash,
    description: 'Practice brackets, punctuation, and special characters with clean keystrokes.',
  },
  {
    title: 'Left Hand Flow',
    icon: ArrowRight,
    description: 'Strengthen left-hand consistency with dedicated stretches and drills.',
  },
  {
    title: 'Right Hand Focus',
    icon: ArrowRight,
    description: 'Sharpen right-hand speed through targeted letter gradients.',
  },
  {
    title: 'Common Mistakes',
    icon: ShieldCheck,
    description: 'Train around your weak keys and habitual slip-ups with smart prompts.',
  },
  {
    title: 'Hard Words',
    icon: Sparkles,
    description: 'Conquer the trickiest vocabulary with slow-typed precision sessions.',
  },
];

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-[0.32em] text-text-secondary mb-4">Practice drills</p>
          <h1 className="text-5xl font-semibold text-text mb-4">Structured practice for every skill gap</h1>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Choose a focused drill and build a more accurate, faster, and more comfortable typing style.
          </p>
        </motion.header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {drills.map((drill, index) => {
            const Icon = drill.icon;
            return (
              <motion.article
                key={drill.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass-panel p-6 hover:border-accent/50 hover:-translate-y-1 transition"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-accent/10 text-accent mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-text mb-3">{drill.title}</h2>
                <p className="text-text-secondary leading-relaxed">{drill.description}</p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-8 border border-border"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-semibold text-text mb-2">Ready for a focused session?</h2>
              <p className="text-text-secondary max-w-2xl">
                Jump into a drill designed to fix the mistakes that cost you the most points.
              </p>
            </div>
            <Link
              to="/typing"
              className="btn-primary"
            >
              Start a new drill
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
