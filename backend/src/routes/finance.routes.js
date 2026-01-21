// Finance routes (Expenses, Budgets, Goals, Calculators)
const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validation');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Expenses
router.post('/expenses', validateRequest.expense, financeController.createExpense.bind(financeController));
router.get('/expenses', financeController.getExpenses.bind(financeController));
router.delete('/expenses/:id', financeController.deleteExpense.bind(financeController));

// Budgets
router.post('/budgets', validateRequest.budget, financeController.createBudget.bind(financeController));
router.get('/budgets', financeController.getBudgets.bind(financeController));
router.delete('/budgets/:id', financeController.deleteBudget.bind(financeController));

// Goals
router.post('/goals', validateRequest.goal, financeController.createGoal.bind(financeController));
router.get('/goals', financeController.getGoals.bind(financeController));
router.patch('/goals/:id/progress', financeController.updateGoalProgress.bind(financeController));
router.delete('/goals/:id', financeController.deleteGoal.bind(financeController));

// Calculators
router.post('/calculators/emi', financeController.calculateEMI.bind(financeController));
router.post('/calculators/sip', financeController.calculateSIP.bind(financeController));

module.exports = router;