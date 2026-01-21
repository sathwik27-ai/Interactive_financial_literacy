// Scam Detection Controller
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const geminiService = require('../services/geminiService');

const prisma = new PrismaClient();

class ScamController {
  // Analyze message for scam
  async detectScam(req, res) {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Use Gemini to analyze
      const analysis = await geminiService.detectScam(message);
      
      // Save to database
      const scamLog = await prisma.scamLog.create({
        data: {
          userId: req.userId,
          message,
          category: analysis.category,
          confidence: analysis.confidence,
          explanation: analysis.explanation,
          isScam: analysis.isScam
        }
      });
      
      logger.info(`Scam analysis: ${scamLog.id} - Is Scam: ${analysis.isScam}`);
      res.json({ analysis: { ...analysis, logId: scamLog.id } });
    } catch (error) {
      logger.error(`Detect scam error: ${error.message}`);
      res.status(500).json({ error: 'Failed to analyze scam' });
    }
  }
  
  // Get scam history
  async getScamHistory(req, res) {
    try {
      const logs = await prisma.scamLog.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        take: 100
      });
      
      res.json({ logs });
    } catch (error) {
      logger.error(`Get scam history error: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch scam history' });
    }
  }
}

module.exports = new ScamController();

