import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import Navbar from '../layout/Navbar';
import Footer from '../components/Footer';
import { Users, Plus, Lock, Unlock, Crown, Clock, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function LobbyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('rooms:list', (roomsList) => {
      setRooms(roomsList);
    });

    newSocket.on('room:created', (room) => {
      navigate(`/room/${room.id}`);
    });

    newSocket.on('room:joined', (room) => {
      navigate(`/room/${room.id}`);
    });

    newSocket.on('error', (error) => {
      setError(error.message);
      setLoading(false);
    });

    // Request initial rooms list
    newSocket.emit('rooms:get');

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  const handleCreateRoom = () => {
    if (!roomName.trim()) return;

    setLoading(true);
    socket.emit('room:create', {
      name: roomName.trim(),
      password: isPrivate ? roomPassword : null,
      isPrivate
    });
  };

  const handleJoinRoom = (roomId, password = null) => {
    setLoading(true);
    socket.emit('room:join', { roomId, password });
  };

  const handleJoinByCode = () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    socket.emit('room:join', { roomId: joinCode.trim() });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B1220', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', marginBottom: '48px' }}>
          <div style={{ marginBottom: '12px' }}>
            <small style={{ color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Multiplayer
            </small>
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: 700, color: '#E2E8F0', marginBottom: '8px' }}>
            Race with Others
          </h1>
          <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '600px' }}>
            Join a room or create your own to compete in real-time typing races
          </p>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left: Create Room */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#E2E8F0' }}>Create Room</h2>
            </div>
            
            <Card className="p-6">
              {!showCreateRoom ? (
                <Button onClick={() => setShowCreateRoom(true)} style={{ width: '100%', backgroundColor: '#2563EB', color: 'white', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                  <Plus style={{ width: '16px', height: '16px', marginRight: '8px', display: 'inline' }} />
                  Create New Room
                </Button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Input
                    placeholder="Room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    style={{ height: '40px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1E293B', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#E2E8F0' }}>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Private room
                  </label>
                  {isPrivate && (
                    <Input
                      type="password"
                      placeholder="Room password"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      style={{ height: '40px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1E293B', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                    />
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      onClick={handleCreateRoom}
                      disabled={!roomName.trim()}
                      style={{ flex: 1, backgroundColor: '#2563EB', color: 'white', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                    >
                      Create
                    </Button>
                    <Button
                      onClick={() => setShowCreateRoom(false)}
                      style={{ flex: 1, backgroundColor: '#1E293B', color: '#E2E8F0', height: '40px', border: '1px solid #1E293B', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right: Join by Code */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#E2E8F0' }}>Join by Code</h2>
            </div>
            
            <Card className="p-6">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  style={{ height: '40px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1E293B', backgroundColor: '#0F172A', color: '#E2E8F0' }}
                />
                <Button
                  onClick={handleJoinByCode}
                  disabled={!joinCode.trim()}
                  style={{ width: '100%', backgroundColor: '#2563EB', color: 'white', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                >
                  Join Room
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Available Rooms */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', marginTop: '64px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
              Available Rooms {rooms.length > 0 && `(${rooms.length})`}
            </h2>
          </div>

          {error && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
              <p style={{ color: '#EF4444', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {rooms.length === 0 ? (
            <Card className="p-8" style={{ textAlign: 'center' }}>
              <Users style={{ width: '40px', height: '40px', color: '#94A3B8', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>No rooms available</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>Create one to get started!</p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {rooms.map((room) => (
                <Card key={room.id} className="p-4" style={{ border: '1px solid #1E293B', backgroundColor: '#0F172A' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#E2E8F0' }}>{room.name}</h3>
                      <Badge variant={room.isPrivate ? 'secondary' : 'primary'} size="sm">
                        {room.isPrivate ? 'Private' : 'Public'}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#94A3B8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users style={{ width: '16px', height: '16px' }} />
                        {room.players?.length || 0}/{room.maxPlayers || 8}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ width: '16px', height: '16px' }} />
                        {formatTime(room.createdAt)}
                      </span>
                    </div>
                  </div>

                  {room.host && (
                    <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #1E293B', fontSize: '14px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Crown style={{ width: '16px', height: '16px', color: '#FBBF24' }} />
                      {room.host.username}
                    </div>
                  )}

                  <Button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={(room.players?.length || 0) >= (room.maxPlayers || 8)}
                    style={{ width: '100%', backgroundColor: '#2563EB', color: 'white', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                  >
                    <Play style={{ width: '14px', height: '14px', marginRight: '6px', display: 'inline' }} /> Join
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}