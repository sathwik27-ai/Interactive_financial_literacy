// AI routes (Quiz, Mentor Chat)
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Quiz
router.post('/quiz/generate', aiController.generateQuiz.bind(aiController));
router.post('/quiz/save', aiController.saveQuizResult.bind(aiController));
router.get('/quiz/history', aiController.getQuizHistory.bind(aiController));

// Mentor Chat
router.post('/mentor/chat', aiController.chatWithMentor.bind(aiController));
router.get('/mentor/history', aiController.getChatHistory.bind(aiController));

// Session Management
router.post('/start-session', aiController.startSession.bind(aiController));

module.exports = router;