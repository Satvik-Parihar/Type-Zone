const { getGlobalLeaderboard } = require('../services/leaderboardService');

async function getLeaderboard(req, res) {
    const leaderboard = await getGlobalLeaderboard(30);
    res.status(200).json({ leaderboard });
}

module.exports = {
    getLeaderboard
};
