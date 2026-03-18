const User = require('../models/User');
const { calculateExpectedScore, updateELO } = require('../services/typingService');

const raceRooms = new Map();
const rankedQueue = [];
const RANK_BUCKET = 120;
const DECAY_INTERVAL_MS = 10000;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function ensureRoom(roomId, roomType = 'public') {
    if (!raceRooms.has(roomId)) {
        raceRooms.set(roomId, {
            id: roomId,
            type: roomType,
            createdAt: Date.now(),
            players: new Map(),
            spectators: new Map(),
            ghostRuns: []
        });
    }
    return raceRooms.get(roomId);
}

function buildState(room) {
    return {
        roomId: room.id,
        roomType: room.type,
        playerCount: room.players.size,
        spectatorCount: room.spectators.size,
        players: Array.from(room.players.values())
            .sort((a, b) => {
                if (a.finished && b.finished) return a.finishedAt - b.finishedAt;
                if (a.finished) return -1;
                if (b.finished) return 1;
                return b.progress - a.progress;
            }),
        spectators: Array.from(room.spectators.values()),
        ghostRuns: room.ghostRuns.slice(0, 5)
    };
}

function emitState(io, room) {
    io.to(room.id).emit('race:state', buildState(room));
}

function maybeCleanupRoom(roomId) {
    const room = raceRooms.get(roomId);
    if (!room) return;
    if (room.players.size === 0 && room.spectators.size === 0) {
        raceRooms.delete(roomId);
    }
}

function effectiveBucket(entry, now = Date.now()) {
    const waitedMs = now - entry.joinedAt;
    const expansions = Math.floor(waitedMs / DECAY_INTERVAL_MS);
    return RANK_BUCKET + (expansions * 40);
}

function isRankCompatible(a, b, now = Date.now()) {
    const distance = Math.abs((a.skill || 0) - (b.skill || 0));
    return distance <= Math.max(effectiveBucket(a, now), effectiveBucket(b, now));
}

