require('dotenv').config();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const { connectDb } = require('./config/db');
const { getCorsOptions } = require('./config/cors');
const setupRaceSocket = require('./sockets/raceSocket');

const PORT = process.env.PORT || 5000;

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
