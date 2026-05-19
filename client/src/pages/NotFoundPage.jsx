import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 text-center">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-9xl font-bold text-accent font-mono mb-4"
          style={{ textShadow: '0 0 60px var(--color-accent)' }}
        >
          404
        </motion.h1>
        <p className="text-2xl font-semibold text-text mb-3">
          Page not found
        </p>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          This page doesn't exist. Maybe you were looking for the typing test?
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/type" className="btn-ghost">Start Typing</Link>
        </div>
      </div>
    </div>
  );
}
