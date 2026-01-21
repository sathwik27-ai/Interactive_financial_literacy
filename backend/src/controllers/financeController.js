// Finance controller (Expenses, Budgets, Goals)
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const financeCalculator = require('../services/financeCalculator');

const prisma = new PrismaClient();

class FinanceController {
  // ============ EXPENSES ============
  
  async createExpense(req, res) {
    try {
      const { category, amount, description, date } = req.body;
      
      const expense = await prisma.expense.create({
        data: {
          userId: req.userId,
          category,
          amount: parseFloat(amount),
          description,
          date: date ? new Date(date) : new Date()
        }
      });
      
      logger.info(`Expense created: ${expense.id}`);
      res.status(201).json({ expense });
    } catch (error) {
      logger.error(`Create expense error: ${error.message}`);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  }
  
  async getExpenses(req, res) {
    try {
      const { category, startDate, endDate } = req.query;
      
      const where = { userId: req.userId };
      
      if (category) where.category = category;
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }
      
      const expenses = await prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' }
      });
      
      res.json({ expenses });
    } catch (error) {
      logger.error(`Get expenses error: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  }
  
  async deleteExpense(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.expense.delete({
        where: { id, userId: req.userId }
      });
      
      logger.info(`Expense deleted: ${id}`);
      res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
      logger.error(`Delete expense error: ${error.message}`);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  }
  
  // ============ BUDGETS ============
  
  async createBudget(req, res) {
    try {
      const { category, amount, startDate, endDate } = req.body;
      
      const budget = await prisma.budget.create({
        data: {
          userId: req.userId,
          category,
          amount: parseFloat(amount),
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: new Date(endDate)
        }
      });
      
      logger.info(`Budget created: ${budget.id}`);
      res.status(201).json({ budget });
    } catch (error) {
      logger.error(`Create budget error: ${error.message}`);
      res.status(500).json({ error: 'Failed to create budget' });
    }
  }
  
  async getBudgets(req, res) {
    try {
      const budgets = await prisma.budget.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' }
      });
      
      // Calculate utilization for each budget
      const budgetsWithUtilization = await Promise.all(
        budgets.map(async (budget) => {
          const expenses = await prisma.expense.findMany({
            where: {
              userId: req.userId,
              category: budget.category,
              date: {
                gte: budget.startDate,
                lte: budget.endDate
              }
            }
          });
          
          const utilization = financeCalculator.calculateBudgetUtilization(budget.amount, expenses);
          
          return {
            ...budget,
            utilization
          };
        })
      );
      
      res.json({ budgets: budgetsWithUtilization });
    } catch (error) {
      logger.error(`Get budgets error: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch budgets' });
    }
  }
  
  async deleteBudget(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.budget.delete({
        where: { id, userId: req.userId }
      });
      
      logger.info(`Budget deleted: ${id}`);
      res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
      logger.error(`Delete budget error: ${error.message}`);
      res.status(500).json({ error: 'Failed to delete budget' });
    }
  }
  
  // ============ GOALS ============
  
  async createGoal(req, res) {
    try {
      const { title, description, targetAmount, currentAmount, targetDate } = req.body;
      
      const goal = await prisma.goal.create({
        data: {
          userId: req.userId,
          title,
          description,
          targetAmount: parseFloat(targetAmount),
          currentAmount: parseFloat(currentAmount) || 0,
          targetDate: new Date(targetDate)
        }
      });
      
      logger.info(`Goal created: ${goal.id}`);
      res.status(201).json({ goal });
    } catch (error) {
      logger.error(`Create goal error: ${error.message}`);
      res.status(500).json({ error: 'Failed to create goal' });
    }
  }
  
  async getGoals(req, res) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({ goals });
    } catch (error) {
      logger.error(`Get goals error: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch goals' });
    }
  }
  
  async updateGoalProgress(req, res) {
    try {
      const { id } = req.params;
      const { currentAmount } = req.body;
      
      const goal = await prisma.goal.update({
        where: { id, userId: req.userId },
        data: {
          currentAmount: parseFloat(currentAmount),
          isCompleted: parseFloat(currentAmount) >= (await prisma.goal.findUnique({ where: { id } })).targetAmount
        }
      });
      
      logger.info(`Goal progress updated: ${id}`);
      res.json({ goal });
    } catch (error) {
      logger.error(`Update goal error: ${error.message}`);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  }
  
  async deleteGoal(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.goal.delete({
        where: { id, userId: req.userId }
      });
      
      logger.info(`Goal deleted: ${id}`);
      res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      logger.error(`Delete goal error: ${error.message}`);
      res.status(500).json({ error: 'Failed to delete goal' });
    }
  }
  
  // ============ CALCULATORS ============
  
  async calculateEMI(req, res) {
    try {
      const { principal, annualRate, tenureMonths } = req.body;
      
      const result = financeCalculator.calculateEMI(
        parseFloat(principal),
        parseFloat(annualRate),
        parseInt(tenureMonths)
      );
      
      res.json({ result });
    } catch (error) {
      logger.error(`Calculate EMI error: ${error.message}`);
      res.status(500).json({ error: 'Failed to calculate EMI' });
    }
  }
  
  async calculateSIP(req, res) {
    try {
      const { monthlyAmount, annualRate, years } = req.body;
      
      const result = financeCalculator.calculateSIP(
        parseFloat(monthlyAmount),
        parseFloat(annualRate),
        parseInt(years)
      );
      
      res.json({ result });
    } catch (error) {
      logger.error(`Calculate SIP error: ${error.message}`);
      res.status(500).json({ error: 'Failed to calculate SIP' });
    }
  }
}

module.exports = new FinanceController();

