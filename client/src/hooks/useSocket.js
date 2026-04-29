import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { initializeSocket, getSocket } from '../services/socketService';

export function useSocket() {
    const socket = useRef(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) {
            socket.current = null;
            return;
        }

        socket.current = initializeSocket(token);

        return () => {
            // Keep socket alive while authenticated.
        };
    }, [token]);

    return socket.current || getSocket();
}

export function useSocketEvent(event, callback) {
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on(event, callback);

        return () => {
            socket.off(event, callback);
        };
    }, [socket, event, callback]);
}

export function useSocketEmit() {
    const socket = useSocket();

    return (event, data) => {
        if (socket) {
            socket.emit(event, data);
        }
    };
}
