const RaceHistory = require('../models/RaceHistory');

const rooms = new Map();
const activeRaces = new Map();

function serializeRoom(room) {
  if (!room) return null;

  return {
    id: room.id,
    name: room.name,
    host: room.host,
    isPrivate: room.isPrivate,
    maxPlayers: room.maxPlayers,
    createdAt: room.createdAt,
    status: room.status,
    players: Array.from(room.players.values())
  };
}

function serializeRoomListItem(room) {
  return {
    id: room.id,
    name: room.name,
    host: {
      id: room.host.id,
      username: room.host.username
    },
    players: Array.from(room.players.values()).map((p) => ({
      id: p.id,
      username: p.username
    })),
    maxPlayers: room.maxPlayers,
    createdAt: room.createdAt,
    isPrivate: room.isPrivate
  };
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function createRoom(name, host, isPrivate = false, password = null) {
  const roomId = generateRoomId();
  const room = {
    id: roomId,
    name,
    host,
    isPrivate,
    password,
    players: new Map(),
    maxPlayers: 8,
    createdAt: new Date(),
    status: 'waiting' // waiting, starting, active, finished
  };

  // Add host as first player
  room.players.set(host.id, {
    id: host.id,
    username: host.username,
    ready: false,
    joinedAt: new Date(),
    wpm: 0,
    accuracy: 0,
    progress: 0,
    finished: false,
    finishTime: null
  });

  rooms.set(roomId, room);
  return room;
}

function getPublicRooms() {
  return Array.from(rooms.values())
    .filter(room => !room.isPrivate)
    .map((room) => serializeRoomListItem(room));
}

function startRaceCountdown(io, roomId) {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'waiting') return;

  room.status = 'starting';

  let countdown = 3;
  const countdownInterval = setInterval(() => {
    io.to(roomId).emit('race:countdown', countdown);

    if (countdown === 0) {
      clearInterval(countdownInterval);
      startRace(io, roomId);
    }
    countdown--;
  }, 1000);
}

function startRace(io, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = 'active';
  room.startTime = Date.now();

  // Generate race text (simplified)
  const raceText = "The quick brown fox jumps over the lazy dog. This is a sample typing race text that participants will type as fast and accurately as possible.";

  const raceData = {
    roomId,
    text: raceText,
    startTime: room.startTime,
    players: Array.from(room.players.values())
  };

  activeRaces.set(roomId, raceData);

  io.to(roomId).emit('race:started', raceData);
}

function updatePlayerProgress(io, roomId, playerId, progress, wpm, accuracy) {
  const room = rooms.get(roomId);
  if (!room || room.status !== 'active') return;

  const player = room.players.get(playerId);
  if (!player) return;

  player.progress = progress;
  player.wpm = wpm;
  player.accuracy = accuracy;

  // Check if player finished
  if (progress >= 100 && !player.finished) {
    player.finished = true;
    player.finishTime = (Date.now() - room.startTime) / 1000;

    // Check if all players finished
    const activePlayers = Array.from(room.players.values()).filter(p => !p.finished);
    if (activePlayers.length === 0) {
      const result = finishRace(roomId);
      if (result) {
        io.to(roomId).emit('race:finished', result);
        io.to(roomId).emit('room:updated', serializeRoom(room));
      }
    }
  }

  // Broadcast progress update
  const raceData = activeRaces.get(roomId);
  if (raceData) {
    raceData.players = Array.from(room.players.values());
  }
}

