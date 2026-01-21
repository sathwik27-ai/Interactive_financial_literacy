// Scam Detection routes
const express = require('express');
const router = express.Router();
const scamController = require('../controllers/scamController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post('/detect', scamController.detectScam.bind(scamController));
router.get('/history', scamController.getScamHistory.bind(scamController));

module.exports = router;