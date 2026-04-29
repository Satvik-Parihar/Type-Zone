import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './useTheme';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { cycleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const typingInField =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === 'Escape') {
        navigate('/');
        return;
      }

      if (typingInField) {
        return;
      }

      // Ctrl+Shift+T: Cycle theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        cycleTheme();
        return;
      }

      // Ctrl+L: Leaderboard
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        navigate('/leaderboard');
        return;
      }

      // Ctrl+P: Profile
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        navigate('/profile');
        return;
      }

      // Ctrl+T: Go to typing page
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        navigate('/type');
        return;
      }

      // Alt+P: Go to practice
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        navigate('/practice');
        return;
      }

      // Alt+M: Go to multiplayer
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        navigate('/multiplayer');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, cycleTheme]);
};
