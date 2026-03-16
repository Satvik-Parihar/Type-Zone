const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { history } = require('../controllers/typingController');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(history));

module.exports = router;
