// Request validation middleware
const logger = require('../utils/logger');
const { validateEmail, validatePassword, validateAmount } = require('../utils/validators');

const validateRequest = {
  // Validate login/signup
  auth: (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    next();
  },
  
  // Validate expense creation
  expense: (req, res, next) => {
    const { category, amount, description } = req.body;
    
    if (!category || !amount || !description) {
      return res.status(400).json({ error: 'Category, amount, and description are required' });
    }
    
    if (!validateAmount(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    next();
  },
  
  // Validate budget creation
  budget: (req, res, next) => {
    const { category, amount, endDate } = req.body;
    
    if (!category || !amount || !endDate) {
      return res.status(400).json({ error: 'Category, amount, and endDate are required' });
    }
    
    if (!validateAmount(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    next();
  },
  
  // Validate goal creation
  goal: (req, res, next) => {
    const { title, targetAmount, targetDate } = req.body;
    
    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({ error: 'Title, targetAmount, and targetDate are required' });
    }
    
    if (!validateAmount(targetAmount)) {
      return res.status(400).json({ error: 'Invalid target amount' });
    }
    
    next();
  }
};

module.exports = validateRequest;

