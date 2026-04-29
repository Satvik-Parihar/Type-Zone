const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { getRaceHistory } = require('../controllers/raceHistoryController');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(getRaceHistory));

module.exports = router;