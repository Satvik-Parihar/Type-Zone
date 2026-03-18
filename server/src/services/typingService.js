const crypto = require('crypto');
const TypingSession = require('../models/TypingSession');
const TypingHistory = require('../models/TypingHistory');
const User = require('../models/User');
const { buildTypingText } = require('../utils/textPool');
const { syncLeaderboardForUser } = require('./leaderboardService');

const K_FACTOR = 32;

function generateTextId() {
    return crypto.randomBytes(8).toString('hex');
}

function calculateExpectedScore(rating1, rating2) {
    return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
}

function updateELO(currentRating, expectedScore, actualScore, kFactor = K_FACTOR) {
    return Math.round(currentRating + kFactor * (actualScore - expectedScore));
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

function buildMistakeFrequency(keystrokeTimeline = [], keyMistakes = {}) {
    const next = {};

    for (const [key, count] of Object.entries(keyMistakes || {})) {
        next[key] = (next[key] || 0) + count;
    }

    for (const stroke of keystrokeTimeline) {
        if (!stroke.isError) continue;
        const key = String(stroke.expectedKey || stroke.key || '?').toLowerCase();
        next[key] = (next[key] || 0) + 1;
    }

    return next;
}

async function startTypingSession({ userId, mode, difficulty, wordCount, timeLimit, customText, weakKeys }) {
    return {
        textId: generateTextId(),
        text: buildTypingText(mode, { wordCount, difficulty, timeLimit, customText, weakKeys })
    };
}

async function submitTypingSession(payload) {
    const session = await TypingSession.create(payload);

    const keystrokeTimeline = payload.keystrokeTimeline || [];
    const keystrokeTimings = keystrokeTimeline
        .map((stroke) => stroke.deltaMs || 0)
        .filter((delta) => delta > 0);
    const mistakeFrequency = buildMistakeFrequency(keystrokeTimeline, payload.keyMistakes);

    await TypingHistory.create({
        userId: payload.userId,
        sessionId: session._id,
        dailyChallenge: false,
        heatmap: Object.values(mistakeFrequency),
        wpmHistory: [payload.wpm],
        accuracyHistory: [payload.accuracy],
        sessionDuration: payload.timeTaken,
        mistakeFrequency,
        correctionPatterns: payload.correctionPatterns || {
            backspaceCorrections: 0,
            replacedErrors: 0
        },
        keystrokeTimings,
        keystrokeCount: keystrokeTimeline.length
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
    const sessionXp = Math.round((payload.wpm * 1.5) + (payload.accuracy * 0.8) + (payload.consistency || 0));
    user.typingStats.xp = (user.typingStats.xp || 0) + sessionXp;
    user.typingStats.level = Math.max(1, Math.floor(user.typingStats.xp / 400) + 1);

    await user.save();
    await syncLeaderboardForUser(user);

    return session;
}

module.exports = {
    startTypingSession,
    submitTypingSession,
    calculateExpectedScore,
    updateELO
};
