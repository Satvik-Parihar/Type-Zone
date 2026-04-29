const mongoose = require('mongoose');

const typingStatsSchema = new mongoose.Schema(
    {
        bestWpm: { type: Number, default: 0 },
        averageWpm: { type: Number, default: 0 },
        averageAccuracy: { type: Number, default: 0 },
        testsCompleted: { type: Number, default: 0 },
        streakDays: { type: Number, default: 0 },
        lastPracticeDate: { type: Date },
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        rankedRating: { type: Number, default: 1000 },
        ratingLastUpdatedAt: { type: Date }
    },
    { _id: false }
);

const settingsSchema = new mongoose.Schema(
    {
        theme: { type: String, default: 'dark' },
        soundEnabled: { type: Boolean, default: true },
        keypressSoundEnabled: { type: Boolean, default: true },
        ambienceEnabled: { type: Boolean, default: false },
        ambienceVolume: { type: Number, min: 0, max: 1, default: 0.2 },
        typingSoundProfile: { 
            type: String, 
            enum: ['classic', 'soft', 'clicky', 'mechanical', 'typewriter', 'spring', 'silent'],
            default: 'classic' 
        },
        keyboardOnlyMode: { type: Boolean, default: true },
        language: { type: String, default: 'english' }
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 40
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            index: true
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: ''
        },
        isAdmin: {
            type: Boolean,
            default: false,
            index: true
        },
        typingStats: {
            type: typingStatsSchema,
            default: () => ({})
        },
        achievements: {
            type: [String],
            default: []
        },
        settings: {
            type: settingsSchema,
            default: () => ({})
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);
