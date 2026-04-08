import { memo, useState, useEffect } from 'react';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Users, Plus, Play, Clock, Trophy, Crown } from 'lucide-react';

function RaceRoomPanel({ raceWinner, racePlayers, socket, user }) {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('rooms:list', (roomsList) => {
        setRooms(roomsList);
      });

      socket.on('room:joined', (room) => {
        setCurrentRoom(room);
        setShowCreateRoom(false);
      });

      socket.on('room:left', () => {
        setCurrentRoom(null);
      });

      // Request initial rooms list
      socket.emit('rooms:get');

      return () => {
        socket.off('rooms:list');
        socket.off('room:joined');
        socket.off('room:left');
      };
    }
  }, [socket]);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      socket.emit('room:create', {
        name: roomName.trim(),
        password: isPrivate ? roomPassword : null,
        isPrivate
      });
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId, password = null) => {
    socket.emit('room:join', { roomId, password });
  };

  const handleLeaveRoom = () => {
    socket.emit('room:leave');
  };

  const handleStartRace = () => {
    if (currentRoom && currentRoom.players.length >= 2) {
      socket.emit('race:start', { roomId: currentRoom.id });
    }
  };

  if (currentRoom) {
    return (
      <div className="space-y-6">
        {/* Room Header */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--color-text)]">{currentRoom.name}</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  {currentRoom.players.length} / {currentRoom.maxPlayers || 8} players
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentRoom.isPrivate && <Badge variant="secondary">Private</Badge>}
              <Button variant="secondary" size="sm" onClick={handleLeaveRoom}>
                Leave Room
              </Button>
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-3">
            <h4 className="font-medium text-[var(--color-text)] flex items-center gap-2">
              <Users className="w-4 h-4" />
              Players ({currentRoom.players.length})
            </h4>
            <div className="space-y-2">
              {currentRoom.players.map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{player.username}</p>
                      {player.id === currentRoom.host && (
                        <Badge variant="primary" size="sm" className="mt-1">
                          <Crown className="w-3 h-3 mr-1" />
                          Host
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--color-muted)]">Ready</p>
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Race Button */}
          {currentRoom.players.length >= 2 && user?.id === currentRoom.host && (
            <div className="mt-6">
              <Button
                onClick={handleStartRace}
                className="w-full"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Race
              </Button>
            </div>
          )}
        </Card>

        {/* Race Status */}
        {raceWinner && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-semibold text-[var(--color-text)]">Race Complete!</p>
                <p className="text-sm text-[var(--color-muted)]">Winner: {raceWinner}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Room Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-[var(--color-text)]">Create Room</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCreateRoom(!showCreateRoom)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateRoom ? 'Cancel' : 'Create'}
          </Button>
        </div>

        {showCreateRoom && (
          <div className="space-y-4">
            <Input
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private-room"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-[var(--color-border)]"
              />
              <label htmlFor="private-room" className="text-sm text-[var(--color-text)]">
                Private room
              </label>
            </div>
            {isPrivate && (
              <Input
                type="password"
                placeholder="Room password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
              />
            )}
            <Button
              onClick={handleCreateRoom}
              loading={loading}
              disabled={!roomName.trim()}
              className="w-full"
            >
              Create Room
            </Button>
          </div>
        )}
      </Card>

      {/* Rooms List */}
      <Card className="p-4">
        <h3 className="font-semibold text-lg text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Available Rooms ({rooms.length})
        </h3>

        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4" />
            <p className="text-[var(--color-muted)]">No rooms available</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div key={room.id} className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-[var(--color-text)]">{room.name}</h4>
                  <div className="flex items-center gap-2">
                    {room.isPrivate && <Badge variant="secondary">Private</Badge>}
                    <Badge variant="outline">
                      {room.players.length}/{room.maxPlayers || 8}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(room.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {room.players.length} players
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.players.length >= (room.maxPlayers || 8)}
                  >
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default memo(RaceRoomPanel);
