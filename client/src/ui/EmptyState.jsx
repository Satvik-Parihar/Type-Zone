/**
 * Empty State Components
 * Displayed when there's no data to show
 */

import React from 'react';
import { Button } from './Button';
import { Clipboard, Clock3, Flag, Users, Trophy, AlertTriangle } from 'lucide-react';

const illustrations = {
  empty: Clipboard,
  noHistory: Clock3,
  noRace: Flag,
  noFriends: Users,
  noAchievements: Trophy,
  error: AlertTriangle,
};

export function EmptyState({
  icon = Clipboard,
  title = 'No data',
  description = 'Nothing to show here',
  action,
  actionLabel = 'Get started',
  className = '',
}) {
  const Icon = icon;

  return (
    <div className={`flex flex-col items-center justify-center min-h-64 py-12 px-4 text-center ${className}`}>
      <div className="text-6xl mb-4 opacity-50">{typeof icon === 'string' ? icon : <Icon size={56} />}</div>
      <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-muted)] mb-6 max-w-80">{description}</p>
      {action && (
        <Button 
          variant="primary" 
          size="lg"
          onClick={action}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function NoHistoryState({ onStartTest }) {
  return (
    <EmptyState
      icon={illustrations.noHistory}
      title="No Typing Tests Yet"
      description="Start your first typing test to see your performance history"
      action={onStartTest}
      actionLabel="Start Typing Test"
    />
  );
}

export function NoRaceState({ onJoinRace }) {
  return (
    <EmptyState
      icon={illustrations.noRace}
      title="No Active Races"
      description="Join a multiplayer race to compete with other typists"
      action={onJoinRace}
      actionLabel="Join Race"
    />
  );
}

export function NoAchievementsState() {
  return (
    <EmptyState
      icon={illustrations.noAchievements}
      title="Achievements Locked"
      description="Complete typing tests and challenges to unlock achievements"
    />
  );
}

export function ErrorState({ message, onRetry, actionLabel = 'Retry' }) {
  return (
    <EmptyState
      icon={illustrations.error}
      title="Something went wrong"
      description={message || 'An error occurred while loading data'}
      action={onRetry}
      actionLabel={actionLabel}
    />
  );
}
