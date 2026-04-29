const TypingSession = require('../models/TypingSession');

function getSinceByMode(mode) {
    const now = new Date();
    if (mode === 'week') {
        const d = new Date(now);
        d.setDate(now.getDate() - 7);
        return d;
    }
    if (mode === 'month') {
        const d = new Date(now);
        d.setMonth(now.getMonth() - 1);
        return d;
    }
    return null;
}

async function getLeaderboard(req, res) {
    const { mode = 'alltime', limit = 50 } = req.query;
    const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));

    const since = getSinceByMode(mode);
    const matchStage = since ? { createdAt: { $gte: since } } : {};

    const leaders = await TypingSession.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$userId',
                bestWpm: { $max: '$wpm' },
                avgAccuracy: { $avg: '$accuracy' },
                totalTests: { $sum: 1 },
                lastActive: { $max: '$createdAt' }
            }
        },
        { $sort: { bestWpm: -1, avgAccuracy: -1 } },
        { $limit: parsedLimit },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $project: {
                _id: 0,
                userId: '$_id',
                username: '$user.username',
                bestWpm: 1,
                avgAccuracy: 1,
                totalTests: 1,
                lastActive: 1
            }
        }
    ]);

    const formatted = leaders.map((leader) => ({
        ...leader,
        avgAccuracy: Math.round(Number(leader.avgAccuracy) || 0)
    }));

    res.status(200).json({ leaders: formatted });
}

module.exports = { getLeaderboard };
