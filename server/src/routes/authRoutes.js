const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { register, login, refresh, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));

module.exports = router;
