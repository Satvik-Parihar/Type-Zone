const { z } = require('zod');
const TypingSession = require('../models/TypingSession');
const { startTypingSession, submitTypingSession, calculateStreak } = require('../services/typingService');

const MODE_ENUM = ['words', 'quote', 'time', 'numbers', 'code', 'punctuation', 'sentence', 'paragraph', 'zen', 'practice', 'challenge', 'custom'];
const DIFFICULTY_ENUM = ['easy', 'medium', 'hard', 'expert'];

const startSchema = z.object({
    mode: z.enum(MODE_ENUM),
    difficulty: z.enum(DIFFICULTY_ENUM).optional().default('medium'),
    timeLimit: z.number().int().min(15).max(300).optional().default(60),
    wordCount: z.number().int().min(10).max(400).optional().default(25),
    customText: z.string().max(2500).optional().default(''),
    weakKeys: z.array(z.string().min(1).max(3)).optional().default([])
});

const submitSchema = z.object({
    textId: z.string().min(1),
    mode: z.enum(MODE_ENUM),
    wpm: z.number().min(0),
    rawWpm: z.number().min(0).optional().default(0),
    accuracy: z.number().min(0).max(100),
    errorCount: z.number().int().min(0),
    consistency: z.number().min(0).max(100).optional().default(100),
    keystrokesPerSecond: z.number().min(0).optional().default(0),
    timeTaken: z.number().int().min(1),
    rawInput: z.string().optional().default(''),
    keystrokeTimeline: z.array(
        z.object({
            key: z.string().min(1).max(20),
            expectedKey: z.string().max(20).optional().default(''),
            timestamp: z.number().min(0),
            deltaMs: z.number().min(0).optional().default(0),
            position: z.number().int().min(0).optional().default(0),
            isError: z.boolean().optional().default(false),
            isCorrection: z.boolean().optional().default(false)
        })
    ).max(5000).optional().default([]),
    correctionPatterns: z.object({
        backspaceCorrections: z.number().int().min(0).optional().default(0),
        replacedErrors: z.number().int().min(0).optional().default(0)
    }).optional().default({
        backspaceCorrections: 0,
        replacedErrors: 0
    }),
    keyMistakes: z.record(z.string(), z.number().int().min(0)).optional().default({})
});

async function start(req, res) {
    const result = await startTypingSession({
        userId: req.auth.userId,
        mode: req.body.mode,
        difficulty: req.body.difficulty,
        timeLimit: req.body.timeLimit,
        wordCount: req.body.wordCount,
        customText: req.body.customText,
        weakKeys: req.body.weakKeys
    });

    res.status(200).json(result);
}

async function submit(req, res) {
    const result = await submitTypingSession({
        userId: req.auth.userId,
        ...req.body
    });

    res.status(201).json({
        id: result.session._id,
        newAchievements: result.newAchievements || []
    });
}

async function history(req, res) {
    const history = await TypingSession.find({ userId: req.auth.userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    res.status(200).json({ history });
}

async function analytics(req, res) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const sessions = await TypingSession.find({
        userId: req.auth.userId,
        createdAt: { $gte: since }
    })
        .sort({ createdAt: 1 })
        .lean();

    const groupedByDay = new Map();
    for (const session of sessions) {
        const key = new Date(session.createdAt).toISOString().slice(0, 10);
        if (!groupedByDay.has(key)) {
            groupedByDay.set(key, {
                day: key,
                totalWpm: 0,
                totalAccuracy: 0,
                totalConsistency: 0,
                tests: 0,
                bestWpm: 0
            });
        }

        const day = groupedByDay.get(key);
        day.tests += 1;
        day.totalWpm += session.wpm;
        day.totalAccuracy += session.accuracy;
        day.totalConsistency += session.consistency || 0;
        day.bestWpm = Math.max(day.bestWpm, session.wpm);
    }

    const dailyPerformance = Array.from(groupedByDay.values()).map((day) => ({
        day: day.day,
        tests: day.tests,
        averageWpm: Math.round(day.totalWpm / day.tests),
        averageAccuracy: Math.round(day.totalAccuracy / day.tests),
        averageConsistency: Math.round(day.totalConsistency / day.tests),
        bestWpm: day.bestWpm
    }));

    const personalBest = sessions.reduce((best, session) => Math.max(best, session.wpm), 0);
    const weeklyWindow = sessions.slice(-7);
    const weeklyAverage = weeklyWindow.length === 0
        ? 0
        : Math.round(weeklyWindow.reduce((sum, item) => sum + item.wpm, 0) / weeklyWindow.length);

    res.status(200).json({
        analytics: {
            dailyPerformance,
            weeklyAverage,
            personalBest,
            accuracyTrend: sessions.map((session) => ({
                at: session.createdAt,
                accuracy: session.accuracy
            })),
            consistencyTrend: sessions.map((session) => ({
                at: session.createdAt,
                consistency: session.consistency || 0
            }))
        }
    });
}

async function getGlobalStats(req, res) {
    try {
        const User = require('../models/User');
        
        // Total sessions
        const totalSessions = await TypingSession.countDocuments();
        
        // Total unique users
        const totalUsers = await User.countDocuments();
        
        // Active users in last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const activeUsers = await TypingSession.distinct('userId', {
            createdAt: { $gte: fiveMinutesAgo }
        }).then(ids => ids.length);
        
        // Top WPM in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const topWpm24h = await TypingSession.findOne({
            createdAt: { $gte: oneDayAgo }
        })
            .sort({ wpm: -1 })
            .select('wpm')
            .lean();
        
        // Average WPM across all sessions
        const avgWpmResult = await TypingSession.aggregate([
            { $group: { _id: null, avgWpm: { $avg: '$wpm' } } }
        ]);
        const avgWpm = avgWpmResult.length > 0 ? Math.round(avgWpmResult[0].avgWpm) : 0;
        
        // Return stats only if we have real data, otherwise return zeros
        res.status(200).json({
            totalSessions: totalSessions || 0,
            totalUsers: totalUsers || 0,
            activeUsers: activeUsers || 0,
            topWpm24h: topWpm24h?.wpm || 0,
            avgWpm: avgWpm || 0
        });
    } catch (error) {
        res.status(200).json({
            totalSessions: 0,
            totalUsers: 0,
            activeUsers: 0,
            topWpm24h: 0,
            avgWpm: 0
        });
    }
}

