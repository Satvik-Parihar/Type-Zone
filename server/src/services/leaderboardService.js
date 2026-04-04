const Leaderboard = require('../models/Leaderboard');

const LEADERBOARD_TTL_MS = 15000;
const cache = {
    value: null,
    expiresAt: 0
};

function invalidateLeaderboardCache() {
    cache.value = null;
    cache.expiresAt = 0;
}

async function syncLeaderboardForUser(user) {
    await Leaderboard.findOneAndUpdate(
        { userId: user._id },
        {
            userId: user._id,
            username: user.username,
            bestWpm: user.typingStats.bestWpm,
            averageWpm: user.typingStats.averageWpm,
            averageAccuracy: user.typingStats.averageAccuracy
        },
        { upsert: true, new: true }
    );

    invalidateLeaderboardCache();
}

async function getGlobalLeaderboard(limit = 20) {
    const now = Date.now();
    if (cache.value && cache.expiresAt > now && cache.value.limit === limit) {
        return cache.value.items;
    }

    const items = await Leaderboard.find({})
        .sort({ bestWpm: -1, averageAccuracy: -1 })
        .limit(limit)
        .lean();

    cache.value = { limit, items };
    cache.expiresAt = now + LEADERBOARD_TTL_MS;

    return items;
}

module.exports = {
    syncLeaderboardForUser,
    getGlobalLeaderboard,
    invalidateLeaderboardCache
};
