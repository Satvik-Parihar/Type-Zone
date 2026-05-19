import io from 'socket.io-client';

let socket = null;

export function initializeSocket(token) {
    if (socket) {
        return socket;
    }

    const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    socket = io(SERVER_URL, {
        auth: {
            token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    socket.on('connect', () => {
        // Socket connected
    });

    socket.on('disconnect', () => {
        // Socket disconnected
    });

    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

// Room management events
export const roomEvents = {
    GET_ROOMS: 'rooms:get',
    ROOMS_LIST: 'rooms:list',
    CREATE_ROOM: 'room:create',
    ROOM_CREATED: 'room:created',
    JOIN_ROOM: 'room:join',
    ROOM_JOINED: 'room:joined',
    LEAVE_ROOM: 'room:leave',
    ROOM_LEFT: 'room:left',
    ROOM_UPDATED: 'room:updated',
    ERROR: 'error'
};

// Player events
export const playerEvents = {
    READY: 'player:ready',
    UPDATE_PROGRESS: 'race:progress'
};

// Race events
export const raceEvents = {
    START_RACE: 'race:start',
    RACE_COUNTDOWN: 'race:countdown',
    RACE_STARTED: 'race:started',
    JOIN_RACE: 'race:join',
    RACE_JOINED: 'race:joined',
    RACE_PROGRESS: 'race:progress',
    RACE_UPDATE: 'race:update',
    RACE_FINISHED: 'race:finished'
};
