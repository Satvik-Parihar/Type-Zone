const { z } = require('zod');
const TypingSession = require('../models/TypingSession');
const { startTypingSession, submitTypingSession } = require('../services/typingService');
const { ApiError } = require('../utils/ApiError');

const startSchema = z.object({
    mode: z.enum(['words', 'quote', 'time', 'numbers', 'code', 'punctuation']),
    wordCount: z.number().int().min(10).max(200).optional().default(25)
});

const submitSchema = z.object({
    textId: z.string().min(1),
    mode: z.enum(['words', 'quote', 'time', 'numbers', 'code', 'punctuation']),
    wpm: z.number().min(0),
    accuracy: z.number().min(0).max(100),
    errors: z.number().int().min(0),
    timeTaken: z.number().int().min(1),
    rawInput: z.string().optional().default('')
});

async function start(req, res) {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'Invalid typing start payload', parsed.error.flatten());

    const result = await startTypingSession({
        userId: req.auth.userId,
        mode: parsed.data.mode,
        wordCount: parsed.data.wordCount
    });

    res.status(200).json(result);
}

async function submit(req, res) {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'Invalid typing submit payload', parsed.error.flatten());

    const session = await submitTypingSession({
        userId: req.auth.userId,
        ...parsed.data
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

module.exports = {
    start,
    submit,
    history
};
