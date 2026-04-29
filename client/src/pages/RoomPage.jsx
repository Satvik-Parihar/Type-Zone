import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Users, Check, AlertCircle, LogOut } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { roomEvents, playerEvents, raceEvents } from '../services/socketService';

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRoomJoined = (joinedRoom) => {
      setRoom(joinedRoom);
      setLoading(false);
      setError(null);
    };

    const handleRoomUpdated = (updatedRoom) => {
      setRoom(updatedRoom);
    };

    const handleRoomLeft = () => {
      navigate('/multiplayer');
    };

    const handleError = (errorData) => {
      setError(errorData.message);
      if (errorData.message.includes('Room not found')) {
        setTimeout(() => navigate('/multiplayer'), 2000);
      }
    };

    const handleRaceCountdown = (count) => {
      setCountdownStarted(true);
      setCountdown(count);
    };

    const handleRaceStarted = () => {
      navigate(`/multiplayer/race/${roomId}`);
    };

    socket.on(roomEvents.ROOM_JOINED, handleRoomJoined);
    socket.on(roomEvents.ROOM_UPDATED, handleRoomUpdated);
    socket.on(roomEvents.ROOM_LEFT, handleRoomLeft);
    socket.on(roomEvents.ERROR, handleError);
    socket.on(raceEvents.RACE_COUNTDOWN, handleRaceCountdown);
    socket.on(raceEvents.RACE_STARTED, handleRaceStarted);

    // Join room
    socket.emit(roomEvents.JOIN_ROOM, { roomId, password: null });

    return () => {
      socket.off(roomEvents.ROOM_JOINED, handleRoomJoined);
      socket.off(roomEvents.ROOM_UPDATED, handleRoomUpdated);
      socket.off(roomEvents.ROOM_LEFT, handleRoomLeft);
      socket.off(roomEvents.ERROR, handleError);
      socket.off(raceEvents.RACE_COUNTDOWN, handleRaceCountdown);
      socket.off(raceEvents.RACE_STARTED, handleRaceStarted);
    };
  }, [socket, roomId, navigate]);

  const handleReady = () => {
    if (socket) {
      const newReadyState = !isReady;
      setIsReady(newReadyState);
      socket.emit(playerEvents.READY, { roomId, ready: newReadyState });
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit(roomEvents.LEAVE_ROOM);
    }
  };

  const handleStartRace = () => {
    if (socket && room && room.host.id === user?.id) {
      const allReady = room.players.every(p => p.ready);
      if (allReady && room.players.length >= 2) {
        socket.emit(raceEvents.START_RACE, { roomId });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-surface border-t-accent animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Joining room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-text-secondary">{error || 'Room not found'}</p>
          <button onClick={() => navigate('/multiplayer')} className="btn-primary mt-4">
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const allReady = room.players.every(p => p.ready);
  const isHost = room.host.id === user?.id;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Countdown Overlay */}
        {countdownStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-9xl font-bold text-accent"
            >
              {countdown === 0 ? 'GO!' : countdown}
            </motion.div>
          </motion.div>
        )}

        {/* Room Header */}
        <div className="mb-12">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-5xl font-bold text-text mb-2">{room.name}</h1>
              <p className="text-text-secondary">
                {allReady && room.players.length >= 2
                  ? 'All players ready - Game starts soon!'
                  : 'Waiting for players to get ready...'}
              </p>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-text mb-6">Players ({room.players.length})</h2>
            <div className="space-y-4">
              {room.players.map((player, idx) => {
                const isCurrentPlayer = player.id === user?.id;
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`card p-6 flex items-center justify-between ${
                      isCurrentPlayer ? 'border-accent border-2' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                        {player.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-text">
                          {player.username}
                          {isCurrentPlayer && <span className="text-text-secondary text-sm ml-2">(You)</span>}
                          {room.host.id === player.id && (
                            <span className="text-accent text-sm ml-2">Host</span>
                          )}
                        </p>
                        <p className="text-text-secondary text-sm">Joined {new Date(player.joinedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <motion.div
                      animate={{
                        scale: player.ready ? 1.1 : 1,
                        backgroundColor: player.ready ? 'rgba(92, 225, 230, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                      }}
                      className="px-4 py-2 rounded border border-border flex items-center gap-2 min-w-24 justify-center"
                    >
                      {player.ready ? (
                        <>
                          <Check className="w-4 h-4 text-accent" />
                          <span className="text-accent text-sm font-medium">Ready</span>
                        </>
                      ) : (
                        <span className="text-text-secondary text-sm">Waiting</span>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Room Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Room Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-text-secondary mb-1">Mode</p>
                  <p className="text-text font-medium">60 seconds</p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Difficulty</p>
                  <p className="text-text font-medium">Normal</p>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Max Players</p>
                  <p className="text-text font-medium">{room.maxPlayers}</p>
                </div>
              </div>
            </div>

            {/* Player Actions */}
            <div className="space-y-3">
              <button
                onClick={handleReady}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-all ${
                  isReady
                    ? 'bg-accent/30 border border-accent text-accent'
                    : 'btn-primary'
                }`}
              >
                {isReady ? '✓ Ready' : 'Mark Ready'}
              </button>

              {isHost && room.players.length >= 2 && allReady && (
                <button
                  onClick={handleStartRace}
                  className="w-full btn-success flex items-center justify-center gap-2 font-semibold py-3 px-4"
                >
                  <Play className="w-5 h-5" />
                  Start Race
                </button>
              )}
            </div>

            {/* Status */}
            {isHost && (
              <div className="card p-4 bg-accent/10 border border-accent/30">
                <p className="text-text-secondary text-xs mb-2">As room host, you can start the race</p>
                <p className="text-accent text-sm font-medium">
                  {room.players.length < 2
                    ? `Need ${2 - room.players.length} more player${2 - room.players.length > 1 ? 's' : ''}`
                    : allReady
                    ? 'Everyone is ready!'
                    : 'Waiting for all players to be ready'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
