// Authentication controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class AuthController {
  // User registration
  async signup(req, res) {
    try {
      const { email, password, name } = req.body;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });
      
      logger.info(`New user registered: ${email}`);
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      logger.error(`Signup error: ${error.message}`);
      logger.error(`Stack: ${error.stack}`);
      const errorMessage = process.env.NODE_ENV === 'development' && error?.message
        ? `Failed to create user: ${error.message}`
        : 'Failed to create user';
      res.status(500).json({ error: errorMessage });
    }
  }
  
  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      logger.info(`User logged in: ${email}`);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      res.status(500).json({ error: 'Login failed' });
    }
  }
  
  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
}

module.exports = new AuthController();
