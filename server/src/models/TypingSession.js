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
            enum: ['words', 'quote', 'time', 'numbers', 'code', 'punctuation'],
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
        timeTaken: {
            type: Number,
            min: 1,
            required: true
        },
        rawInput: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

typingSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TypingSession', typingSessionSchema);