function tryMatchRankedQueue(io) {
    if (rankedQueue.length < 2) return;

    rankedQueue.sort((a, b) => a.joinedAt - b.joinedAt);
    const now = Date.now();

    for (let i = 0; i < rankedQueue.length; i += 1) {
        const first = rankedQueue[i];

        let matchedIndex = -1;
        for (let j = i + 1; j < rankedQueue.length; j += 1) {
            const second = rankedQueue[j];
            if (isRankCompatible(first, second, now)) {
                matchedIndex = j;
                break;
            }
        }

        if (matchedIndex >= 0) {
            const second = rankedQueue[matchedIndex];
            rankedQueue.splice(matchedIndex, 1);
            rankedQueue.splice(i, 1);

            const roomId = `ranked-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
            io.to(first.socketId).emit('race:rankedMatch', { roomId, opponent: second.username });
            io.to(second.socketId).emit('race:rankedMatch', { roomId, opponent: first.username });

            io.to(first.socketId).emit('race:queueMeta', {
                skill: first.skill,
                bucket: effectiveBucket(first, now),
                decayApplied: now - first.joinedAt
            });
            io.to(second.socketId).emit('race:queueMeta', {
                skill: second.skill,
                bucket: effectiveBucket(second, now),
                decayApplied: now - second.joinedAt
            });

            return;
        }
    }
}

function setupRaceSocket(io) {
    setInterval(() => {
        tryMatchRankedQueue(io);
    }, 2000);

    io.on('connection', (socket) => {
        socket.on('race:join', ({ roomId, username, isSpectator = false, privateRoom = false, ghostRun = null, userId = null }) => {
            if (!roomId || !username) return;

            const room = ensureRoom(roomId, privateRoom ? 'private' : 'public');
            socket.join(roomId);

            if (isSpectator) {
                room.spectators.set(socket.id, { username, joinedAt: Date.now() });
                emitState(io, room);
                return;
            }

            room.players.set(socket.id, {
                socketId: socket.id,
                username,
                userId,
                progress: 0,
                finished: false,
                finishedAt: 0,
                wpm: 0,
                accuracy: 100,
                joinedAt: Date.now(),
                rank: null
            });

            if (ghostRun) {
                room.ghostRuns.unshift({
                    username: ghostRun.username || `${username}-ghost`,
                    wpm: clamp(Number(ghostRun.wpm) || 0, 0, 400),
                    recordedAt: Date.now()
                });
            }

            emitState(io, room);
        });

        socket.on('race:queueRanked', ({ username, skill = 0, userId = null }) => {
            if (!username) return;

            const existingIndex = rankedQueue.findIndex((item) => item.socketId === socket.id);
            if (existingIndex >= 0) {
                rankedQueue.splice(existingIndex, 1);
            }

            rankedQueue.push({
                socketId: socket.id,
                username,
                userId,
                skill: clamp(Number(skill) || 0, 0, 400),
                joinedAt: Date.now()
            });

            tryMatchRankedQueue(io);
        });

        socket.on('race:leaveQueue', () => {
            const index = rankedQueue.findIndex((item) => item.socketId === socket.id);
            if (index >= 0) {
                rankedQueue.splice(index, 1);
            }
        });

        socket.on('race:progress', ({ roomId, progress, wpm, accuracy }) => {
            const room = raceRooms.get(roomId);
            if (!room) return;

            const player = room.players.get(socket.id);
            if (!player) return;

            player.progress = clamp(Number(progress) || 0, 0, 100);
            player.wpm = clamp(Number(wpm) || 0, 0, 400);
            player.accuracy = clamp(Number(accuracy) || 0, 0, 100);

            emitState(io, room);
        });

        socket.on('race:ghost', ({ roomId, progress, wpm }) => {
            const room = raceRooms.get(roomId);
            if (!room) return;

            io.to(roomId).emit('race:ghostProgress', {
                socketId: socket.id,
                progress: clamp(Number(progress) || 0, 0, 100),
                wpm: clamp(Number(wpm) || 0, 0, 400)
            });
        });

        socket.on('race:finish', async ({ roomId, wpm, accuracy }) => {
            const room = raceRooms.get(roomId);
            if (!room) return;

            const player = room.players.get(socket.id);
            if (!player || player.finished) return;

            player.finished = true;
            player.progress = 100;
            player.wpm = clamp(Number(wpm) || 0, 0, 400);
            player.accuracy = clamp(Number(accuracy) || 0, 0, 100);
            player.finishedAt = Date.now();

            // Only rank players who finished
            const finishedPlayers = Array.from(room.players.values()).filter((p) => p.finished);
            const sorted = finishedPlayers.sort((a, b) => {
                if (a.finishedAt === b.finishedAt) return b.wpm - a.wpm;
                return a.finishedAt - b.finishedAt;
            });

            sorted.forEach((entry, index) => {
                entry.rank = index + 1;
            });

            const winner = sorted[0];
            if (winner) {
                io.to(roomId).emit('race:finished', {
                    winner: winner.username,
                    wpm: winner.wpm,
                    accuracy: winner.accuracy,
                    rank: winner.rank
                });
            }

            // Update ELO for ranked races if both players have userId and both finished
            if (sorted.length >= 2 && sorted[0].userId && sorted[1].userId) {
                try {
                    const p1 = sorted[0];
                    const p2 = sorted[1];

                    const [user1, user2] = await Promise.all([
                        User.findById(p1.userId),
                        User.findById(p2.userId)
                    ]);

                    if (user1 && user2) {
                        const r1 = user1.typingStats.rankedRating || 1000;
                        const r2 = user2.typingStats.rankedRating || 1000;

                        const expected1 = calculateExpectedScore(r1, r2);
                        const expected2 = calculateExpectedScore(r2, r1);

                        const actual1 = p1.rank === 1 ? 1 : 0;
                        const actual2 = p2.rank === 1 ? 1 : 0;

                        user1.typingStats.rankedRating = updateELO(r1, expected1, actual1);
                        user1.typingStats.ratingLastUpdatedAt = new Date();

                        user2.typingStats.rankedRating = updateELO(r2, expected2, actual2);
                        user2.typingStats.ratingLastUpdatedAt = new Date();

                        await Promise.all([user1.save(), user2.save()]);

                        io.to(roomId).emit('race:ratingUpdated', {
                            messages: [
                                `${p1.username}: ${r1} → ${user1.typingStats.rankedRating}`,
                                `${p2.username}: ${r2} → ${user2.typingStats.rankedRating}`
                            ]
                        });
                    }
                } catch (error) {
                    console.error('Error updating ELO ratings:', error);
                }
            }

            emitState(io, room);
        });

        socket.on('race:spectate', ({ roomId, username }) => {
            if (!roomId || !username) return;

            const room = ensureRoom(roomId, 'public');
            socket.join(roomId);
            room.spectators.set(socket.id, { username, joinedAt: Date.now() });
            emitState(io, room);
        });

        socket.on('disconnect', () => {
            const queueIndex = rankedQueue.findIndex((item) => item.socketId === socket.id);
            if (queueIndex >= 0) {
                rankedQueue.splice(queueIndex, 1);
            }

            for (const [roomId, room] of raceRooms.entries()) {
                const removedPlayer = room.players.delete(socket.id);
                const removedSpectator = room.spectators.delete(socket.id);

                if (removedPlayer || removedSpectator) {
                    if (room.players.size > 0 || room.spectators.size > 0) {
                        emitState(io, room);
                    }
                    maybeCleanupRoom(roomId);
                }
            }
        });
    });
}

module.exports = {
    setupRaceSocket
};
