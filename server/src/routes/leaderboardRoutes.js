const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { getLeaderboard } = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/', asyncHandler(getLeaderboard));

module.exports = router;
