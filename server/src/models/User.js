const mongoose = require('mongoose');

const typingStatsSchema = new mongoose.Schema(
    {
        bestWpm: { type: Number, default: 0 },
        averageWpm: { type: Number, default: 0 },
        averageAccuracy: { type: Number, default: 0 },
        testsCompleted: { type: Number, default: 0 },
        streakDays: { type: Number, default: 0 },
        lastPracticeDate: { type: Date }
    },
    { _id: false }
);

const settingsSchema = new mongoose.Schema(
    {
        theme: { type: String, default: 'dark' },
        soundEnabled: { type: Boolean, default: true },
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
        typingStats: {
            type: typingStatsSchema,
            default: () => ({})
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
