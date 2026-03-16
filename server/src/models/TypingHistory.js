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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('TypingHistory', typingHistorySchema);
