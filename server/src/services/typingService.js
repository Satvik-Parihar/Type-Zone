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

function calculateStreak(allSessions = []) {
    if (!Array.isArray(allSessions) || allSessions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    const days = [...new Set(
        allSessions.map((session) => new Date(session.createdAt).toDateString())
    )]
        .map((day) => new Date(day))
        .sort((a, b) => b - a);

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (days[0].toDateString() !== today && days[0].toDateString() !== yesterday) {
        currentStreak = 0;
    } else {
        currentStreak = 1;
        for (let i = 1; i < days.length; i += 1) {
            const diff = (days[i - 1] - days[i]) / 86400000;
            if (Math.round(diff) === 1) {
                currentStreak += 1;
            } else {
                break;
            }
        }
    }

    streak = 1;
    for (let i = 1; i < days.length; i += 1) {
        const diff = (days[i - 1] - days[i]) / 86400000;
        if (Math.round(diff) === 1) {
            streak += 1;
            longestStreak = Math.max(longestStreak, streak);
        } else {
            streak = 1;
        }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return { currentStreak, longestStreak };
}

async function checkAchievements(userId, session, allSessions) {
    const toAward = [];

    if (session.wpm >= 50) toAward.push('wpm-50');
    if (session.wpm >= 75) toAward.push('wpm-75');
    if (session.wpm >= 100) toAward.push('wpm-100');
    if (session.wpm >= 150) toAward.push('wpm-150');

    if (Number(session.accuracy) === 100) toAward.push('perfect-accuracy');
    const highAccCount = allSessions.filter((item) => Number(item.accuracy) >= 98).length;
    if (highAccCount >= 10) toAward.push('accuracy-streak-10');

    if (allSessions.length >= 10) toAward.push('sessions-10');
    if (allSessions.length >= 100) toAward.push('sessions-100');

    const { currentStreak } = calculateStreak(allSessions);
    if (currentStreak >= 7) toAward.push('streak-7');
    if (currentStreak >= 30) toAward.push('streak-30');

    const user = await User.findById(userId);
    if (!user) return [];

    const existing = new Set(user.achievements || []);
    const newOnes = toAward.filter((key) => !existing.has(key));

    if (newOnes.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $push: { achievements: { $each: newOnes } }
      });
    }

    return newOnes;
}

function getAchievementMeta(key) {
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

async function startTypingSession({ userId, mode, difficulty, wordCount, timeLimit, customText, weakKeys }) {
    return {
        textId: generateTextId(),
        text: buildTypingText(mode, { wordCount, difficulty, timeLimit, customText, weakKeys })
    };
}

async function submitTypingSession(payload) {
    const session = await TypingSession.create(payload);
    const allSessions = await TypingSession.find({ userId: payload.userId }).sort({ createdAt: -1 }).lean();

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

    const newAchievementKeys = await checkAchievements(payload.userId, payload, allSessions);
    const newAchievements = newAchievementKeys.map(getAchievementMeta);

    return { session, newAchievements };
}

module.exports = {
    startTypingSession,
    submitTypingSession,
    calculateExpectedScore,
    updateELO,
    checkAchievements,
    calculateStreak
};
