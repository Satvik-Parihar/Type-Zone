import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import Navbar from '../layout/Navbar';
import Footer from '../components/Footer';
import { Users, Crown, Play, LogOut, CheckCircle, Circle, Copy, Share } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function RoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [raceStarted, setRaceStarted] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('room:joined', (roomData) => {
      setRoom(roomData);
      setLoading(false);
      setError('');
    });

    newSocket.on('room:updated', (roomData) => {
      setRoom(roomData);
    });

    newSocket.on('room:left', () => {
      navigate('/lobby');
    });

    newSocket.on('race:starting', (count) => {
      setCountdown(count);
      if (count === 0) {
        setTimeout(() => {
          setRaceStarted(true);
          navigate(`/race/${roomId}`);
        }, 1000);
      }
    });

    newSocket.on('error', (error) => {
      setError(error.message);
      setLoading(false);
    });

    // Join the room
    newSocket.emit('room:join', { roomId });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, navigate]);

  const handleReadyToggle = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    socket.emit('player:ready', { roomId, ready: newReadyState });
  };

  const handleStartRace = () => {
    if (room && user?.id === room.host.id) {
      socket.emit('race:start', { roomId });
    }
  };

  const handleLeaveRoom = () => {
    socket.emit('room:leave');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    // Could add a toast notification here
  };

  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join ${room?.name} on TypeZone`,
        text: `Join my typing race room: ${room?.name}`,
        url: `${window.location.origin}/lobby?join=${roomId}`
      });
    } else {
      copyRoomCode();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-text)]">Joining room...</p>
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
          <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Room not found</h2>
          <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
        </Card>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.id === user?.id);
  const isHost = user?.id === room.host.id;
  const canStartRace = isHost && room.players.length >= 2 && room.players.every(p => p.ready);
  const allPlayersReady = room.players.every(p => p.ready);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Navbar />

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl font-black text-white mb-4 animate-pulse">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <p className="text-white/80 text-lg">Race starting...</p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Room Header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-text)]">{room.name}</h1>
                  <p className="text-[var(--color-muted)]">
                    {room.players.length} / {room.maxPlayers || 8} players
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {room.isPrivate && <Badge variant="secondary">Private</Badge>}
                <Button variant="secondary" size="sm" onClick={copyRoomCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Code: {roomId.slice(0, 8)}...
                </Button>
                <Button variant="secondary" size="sm" onClick={shareRoom}>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Room Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!raceStarted && (
                  <Button
                    onClick={handleReadyToggle}
                    variant={currentPlayer?.ready ? "primary" : "secondary"}
                    className="flex items-center gap-2"
                  >
                    {currentPlayer?.ready ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Ready
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        Not Ready
                      </>
                    )}
                  </Button>
                )}

                {isHost && !raceStarted && (
                  <Button
                    onClick={handleStartRace}
                    disabled={!canStartRace}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Race
                  </Button>
                )}
              </div>

              <Button variant="secondary" onClick={handleLeaveRoom}>
                <LogOut className="w-4 h-4 mr-2" />
                Leave Room
              </Button>
            </div>
          </Card>

          {/* Players List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players ({room.players.length})
            </h2>

            <div className="grid gap-4">
              {room.players.map((player) => {
                const isCurrentUser = player.id === user?.id;
                const isRoomHost = player.id === room.host.id;

                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrentUser
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                        : 'border-[var(--color-border)] bg-[var(--color-bg)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                          isCurrentUser
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                            : 'bg-gradient-to-br from-gray-500 to-gray-600'
                        }`}>
                          {player.username.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isCurrentUser ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}>
                              {player.username}
                            </span>
                            {isCurrentUser && <Badge variant="primary" size="sm">You</Badge>}
                            {isRoomHost && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                Host
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[var(--color-muted)]">
                            Joined {new Date(player.joinedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            player.ready ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {player.ready ? 'Ready' : 'Not Ready'}
                          </div>
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            player.ready ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Race Status */}
            {!raceStarted && (
              <div className="mt-6 p-4 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-[var(--color-text)] mb-1">Race Status</h3>
                    <p className="text-sm text-[var(--color-muted)]">
                      {allPlayersReady
                        ? 'All players ready! Host can start the race.'
                        : `${room.players.filter(p => p.ready).length}/${room.players.length} players ready`
                      }
                    </p>
                  </div>
                  {isHost && canStartRace && (
                    <Button onClick={handleStartRace} size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Start Race Now
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}