async function saveSession(req, res) {
    const payload = {
        userId: req.auth.userId,
        textId: req.body.textId || 'manual',
        mode: req.body.mode || 'time',
        wpm: Number(req.body.wpm) || 0,
        accuracy: Number(req.body.accuracy) || 0,
        errorCount: Number(req.body.errorCount ?? req.body.errors ?? 0) || 0,
        rawWpm: Number(req.body.rawWpm) || 0,
        consistency: Number(req.body.consistency ?? 100) || 100,
        keystrokesPerSecond: Number(req.body.keystrokesPerSecond) || 0,
        timeTaken: Math.max(1, Number(req.body.timeTaken ?? req.body.time ?? 1) || 1),
        rawInput: req.body.rawInput || '',
        keystrokeTimeline: Array.isArray(req.body.keystrokeTimeline) ? req.body.keystrokeTimeline : [],
        wpmHistory: Array.isArray(req.body.wpmHistory) ? req.body.wpmHistory.map((v) => Number(v) || 0) : [],
        keyAccuracy: req.body.keyAccuracy && typeof req.body.keyAccuracy === 'object' ? req.body.keyAccuracy : {}
    };

    const result = await submitTypingSession(payload);
    res.status(201).json({
        id: result.session._id,
        newAchievements: result.newAchievements || []
    });
}

async function getSessions(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
        TypingSession.find({ userId: req.auth.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        TypingSession.countDocuments({ userId: req.auth.userId })
    ]);

    res.status(200).json({
        sessions,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
}

async function getProfileStats(req, res) {
    const sessions = await TypingSession.find({ userId: req.auth.userId })
        .sort({ createdAt: -1 })
        .lean();

    if (sessions.length === 0) {
        return res.status(200).json({
            bestWpm: 0,
            avgWpm: 0,
            totalTests: 0,
            totalTimeMs: 0,
            currentStreak: 0,
            longestStreak: 0,
            achievements: [],
            weakKeys: []
        });
    }

    const bestWpm = sessions.reduce((best, session) => Math.max(best, Number(session.wpm) || 0), 0);
    const avgWpm = Math.round(
        sessions.reduce((sum, session) => sum + (Number(session.wpm) || 0), 0) / sessions.length
    );
    const totalTimeMs = sessions.reduce((sum, session) => sum + (Number(session.timeTaken) || 0) * 1000, 0);
    const { currentStreak, longestStreak } = calculateStreak(sessions);

    // Aggregate per-key accuracy across all sessions
    const keyTotals = {};
    sessions.forEach((s) => {
        if (!s.keyAccuracy) return;
        Object.entries(s.keyAccuracy).forEach(([k, v]) => {
            if (!keyTotals[k]) keyTotals[k] = { sum: 0, count: 0 };
            keyTotals[k].sum += Number(v) || 0;
            keyTotals[k].count += 1;
        });
    });
    const weakKeys = Object.entries(keyTotals)
        .map(([k, d]) => ({ key: k, accuracy: d.sum / d.count }))
        .filter((d) => d.accuracy < 75)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 8)
        .map((d) => d.key);

    res.status(200).json({
        bestWpm,
        avgWpm,
        totalTests: sessions.length,
        totalTimeMs,
        currentStreak,
        longestStreak,
        achievements: [],
        weakKeys
    });
}

module.exports = {
    start,
    submit,
    history,
    analytics,
    getGlobalStats,
    saveSession,
    getSessions,
    getProfileStats,
    startSchema,
    submitSchema
};
