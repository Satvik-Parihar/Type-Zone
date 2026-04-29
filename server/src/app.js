const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const { xss } = require('express-xss-sanitizer');
const { getCorsOptions } = require('./config/cors');
const { applySecurityMiddleware } = require('./middleware/security');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const typingRoutes = require('./routes/typingRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const historyRoutes = require('./routes/historyRoutes');
const raceHistoryRoutes = require('./routes/raceHistoryRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');

const app = express();

app.use(cors(getCorsOptions()));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(xss());

applySecurityMiddleware(app);

app.get('/api/health', (req, res) => {
    res.status(200).json({ ok: true, service: 'typezone-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/typing', typingRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/history/races', raceHistoryRoutes);
app.use('/api/tournaments', tournamentRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(clientBuildPath));
    
    // SPA fallback
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API route not found' });
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
