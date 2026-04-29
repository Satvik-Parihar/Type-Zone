require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { connectDb } = require('./config/db');
const { getCorsOptions } = require('./config/cors');
const setupRaceSocket = require('./sockets/raceSocket');

const PORT = process.env.PORT || 5000;

// Socket.io auth middleware
function socketAuthMiddleware(socket, next) {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.slice(7);

    if (!token) {
        return next(new Error('Authentication required'));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = {
            id: payload.sub,
            email: payload.email,
            username: payload.username
        };
        next();
    } catch (error) {
        next(new Error('Invalid or expired token'));
    }
}

async function start() {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        await connectDb();

        const server = http.createServer(app);
        const io = new Server(server, {
            cors: getCorsOptions()
        });

        // Apply auth middleware to socket connections
        io.use(socketAuthMiddleware);

        setupRaceSocket(io);

        server.listen(PORT, '127.0.0.1', () => {
            console.log(`TypeZone API running on http://localhost:${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please close other instances or change PORT env var.`);
            } else {
                console.error('Server error:', err);
            }
            process.exit(1);
        });
    } catch (error) {
        console.error('Failed to start API:', error.message);
        process.exit(1);
    }
}

start();
