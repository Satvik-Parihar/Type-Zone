const mongoose = require('mongoose');

const typingSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        textId: {
            type: String,
            required: true
        },
        mode: {
            type: String,
            enum: ['words', 'quote', 'time', 'numbers', 'code', 'punctuation', 'sentence', 'paragraph', 'zen', 'practice', 'challenge', 'custom'],
            default: 'words'
        },
        wpm: {
            type: Number,
            min: 0,
            required: true
        },
        accuracy: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        errors: {
            type: Number,
            min: 0,
            required: true
        },
        rawWpm: {
            type: Number,
            min: 0,
            default: 0
        },
        consistency: {
            type: Number,
            min: 0,
            max: 100,
            default: 100
        },
        keystrokesPerSecond: {
            type: Number,
            min: 0,
            default: 0
        },
        timeTaken: {
            type: Number,
            min: 1,
            required: true
        },
        rawInput: {
            type: String,
            default: ''
        },
        keystrokeTimeline: {
            type: [
                new mongoose.Schema(
                    {
                        key: { type: String, required: true },
                        expectedKey: { type: String, default: '' },
                        timestamp: { type: Number, required: true },
                        deltaMs: { type: Number, default: 0 },
                        position: { type: Number, default: 0 },
                        isError: { type: Boolean, default: false },
                        isCorrection: { type: Boolean, default: false }
                    },
                    { _id: false }
                )
            ],
            default: []
        }
    },
    {
        timestamps: true
    }
);

typingSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TypingSession', typingSessionSchema);
