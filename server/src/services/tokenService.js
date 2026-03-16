const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 14);

function signAccessToken(user) {
    return jwt.sign(
        {
            email: user.email,
            username: user.username,
            avatar: user.avatar || ''
        },
        process.env.JWT_SECRET,
        {
            subject: String(user._id),
            expiresIn: ACCESS_EXPIRES_IN
        }
    );
}

function createRefreshTokenRaw() {
    return crypto.randomBytes(48).toString('hex');
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

async function issueRefreshToken(userId) {
    const rawToken = createRefreshTokenRaw();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
        userId,
        tokenHash,
        expiresAt
    });

    return {
        rawToken,
        expiresAt
    };
}

async function rotateRefreshToken(rawToken) {
    const tokenHash = hashToken(rawToken);
    const existing = await RefreshToken.findOne({ tokenHash });

    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
        return null;
    }

    existing.revokedAt = new Date();
    await existing.save();

    const nextToken = await issueRefreshToken(existing.userId);
    return {
        ...nextToken,
        userId: existing.userId
    };
}

async function revokeRefreshToken(rawToken) {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { revokedAt: new Date() });
}

module.exports = {
    signAccessToken,
    issueRefreshToken,
    rotateRefreshToken,
    revokeRefreshToken
};
