const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { asyncHandler } = require('../utils/asyncHandler');
const { getSchedule, join, submit, mine, create, update, remove } = require('../controllers/tournamentController');

const router = express.Router();

// Public endpoints
router.get('/', requireAuth, asyncHandler(getSchedule));
router.get('/mine', requireAuth, asyncHandler(mine));
router.post('/join', requireAuth, asyncHandler(join));
router.post('/submit', requireAuth, asyncHandler(submit));

// Admin endpoints
router.post('/', requireAuth, requireAdmin, asyncHandler(create));
router.patch('/:id', requireAuth, requireAdmin, asyncHandler(update));
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(remove));

module.exports = router;
