const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { getMyAchievements } = require('../controllers/achievementController');

const router = express.Router();

router.get('/me', requireAuth, asyncHandler(getMyAchievements));

module.exports = router;
