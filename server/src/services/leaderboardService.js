const Leaderboard = require('../models/Leaderboard');

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
}

async function getGlobalLeaderboard(limit = 20) {
    return Leaderboard.find({})
        .sort({ bestWpm: -1, averageAccuracy: -1 })
        .limit(limit)
        .lean();
}

module.exports = {
    syncLeaderboardForUser,
    getGlobalLeaderboard
};
