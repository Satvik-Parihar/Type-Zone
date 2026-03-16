const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false
});

function applySecurityMiddleware(app) {
    app.use(helmet());
    app.use(mongoSanitize());
    app.use(hpp());
    app.use('/api', apiLimiter);
    app.use('/api/auth', authLimiter);
}

module.exports = {
    applySecurityMiddleware
};
