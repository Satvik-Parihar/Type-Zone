const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { signAccessToken, issueRefreshToken, rotateRefreshToken, revokeRefreshToken } = require('../services/tokenService');

const registerSchema = z.object({
    username: z.string().trim().min(3).max(40),
    email: z.string().trim().email(),
    password: z.string().min(8)
});

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
});

const REFRESH_COOKIE = 'typezone_refresh';

function setRefreshCookie(res, token) {
    res.cookie(REFRESH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: Number(process.env.REFRESH_TOKEN_DAYS || 14) * 24 * 60 * 60 * 1000
    });
}

function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_COOKIE);
}

async function register(req, res) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'Invalid registration payload', parsed.error.flatten());

    const { username, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) throw new ApiError(409, 'Email already in use');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
        username,
        email: normalizedEmail,
        password: hashedPassword
    });

    const accessToken = signAccessToken(user);
    const { rawToken } = await issueRefreshToken(user._id);

    setRefreshCookie(res, rawToken);

    res.status(201).json({
        accessToken,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            typingStats: user.typingStats,
            settings: user.settings
        }
    });
}

async function login(req, res) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'Invalid login payload', parsed.error.flatten());

    const { email, password } = parsed.data;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new ApiError(401, 'Invalid email or password');

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) throw new ApiError(401, 'Invalid email or password');

    const accessToken = signAccessToken(user);
    const { rawToken } = await issueRefreshToken(user._id);

    setRefreshCookie(res, rawToken);

    res.status(200).json({
        accessToken,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            typingStats: user.typingStats,
            settings: user.settings
        }
    });
}

async function refresh(req, res) {
    const refreshToken = req.cookies[REFRESH_COOKIE];
    if (!refreshToken) throw new ApiError(401, 'Missing refresh token');

    const rotated = await rotateRefreshToken(refreshToken);
    if (!rotated) throw new ApiError(401, 'Refresh token expired or invalid');

    const user = await User.findById(rotated.userId || null);
    if (!user) throw new ApiError(401, 'User not found for refresh token');

    const accessToken = signAccessToken(user);
    setRefreshCookie(res, rotated.rawToken);

    res.status(200).json({
        accessToken
    });
}

async function logout(req, res) {
    const refreshToken = req.cookies[REFRESH_COOKIE];
    if (refreshToken) {
        await revokeRefreshToken(refreshToken);
    }
    clearRefreshCookie(res);
    res.status(204).send();
}

module.exports = {
    register,
    login,
    refresh,
    logout
};
