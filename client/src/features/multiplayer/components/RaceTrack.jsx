import { memo } from 'react';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Trophy, Target, Zap } from 'lucide-react';

function RaceTrack({ racePlayers, raceWinner, raceStatus, timeLeft }) {
  const sortedPlayers = [...racePlayers].sort((a, b) => b.progress - a.progress);

  return (
    <Card className="p-6">
      {/* Race Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[var(--color-text)]">Race Track</h3>
            <p className="text-sm text-[var(--color-muted)]">
              {raceStatus === 'waiting' && 'Waiting for race to start...'}
              {raceStatus === 'active' && `Time left: ${timeLeft}s`}
              {raceStatus === 'finished' && 'Race completed!'}
            </p>
          </div>
        </div>
        {raceWinner && (
          <Badge variant="primary" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Winner: {raceWinner}
          </Badge>
        )}
      </div>

      {/* Race Track Visualization */}
      <div className="space-y-4">
        {sortedPlayers.map((player, idx) => (
          <div key={player.id} className="relative">
            {/* Player Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-muted)] w-6">
                    #{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-[var(--color-text)]">{player.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-[var(--color-text)]">{player.wpm} WPM</span>
                </div>
                <span className="text-[var(--color-muted)]">{player.progress}%</span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="relative">
              <div className="h-3 w-full rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out relative"
                  style={{ width: `${player.progress}%` }}
                >
                  {/* Animated cursor */}
                  <div
                    className="absolute top-0 right-0 w-1 h-full bg-white/80 rounded-r-full animate-pulse"
                    style={{
                      transform: player.progress > 0 ? 'translateX(0)' : 'translateX(-100%)',
                      transition: 'transform 0.3s ease-out'
                    }}
                  />
                </div>
              </div>

              {/* Finish line */}
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-white to-transparent opacity-50"></div>
            </div>

            {/* Accuracy indicator */}
            <div className="flex justify-end mt-1">
              <span className="text-xs text-[var(--color-muted)]">
                {player.accuracy ? `${player.accuracy}% accuracy` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Race Stats */}
      {raceStatus === 'finished' && (
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          <h4 className="font-medium text-[var(--color-text)] mb-3">Final Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
              <div className="text-2xl font-bold text-[var(--color-text)]">
                {Math.max(...racePlayers.map(p => p.wpm))} WPM
              </div>
              <p className="text-sm text-[var(--color-muted)]">Highest Speed</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
              <div className="text-2xl font-bold text-[var(--color-text)]">
                {Math.max(...racePlayers.map(p => p.accuracy || 0))}%
              </div>
              <p className="text-sm text-[var(--color-muted)]">Best Accuracy</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
              <div className="text-2xl font-bold text-[var(--color-text)]">
                {racePlayers.length}
              </div>
              <p className="text-sm text-[var(--color-muted)]">Participants</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default memo(RaceTrack);