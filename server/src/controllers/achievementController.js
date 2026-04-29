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

function mapPersistedAchievement(key) {
    const catalog = {
        'wpm-50': { key: 'wpm-50', title: 'Speed Builder', description: 'Reached 50 WPM' },
        'wpm-75': { key: 'wpm-75', title: 'Fast Fingers', description: 'Reached 75 WPM' },
        'wpm-100': { key: 'wpm-100', title: 'Rocket Typist', description: 'Reached 100 WPM' },
        'wpm-150': { key: 'wpm-150', title: 'Turbo Mode', description: 'Reached 150 WPM' },
        'perfect-accuracy': { key: 'perfect-accuracy', title: 'Perfect Run', description: 'Finished with 100% accuracy' },
        'accuracy-streak-10': { key: 'accuracy-streak-10', title: 'Precision Habit', description: 'Logged 10 high-accuracy sessions' },
        'sessions-10': { key: 'sessions-10', title: 'Session Starter', description: 'Completed 10 sessions' },
        'sessions-100': { key: 'sessions-100', title: 'Century Club', description: 'Completed 100 sessions' },
        'streak-7': { key: 'streak-7', title: 'Weekly Streak', description: 'Typed 7 days in a row' },
        'streak-30': { key: 'streak-30', title: 'Monthly Streak', description: 'Typed 30 days in a row' }
    };

    return catalog[key] || { key, title: key, description: '' };
}

async function getMyAchievements(req, res) {
    const user = await User.findById(req.auth.userId).lean();
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const computed = computeAchievements(user.typingStats);
    const persisted = Array.isArray(user.achievements) ? user.achievements.map(mapPersistedAchievement) : [];
    const byKey = new Map();

    for (const achievement of [...computed, ...persisted]) {
        byKey.set(achievement.key, achievement);
    }

    return res.status(200).json({
        achievements: Array.from(byKey.values())
    });
}

module.exports = {
    getMyAchievements
};
