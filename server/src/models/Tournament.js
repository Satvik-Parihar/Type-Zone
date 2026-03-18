const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        wpm: {
            type: Number,
            min: 0,
            default: 0
        },
        accuracy: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        score: {
            type: Number,
            min: 0,
            default: 0
        },
        rank: {
            type: Number,
            min: 1,
            default: null
        },
        xpAwarded: {
            type: Number,
            min: 0,
            default: 0
        },
        rewardClaimed: {
            type: Boolean,
            default: false
        }
    },
    { _id: false }
);

const tournamentSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        mode: {
            type: String,
            enum: ['words', 'time', 'quote', 'code', 'sentence', 'paragraph', 'challenge'],
            default: 'time'
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'expert'],
            default: 'hard'
        },
        status: {
            type: String,
            enum: ['scheduled', 'active', 'completed'],
            default: 'scheduled',
            index: true
        },
        startsAt: {
            type: Date,
            required: true,
            index: true
        },
        endsAt: {
            type: Date,
            required: true,
            index: true
        },
        rewardXp: {
            type: Number,
            min: 0,
            default: 250
        },
        participants: {
            type: [participantSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

tournamentSchema.index({ startsAt: 1, endsAt: 1 });

tournamentSchema.index({ status: 1, startsAt: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);
