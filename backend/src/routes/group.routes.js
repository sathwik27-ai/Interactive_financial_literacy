// Group Expense routes
const express = require('express');
const router = express.Router();
const groupExpenseController = require('../controllers/groupExpenseController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post('/', groupExpenseController.createGroupExpense.bind(groupExpenseController));
router.get('/', groupExpenseController.getGroupExpenses.bind(groupExpenseController));
router.patch('/:expenseId/members/:memberId/paid', groupExpenseController.markMemberPaid.bind(groupExpenseController));
router.delete('/:id', groupExpenseController.deleteGroupExpense.bind(groupExpenseController));

module.exports = router;

