const User = require('../models/User');
const TypingHistory = require('../models/TypingHistory');
const { ApiError } = require('../utils/ApiError');

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

module.exports = {
    getProfile
};
