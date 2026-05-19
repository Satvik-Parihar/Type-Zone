import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Users, Clock, Lock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { roomEvents } from '../services/socketService';

export default function LobbyPage() {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', isPrivate: false, password: '', maxPlayers: 8 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    if (socket) return;
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomsList = (roomsList) => {
      setRooms(roomsList);
      setLoading(false);
    };

    const handleError = (errorData) => {
      setError(errorData.message);
    };

    const handleRoomCreated = (room) => {
      setError(null);
      navigate(`/multiplayer/room/${room.id}`);
    };

    const handleRoomJoined = (room) => {
      setError(null);
      navigate(`/multiplayer/room/${room.id}`);
    };

    socket.on(roomEvents.ROOMS_LIST, handleRoomsList);
    socket.on(roomEvents.ERROR, handleError);
    socket.on(roomEvents.ROOM_CREATED, handleRoomCreated);
    socket.on(roomEvents.ROOM_JOINED, handleRoomJoined);

    // Request rooms list on mount
    socket.emit(roomEvents.GET_ROOMS);

    // Re-request every 5 seconds to keep lobby updated
    const interval = setInterval(() => socket.emit(roomEvents.GET_ROOMS), 5000);

    return () => {
      socket.off(roomEvents.ROOMS_LIST, handleRoomsList);
      socket.off(roomEvents.ERROR, handleError);
      socket.off(roomEvents.ROOM_CREATED, handleRoomCreated);
      socket.off(roomEvents.ROOM_JOINED, handleRoomJoined);
      clearInterval(interval);
    };
  }, [socket, navigate]);

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) {
      setError('Room name is required');
      return;
    }

    if (socket) {
      socket.emit(roomEvents.CREATE_ROOM, {
        name: newRoom.name.trim(),
        isPrivate: newRoom.isPrivate,
        password: newRoom.isPrivate ? newRoom.password : null,
        maxPlayers: newRoom.maxPlayers
      });

      setNewRoom({ name: '', isPrivate: false, password: '', maxPlayers: 8 });
      setShowCreateModal(false);
      setError(null);
    }
  };

  const handleJoinRoom = (roomId, isPrivate = false) => {
    if (socket) {
      let password = null;
      if (isPrivate) {
        password = prompt('Enter room password:');
        if (!password) return;
      }

      socket.emit(roomEvents.JOIN_ROOM, { roomId, password });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-text mb-2">Multiplayer</h1>
            <p className="text-text-secondary">Race against friends and the world</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Match */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/multiplayer/race/quick')}
              className="card p-8 text-left hover:border-accent transition-colors"
            >
              <Play className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">Quick Match</h3>
              <p className="text-text-secondary">Jump into a random race with other players</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              className="card p-8 text-left hover:border-accent transition-colors opacity-50 cursor-not-allowed"
            >
              <Lock className="w-8 h-8 text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">Tournament</h3>
              <p className="text-text-secondary">Coming soon</p>
            </motion.button>
          </div>
        </div>

        {/* Active Rooms */}
        <div>
          <h2 className="text-2xl font-bold text-text mb-4">
            Active Rooms {!loading && `(${rooms.length})`}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="card p-6 animate-pulse">
                  <div className="h-6 bg-surface rounded mb-4 w-3/4" />
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-surface rounded w-1/2" />
                    <div className="h-4 bg-surface rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-surface rounded" />
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="card p-12 text-center">
              <Users className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">No active rooms. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room, idx) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card p-6 hover:border-accent transition-colors"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-text">{room.name}</h3>
                    {room.isPrivate && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                        <Lock className="w-3 h-3" />
                        Private
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-6 text-text-secondary text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {room.players.length}/{room.maxPlayers} players
                    </div>
                    <span className="badge text-xs">
                      {room.mode || 'quote'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>Created {new Date(room.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="w-full bg-surface rounded h-2 mb-4">
                    <div
                      className="bg-accent h-full rounded transition-all"
                      style={{ width: `${(room.players.length / room.maxPlayers) * 100}%` }}
                    />
                  </div>

                  <button
                    onClick={() => handleJoinRoom(room.id, room.isPrivate)}
                    disabled={room.players.length >= room.maxPlayers}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {room.players.length >= room.maxPlayers ? 'Room Full' : 'Join'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel p-8 rounded-2xl max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-text mb-6">Create Room</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-text-secondary text-sm mb-2">Room Name</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g., My Speed Challenge"
                  className="input-field w-full"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRoom.isPrivate}
                  onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                  className="rounded"
                />
                <span className="text-text-secondary">Make this room private</span>
              </label>

              {newRoom.isPrivate && (
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Password</label>
                  <input
                    type="password"
                    value={newRoom.password}
                    onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                    placeholder="Enter password"
                    className="input-field w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Max Players
                </label>
                <select
                  value={newRoom.maxPlayers}
                  onChange={(e) => setNewRoom((r) => ({ ...r, maxPlayers: Number(e.target.value) }))}
                  className="input-field"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} players</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!newRoom.name.trim()}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
