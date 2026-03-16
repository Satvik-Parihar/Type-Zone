const crypto = require('crypto');
const TypingSession = require('../models/TypingSession');
const TypingHistory = require('../models/TypingHistory');
const User = require('../models/User');
const { buildTypingText } = require('../utils/textPool');
const { syncLeaderboardForUser } = require('./leaderboardService');

function generateTextId() {
    return crypto.randomBytes(8).toString('hex');
}

function nextStreak(lastPracticeDate) {
    if (!lastPracticeDate) return 1;
    const previous = new Date(lastPracticeDate);
    const now = new Date();

    previous.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((now - previous) / (1000 * 60 * 60 * 24));
    if (dayDiff === 0) return null;
    if (dayDiff === 1) return 'increment';
    return 'reset';
}

async function startTypingSession({ userId, mode, wordCount }) {
    return {
        textId: generateTextId(),
        text: buildTypingText(mode, { wordCount })
    };
}

async function submitTypingSession(payload) {
    const session = await TypingSession.create(payload);

    await TypingHistory.create({
        userId: payload.userId,
        sessionId: session._id,
        dailyChallenge: false,
        heatmap: []
    });

    const user = await User.findById(payload.userId);
    if (!user) return session;

    const previousCount = user.typingStats.testsCompleted;
    user.typingStats.testsCompleted += 1;
    user.typingStats.bestWpm = Math.max(user.typingStats.bestWpm, payload.wpm);
    user.typingStats.averageWpm = Math.round(
        (user.typingStats.averageWpm * previousCount + payload.wpm) / user.typingStats.testsCompleted
    );
    user.typingStats.averageAccuracy = Math.round(
        (user.typingStats.averageAccuracy * previousCount + payload.accuracy) / user.typingStats.testsCompleted
    );

    const streakDecision = nextStreak(user.typingStats.lastPracticeDate);
    if (streakDecision === 'increment') {
        user.typingStats.streakDays += 1;
    } else if (streakDecision === 'reset') {
        user.typingStats.streakDays = 1;
    }
    user.typingStats.lastPracticeDate = new Date();

    await user.save();
    await syncLeaderboardForUser(user);

    return session;
}

module.exports = {
    startTypingSession,
    submitTypingSession
};
