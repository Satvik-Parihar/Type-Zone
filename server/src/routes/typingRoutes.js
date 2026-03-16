const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { start, submit, history } = require('../controllers/typingController');

const router = express.Router();

router.post('/start', requireAuth, asyncHandler(start));
router.post('/submit', requireAuth, asyncHandler(submit));
router.get('/history', requireAuth, asyncHandler(history));

module.exports = router;
