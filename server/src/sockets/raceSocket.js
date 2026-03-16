const raceRooms = new Map();

function setupRaceSocket(io) {
    io.on('connection', (socket) => {
        socket.on('race:join', ({ roomId, username }) => {
            if (!roomId || !username) return;
            socket.join(roomId);

            if (!raceRooms.has(roomId)) {
                raceRooms.set(roomId, new Map());
            }
            raceRooms.get(roomId).set(socket.id, {
                username,
                progress: 0,
                finished: false,
                wpm: 0
            });

            io.to(roomId).emit('race:state', Array.from(raceRooms.get(roomId).values()));
        });

        socket.on('race:progress', ({ roomId, progress, wpm }) => {
            if (!raceRooms.has(roomId)) return;
            const player = raceRooms.get(roomId).get(socket.id);
            if (!player) return;
            const nextProgress = Number.isFinite(progress) ? progress : Number(progress);
            const nextWpm = Number.isFinite(wpm) ? wpm : Number(wpm);
            player.progress = Math.min(100, Math.max(0, Number.isFinite(nextProgress) ? nextProgress : 0));
            player.wpm = Math.max(0, Number.isFinite(nextWpm) ? nextWpm : 0);
            io.to(roomId).emit('race:state', Array.from(raceRooms.get(roomId).values()));
        });

        socket.on('race:finish', ({ roomId, wpm }) => {
            if (!raceRooms.has(roomId)) return;
            const player = raceRooms.get(roomId).get(socket.id);
            if (!player) return;
            if (player.finished) return;
            player.finished = true;
            player.progress = 100;
            const nextWpm = Number.isFinite(wpm) ? wpm : Number(wpm);
            player.wpm = Math.max(0, Number.isFinite(nextWpm) ? nextWpm : 0);
            io.to(roomId).emit('race:finished', {
                winner: player.username,
                wpm: player.wpm
            });
            io.to(roomId).emit('race:state', Array.from(raceRooms.get(roomId).values()));
        });

        socket.on('disconnect', () => {
            for (const [roomId, players] of raceRooms.entries()) {
                if (players.delete(socket.id)) {
                    if (players.size === 0) {
                        raceRooms.delete(roomId);
                    } else {
                        io.to(roomId).emit('race:state', Array.from(players.values()));
                    }
                }
            }
        });
    });
}

module.exports = {
    setupRaceSocket
};
