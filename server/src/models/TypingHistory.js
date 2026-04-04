const mongoose = require('mongoose');

const typingHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TypingSession',
            required: true
        },
        dailyChallenge: {
            type: Boolean,
            default: false
        },
        heatmap: {
            type: [Number],
            default: []
        },
        wpmHistory: {
            type: [Number],
            default: []
        },
        accuracyHistory: {
            type: [Number],
            default: []
        },
        sessionDuration: {
            type: Number,
            min: 1,
            default: 1
        },
        mistakeFrequency: {
            type: Map,
            of: Number,
            default: {}
        },
        correctionPatterns: {
            backspaceCorrections: {
                type: Number,
                default: 0
            },
            replacedErrors: {
                type: Number,
                default: 0
            }
        },
        keystrokeTimings: {
            type: [Number],
            default: []
        },
        keystrokeCount: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

typingHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TypingHistory', typingHistorySchema);
