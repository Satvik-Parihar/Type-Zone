import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import Navbar from '../layout/Navbar';
import Footer from '../components/Footer';
import { Trophy, Crown, Zap, Target, Clock, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function RacePage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [raceData, setRaceData] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const confettiRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('race:joined', (data) => {
      setRaceData(data);
      setLoading(false);
    });

    newSocket.on('race:countdown', (count) => {
      setCountdown(count);
      if (count === 0) {
        setTimeout(() => setRaceStarted(true), 1000);
      }
    });

    newSocket.on('race:update', (data) => {
      setRaceData(data);
    });

    newSocket.on('race:finished', (data) => {
      setRaceData(data);
      setRaceFinished(true);
      setWinner(data.winner);

      // Show confetti for winner
      if (data.winner.id === user?.id) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    });

    newSocket.on('error', (error) => {
      setError(error.message);
      setLoading(false);
    });

    // Join the race
    newSocket.emit('race:join', { roomId });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, user?.id]);

  const handleBackToLobby = () => {
    navigate('/lobby');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const sortedPlayers = raceData?.players
    ? [...raceData.players].sort((a, b) => {
        if (raceFinished) {
          return a.finishTime - b.finishTime;
        }
        return b.progress - a.progress;
      })
    : [];

  const currentPlayer = sortedPlayers.find(p => p.id === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-text)]">Loading race...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Error</h2>
          <p className="text-[var(--color-muted)] mb-6">{error}</p>
          <Button onClick={handleBackToLobby}>Back to Lobby</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Navbar />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50" ref={confettiRef}>
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: ['#06B6D4', '#2563EB', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)]
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown > 0 && !raceStarted && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="text-9xl font-black text-white mb-4 animate-pulse">
              {countdown}
            </div>
            <p className="text-white/80 text-xl">Get ready...</p>
          </div>
        </div>
      )}

      {/* Race Finished Overlay */}
      {raceFinished && winner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Race Complete!</h2>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                {winner.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-[var(--color-text)]">{winner.username}</p>
                <p className="text-sm text-[var(--color-muted)]">Winner!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleBackToLobby} className="flex-1">
                Back to Lobby
              </Button>
              <Button variant="secondary" onClick={handleBackToHome} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </Card>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Race Header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-text)]">Live Race</h1>
                  <p className="text-[var(--color-muted)]">
                    {raceData?.players?.length || 0} competitors • {raceData?.text?.length || 0} characters
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {raceStarted && !raceFinished && (
                  <div className="flex items-center gap-2 text-[var(--color-text)]">
                    <Clock className="w-5 h-5" />
                    <span className="font-mono text-lg">
                      {Math.floor((Date.now() - (raceData?.startTime || Date.now())) / 1000)}s
                    </span>
                  </div>
                )}

                <Button variant="secondary" onClick={handleBackToLobby}>
                  <Home className="w-4 h-4 mr-2" />
                  Lobby
                </Button>
              </div>
            </div>
          </Card>

          {/* Race Tracks */}
          <div className="space-y-4 mb-6">
            {sortedPlayers.map((player, index) => {
              const isCurrentUser = player.id === user?.id;
              const isWinner = raceFinished && winner && player.id === winner.id;

              return (
                <Card
                  key={player.id}
                  className={`p-4 transition-all ${
                    isCurrentUser ? 'ring-2 ring-[var(--color-accent)]' : ''
                  } ${isWinner ? 'ring-2 ring-yellow-500 bg-yellow-500/5' : ''}`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    {/* Position & Avatar */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[60px]">
                        <span className="text-lg font-bold text-[var(--color-muted)] w-6">
                          #{index + 1}
                        </span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          isCurrentUser
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                            : isWinner
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                            : 'bg-gradient-to-br from-gray-500 to-gray-600'
                        }`}>
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Player Info */}
                      <div className="min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isCurrentUser ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}>
                            {player.username}
                          </span>
                          {isCurrentUser && <Badge variant="primary" size="sm">You</Badge>}
                          {isWinner && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Winner
                            </Badge>
                          )}
                        </div>
                        {raceFinished && player.finishTime && (
                          <p className="text-xs text-[var(--color-muted)]">
                            Finished in {player.finishTime}s
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 ml-auto">
                      <div className="text-center">
                        <div className="text-xl font-bold text-[var(--color-text)]">
                          {player.wpm || 0}
                        </div>
                        <div className="text-xs text-[var(--color-muted)]">WPM</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-[var(--color-text)]">
                          {player.accuracy || 0}%
                        </div>
                        <div className="text-xs text-[var(--color-muted)]">Accuracy</div>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <div className="text-xl font-bold text-[var(--color-text)]">
                          {player.progress || 0}%
                        </div>
                        <div className="text-xs text-[var(--color-muted)]">Progress</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Track */}
                  <div className="relative">
                    <div className="h-4 w-full rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out relative"
                        style={{ width: `${player.progress || 0}%` }}
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
                </Card>
              );
            })}
          </div>

          {/* Current Player Stats */}
          {currentPlayer && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Your Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[var(--color-bg)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    {currentPlayer.wpm || 0}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">Current WPM</div>
                </div>
                <div className="text-center p-4 bg-[var(--color-bg)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    {currentPlayer.accuracy || 0}%
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-[var(--color-bg)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    {currentPlayer.progress || 0}%
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">Progress</div>
                </div>
                <div className="text-center p-4 bg-[var(--color-bg)] rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-text)]">
                    #{sortedPlayers.findIndex(p => p.id === user?.id) + 1}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">Position</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}