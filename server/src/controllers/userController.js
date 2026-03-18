const User = require('../models/User');
const TypingHistory = require('../models/TypingHistory');
const { ApiError } = require('../utils/ApiError');
const { z } = require('zod');

const settingsSchema = z.object({
    theme: z.enum(['dark', 'light', 'matrix', 'cyberpunk', 'dracula', 'retro']).optional(),
    soundEnabled: z.boolean().optional(),
    keypressSoundEnabled: z.boolean().optional(),
    ambienceEnabled: z.boolean().optional(),
    ambienceVolume: z.number().min(0).max(1).optional(),
    typingSoundProfile: z.enum(['classic', 'soft', 'clicky', 'mechanical', 'typewriter', 'spring', 'silent']).optional(),
    keyboardOnlyMode: z.boolean().optional(),
    language: z.string().min(2).max(32).optional()
});

async function getProfile(req, res) {
    const user = await User.findById(req.auth.userId).lean();
    if (!user) throw new ApiError(404, 'User not found');

    const historyCount = await TypingHistory.countDocuments({ userId: req.auth.userId });

    res.status(200).json({
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            typingStats: user.typingStats,
            settings: user.settings
        },
        historyCount
    });
}

async function updateSettings(req, res) {
    const parsed = settingsSchema.safeParse(req.body || {});
    if (!parsed.success) {
        throw new ApiError(400, 'Invalid settings payload', parsed.error.flatten());
    }

    const user = await User.findById(req.auth.userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.settings = {
        ...user.settings?.toObject?.(),
        ...parsed.data
    };

    await user.save();

    res.status(200).json({
        settings: user.settings
    });
}

module.exports = {
    getProfile,
    updateSettings
};
