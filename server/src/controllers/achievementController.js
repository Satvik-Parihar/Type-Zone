const User = require('../models/User');

function computeAchievements(stats) {
    const achievements = [];

    if (stats.testsCompleted >= 1) {
        achievements.push({ key: 'first-run', title: 'First Run', description: 'Completed your first typing session' });
    }
    if (stats.bestWpm >= 60) {
        achievements.push({ key: 'speed-60', title: 'Speedster', description: 'Reached 60 WPM' });
    }
    if (stats.bestWpm >= 100) {
        achievements.push({ key: 'speed-100', title: 'Rocket Typist', description: 'Reached 100 WPM' });
    }
    if (stats.averageAccuracy >= 95 && stats.testsCompleted >= 10) {
        achievements.push({ key: 'precision-pro', title: 'Precision Pro', description: 'Maintained 95%+ average accuracy for 10 runs' });
    }
    if (stats.streakDays >= 7) {
        achievements.push({ key: 'streak-7', title: 'Weekly Streak', description: 'Practiced for 7 consecutive days' });
    }

    return achievements;
}

async function getMyAchievements(req, res) {
    const user = await User.findById(req.auth.userId).lean();
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
        achievements: computeAchievements(user.typingStats)
    });
}

module.exports = {
    getMyAchievements
};
