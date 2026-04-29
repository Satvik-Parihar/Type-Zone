const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { validateBody } = require('../middleware/validate');
const { start, submit, history, analytics, getGlobalStats, saveSession, getSessions, getProfileStats, startSchema, submitSchema } = require('../controllers/typingController');

const router = express.Router();

// Public route for global stats
router.get('/stats/global', asyncHandler(getGlobalStats));

// Protected routes
router.post('/start', requireAuth, validateBody(startSchema), asyncHandler(start));
router.post('/submit', requireAuth, validateBody(submitSchema), asyncHandler(submit));
router.post('/sessions', requireAuth, asyncHandler(saveSession));
router.get('/history', requireAuth, asyncHandler(history));
router.get('/analytics', requireAuth, asyncHandler(analytics));
router.get('/sessions', requireAuth, asyncHandler(getSessions));
router.get('/profile/stats', requireAuth, asyncHandler(getProfileStats));

module.exports = router;
