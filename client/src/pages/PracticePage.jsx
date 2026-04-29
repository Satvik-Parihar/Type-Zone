import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Brain, Volume2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PracticePage() {
  const navigate = useNavigate();
  const [selectedDrill, setSelectedDrill] = useState(null);

  const drills = [
    {
      id: 'fundamentals',
      title: 'Fundamentals',
      description: 'Learn proper finger placement and basic keys',
      icon: Target,
      difficulty: 'Beginner',
      lessons: 12,
      completed: 3,
      available: true
    },
    {
      id: 'accuracy',
      title: 'Accuracy Drill',
      description: 'Focus on typing accuracy over speed',
      icon: Zap,
      difficulty: 'Intermediate',
      lessons: 8,
      completed: 0,
      available: true
    },
    {
      id: 'speed',
      title: 'Speed Training',
      description: 'Gradually increase typing speed with progressive challenges',
      icon: Brain,
      difficulty: 'Advanced',
      lessons: 15,
      completed: 0,
      available: true
    },
    {
      id: 'coding',
      title: 'Code Snippets',
      description: 'Practice typing actual code to improve coding speed',
      icon: Lock,
      difficulty: 'Expert',
      lessons: 20,
      completed: 0,
      available: false
    },
    {
      id: 'language',
      title: 'Multiple Languages',
      description: 'Type in English, Spanish, French, and more',
      icon: Volume2,
      difficulty: 'Intermediate',
      lessons: 25,
      completed: 0,
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-text mb-2">Practice</h1>
          <p className="text-text-secondary">Structured lessons to improve your typing skills</p>
        </div>

        {/* Drills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {drills.map((drill, idx) => {
            const Icon = drill.icon;
            const progress = drill.lessons > 0 ? (drill.completed / drill.lessons) * 100 : 0;

            return (
              <motion.button
                key={drill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => drill.available && setSelectedDrill(drill)}
                disabled={!drill.available}
                className={`text-left transition-all ${drill.available ? 'hover:border-accent' : 'opacity-60'}`}
              >
                <div className={`card p-6 h-full ${!drill.available ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-accent" />
                    <span className={`text-xs px-2 py-1 rounded badge ${
                      drill.difficulty === 'Beginner'
                        ? 'bg-green-500/20 text-green-400'
                        : drill.difficulty === 'Intermediate'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : drill.difficulty === 'Advanced'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {drill.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-text mb-2">{drill.title}</h3>
                  <p className="text-text-secondary text-sm mb-6">{drill.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-text-secondary">{drill.completed}/{drill.lessons} lessons</p>
                      <p className="text-xs font-semibold text-accent">{Math.round(progress)}%</p>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-accent h-full rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {!drill.available && (
                    <div className="flex items-center gap-2 text-text-secondary text-xs">
                      <Lock className="w-3 h-3" />
                      Coming Soon
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Drill Detail Modal */}
        {selectedDrill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass-panel p-8 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                {(() => {
                  const Icon = selectedDrill.icon;
                  return <Icon className="w-8 h-8 text-accent" />;
                })()}
                <h2 className="text-3xl font-bold text-text">{selectedDrill.title}</h2>
              </div>

              <p className="text-text-secondary mb-6">{selectedDrill.description}</p>

              {/* Lessons List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-text mb-4">Lessons</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Array.from({ length: selectedDrill.lessons }).map((_, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`p-3 rounded border transition-colors cursor-pointer ${
                        idx < selectedDrill.completed
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'border-border hover:border-accent'
                      }`}
                    >
                      <span className="text-text-secondary">Lesson {idx + 1}</span>
                      {idx < selectedDrill.completed && (
                        <span className="text-green-400 float-right">✓ Completed</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedDrill(null)}
                  className="btn-ghost flex-1"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedDrill(null);
                    navigate('/type');
                  }}
                  className="btn-primary flex-1"
                >
                  Start Practicing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Tips */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-text mb-4">Pro Tips</h2>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex gap-3">
              <span className="text-accent">•</span>
              <span>Keep your posture upright and feet flat on the ground</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">•</span>
              <span>Use proper finger placement - ASDF and JKL; for home row</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">•</span>
              <span>Accuracy is more important than speed - slow down if needed</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">•</span>
              <span>Practice consistently - 15 minutes daily beats occasional long sessions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">•</span>
              <span>Focus on common words and letter combinations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
