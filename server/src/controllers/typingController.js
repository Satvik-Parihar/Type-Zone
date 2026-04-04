const { z } = require('zod');
const TypingSession = require('../models/TypingSession');
const { startTypingSession, submitTypingSession } = require('../services/typingService');

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
    errors: z.number().int().min(0),
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
    const session = await submitTypingSession({
        userId: req.auth.userId,
        ...req.body
    });

    res.status(201).json({
        id: session._id
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

module.exports = {
    start,
    submit,
    history,
    analytics,
    startSchema,
    submitSchema
};
