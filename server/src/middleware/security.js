const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
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

function sanitizeInput(value) {
    if (Array.isArray(value)) {
        return value.map(sanitizeInput);
    }

    if (value && typeof value === 'object') {
        const safe = {};
        for (const [key, nested] of Object.entries(value)) {
            const sanitizedKey = key.replace(/\$/g, '').replace(/\./g, '_');
            safe[sanitizedKey] = sanitizeInput(nested);
        }
        return safe;
    }

    return value;
}

function mongoLikeSanitize(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeInput(req.body);
    }

    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeInput(req.params);
    }

    if (req.query && typeof req.query === 'object') {
        const sanitizedQuery = sanitizeInput(req.query);
        Object.keys(req.query).forEach((key) => {
            if (!(key in sanitizedQuery)) {
                delete req.query[key];
            }
        });
        Object.entries(sanitizedQuery).forEach(([key, value]) => {
            req.query[key] = value;
        });
    }

    next();
}

function applySecurityMiddleware(app) {
    app.use(helmet());
    app.use(mongoLikeSanitize);
    app.use(hpp());
    app.use('/api', apiLimiter);
    app.use('/api/auth', authLimiter);
}

module.exports = {
    applySecurityMiddleware
};
