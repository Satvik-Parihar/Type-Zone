const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { getProfile, updateSettings } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', requireAuth, asyncHandler(getProfile));
router.patch('/settings', requireAuth, asyncHandler(updateSettings));

module.exports = router;
