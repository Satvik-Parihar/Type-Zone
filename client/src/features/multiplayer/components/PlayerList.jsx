import { memo } from 'react';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Users, Crown, Zap, Target, Clock } from 'lucide-react';

function PlayerList({ racePlayers, currentUser, raceStatus }) {
  const sortedPlayers = [...racePlayers].sort((a, b) => {
    // Sort by progress first, then by WPM
    if (b.progress !== a.progress) {
      return b.progress - a.progress;
    }
    return b.wpm - a.wpm;
  });

  const getPlayerStatus = (player) => {
    if (raceStatus === 'waiting') return 'Waiting';
    if (raceStatus === 'finished') return 'Finished';
    return player.isTyping ? 'Typing' : 'Ready';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Typing': return 'text-green-400';
      case 'Ready': return 'text-blue-400';
      case 'Waiting': return 'text-yellow-400';
      case 'Finished': return 'text-purple-400';
      default: return 'text-[var(--color-muted)]';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Users className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-lg text-[var(--color-text)]">
          Players ({racePlayers.length})
        </h3>
      </div>

      <div className="space-y-3">
        {sortedPlayers.map((player, idx) => {
          const isCurrentUser = player.id === currentUser?.id;
          const status = getPlayerStatus(player);

          return (
            <div
              key={player.id}
              className={`p-4 rounded-lg border transition-all ${
                isCurrentUser
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)]'
              }`}
            >
              {/* Player Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-muted)] w-5">
                      #{idx + 1}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      isCurrentUser
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                        : 'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isCurrentUser ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}>
                          {player.username}
                        </span>
                        {isCurrentUser && <Badge variant="primary" size="sm">You</Badge>}
                      </div>
                      <span className={`text-xs ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[var(--color-text)]">
                    {player.wpm} WPM
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">
                    {player.progress}%
                  </div>
                </div>
              </div>

              {/* Player Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      {player.wpm}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">WPM</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      {player.accuracy || 0}%
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">Accuracy</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1">
                  <span>Progress</span>
                  <span>{player.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${player.progress}%` }}
                  />
                </div>
              </div>

              {/* Additional Stats */}
              {raceStatus === 'finished' && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-[var(--color-text)]">
                        {player.timeTaken || 0}s
                      </div>
                      <div className="text-[var(--color-muted)]">Time</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[var(--color-text)]">
                        {player.errors || 0}
                      </div>
                      <div className="text-[var(--color-muted)]">Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[var(--color-text)]">
                        {player.rank || idx + 1}
                      </div>
                      <div className="text-[var(--color-muted)]">Rank</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {racePlayers.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">No players in race</p>
          <p className="text-sm text-[var(--color-muted)] mt-1">Waiting for participants...</p>
        </div>
      )}
    </Card>
  );
}

export default memo(PlayerList);