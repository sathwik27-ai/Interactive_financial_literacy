// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validation');

// Public routes
router.post('/signup', validateRequest.auth, authController.signup.bind(authController));
router.post('/login', validateRequest.auth, authController.login.bind(authController));

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));

module.exports = router;