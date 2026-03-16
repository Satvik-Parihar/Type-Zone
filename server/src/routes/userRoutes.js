const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { getProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', requireAuth, asyncHandler(getProfile));

module.exports = router;
