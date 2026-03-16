const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true
        },
        bestWpm: {
            type: Number,
            default: 0
        },
        averageWpm: {
            type: Number,
            default: 0
        },
        averageAccuracy: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
