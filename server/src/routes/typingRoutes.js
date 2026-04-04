const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { validateBody } = require('../middleware/validate');
const { start, submit, history, analytics, startSchema, submitSchema } = require('../controllers/typingController');

const router = express.Router();

router.post('/start', requireAuth, validateBody(startSchema), asyncHandler(start));
router.post('/submit', requireAuth, validateBody(submitSchema), asyncHandler(submit));
router.get('/history', requireAuth, asyncHandler(history));
router.get('/analytics', requireAuth, asyncHandler(analytics));

module.exports = router;
