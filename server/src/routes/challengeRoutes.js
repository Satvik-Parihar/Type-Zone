const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { getDailyChallenge } = require('../controllers/challengeController');

const router = express.Router();

router.get('/daily', asyncHandler(getDailyChallenge));

module.exports = router;
