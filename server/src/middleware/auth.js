const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = {
            userId: payload.sub,
            email: payload.email,
            username: payload.username
        };
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired access token' });
    }
}

function socketAuth(socket, next) {
    const token = socket.handshake.auth?.token;

    if (!token) {
        socket.user = null;
        return next();
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = {
            id: payload.sub,
            email: payload.email,
            username: payload.username
        };
        return next();
    } catch (error) {
        socket.user = null;
        return next();
    }
}

module.exports = {
    requireAuth,
    socketAuth
};