function finishRace(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = 'finished';

  const finishedPlayers = Array.from(room.players.values())
    .filter(p => p.finished)
    .sort((a, b) => a.finishTime - b.finishTime);

  const winner = finishedPlayers[0];

  const raceResult = {
    roomId,
    winner,
    players: finishedPlayers,
    finishedAt: new Date()
  };

  RaceHistory.insertMany(
    finishedPlayers.map((player, index) => ({
      userId: player.id,
      roomId: room.id,
      roomName: room.name,
      placement: index + 1,
      participants: room.players.size,
      wpm: Number(player.wpm) || 0,
      accuracy: Number(player.accuracy) || 0,
      finishTime: Number(player.finishTime) || 0,
      isWinner: index === 0,
      raceTextSnippet: activeRaces.get(roomId)?.text?.slice(0, 160) || '',
      finishedAt: new Date()
    }))
  ).catch((error) => {
    console.error('Failed to persist race history:', error);
  });

  // Clean up
  activeRaces.delete(roomId);
  // Keep room for a few minutes before cleanup
  setTimeout(() => {
    rooms.delete(roomId);
  }, 5 * 60 * 1000); // 5 minutes

  return raceResult;
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Get rooms list
    socket.on('rooms:get', () => {
      const publicRooms = getPublicRooms();
      socket.emit('rooms:list', publicRooms);
    });

    // Create room
    socket.on('room:create', (data) => {
      const { name, password, isPrivate } = data;
      const user = socket.user; // Assume user is attached to socket

      if (!user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const room = createRoom(name, user, isPrivate, password);
      socket.join(room.id);
      socket.emit('room:created', serializeRoom(room));
      io.emit('rooms:list', getPublicRooms()); // Update all clients
    });

    // Join room
    socket.on('room:join', (data) => {
      const { roomId, password } = data;
      const user = socket.user;

      if (!user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.isPrivate && room.password !== password) {
        socket.emit('error', { message: 'Invalid password' });
        return;
      }

      if (room.players.size >= room.maxPlayers) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      if (room.players.has(user.id)) {
        socket.join(roomId);
        socket.emit('room:joined', serializeRoom(room));
        return;
      }

      // Add player to room
      room.players.set(user.id, {
        id: user.id,
        username: user.username,
        ready: false,
        joinedAt: new Date(),
        wpm: 0,
        accuracy: 0,
        progress: 0,
        finished: false,
        finishTime: null
      });

      socket.join(roomId);
      socket.emit('room:joined', serializeRoom(room));

      // Notify other players
      socket.to(roomId).emit('room:updated', serializeRoom(room));
      io.emit('rooms:list', getPublicRooms());
    });

    // Leave room
    socket.on('room:leave', () => {
      const user = socket.user;
      if (!user) return;

      // Find room containing this user
      for (const [roomId, room] of rooms) {
        if (room.players.has(user.id)) {
          room.players.delete(user.id);

          // If room is empty, delete it
          if (room.players.size === 0) {
            rooms.delete(roomId);
            io.emit('rooms:list', getPublicRooms());
          } else {
            // If host left, assign new host
            if (room.host.id === user.id) {
              const remainingPlayers = Array.from(room.players.values());
              room.host = remainingPlayers[0];
            }

            io.to(roomId).emit('room:updated', serializeRoom(room));
            io.emit('rooms:list', getPublicRooms());
          }

          socket.emit('room:left');
          break;
        }
      }
    });

    // Player ready toggle
    socket.on('player:ready', (data) => {
      const { roomId, ready } = data;
      const user = socket.user;

      if (!user) return;

      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.get(user.id);
      if (!player) return;

      player.ready = ready;
      io.to(roomId).emit('room:updated', serializeRoom(room));
    });

    // Start race
    socket.on('race:start', (data) => {
      const { roomId } = data;
      const user = socket.user;

      if (!user) return;

      const room = rooms.get(roomId);
      if (!room || room.host.id !== user.id) return;

      // Check if all players are ready
      const allReady = Array.from(room.players.values()).every(p => p.ready);
      if (!allReady || room.players.size < 2) return;

      startRaceCountdown(io, roomId);
    });

    // Join race
    socket.on('race:join', (data) => {
      const { roomId } = data;
      const user = socket.user;

      if (!user) return;

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      socket.join(roomId);
      socket.emit('race:joined', {
        roomId,
        text: activeRaces.get(roomId)?.text || '',
        startTime: room.startTime,
        players: Array.from(room.players.values())
      });
    });

    // Update progress
    socket.on('race:progress', (data) => {
      const { roomId, progress, wpm, accuracy } = data;
      const user = socket.user;

      if (!user) return;

      updatePlayerProgress(io, roomId, user.id, progress, wpm, accuracy);

      const raceData = activeRaces.get(roomId);
      if (raceData) {
        io.to(roomId).emit('race:update', raceData);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Handle disconnection (similar to leave room)
    });
  });
};