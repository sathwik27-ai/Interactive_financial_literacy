// Group Expense Controller
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class GroupExpenseController {
  // Create group expense
  async createGroupExpense(req, res) {
    try {
      const { title, description, totalAmount, members } = req.body;
      
      // Validate members
      if (!members || members.length === 0) {
        return res.status(400).json({ error: 'At least one member is required' });
      }
      
      const sumShares = members.reduce((sum, m) => sum + m.share, 0);
      if (Math.abs(sumShares - totalAmount) > 0.01) {
        return res.status(400).json({ error: 'Sum of shares must equal total amount' });
      }
      
      // Create group expense
      const groupExpense = await prisma.groupExpense.create({
        data: {
          title,
          description,
          totalAmount: parseFloat(totalAmount),
          paidBy: req.userId,
          members: {
            create: members.map(m => ({
              userId: m.userId,
              share: m.share,
              isPaid: false
            }))
          }
        },
        include: { members: true }
      });
      
      logger.info(`Group expense created: ${groupExpense.id}`);
      res.status(201).json({ groupExpense });
    } catch (error) {
      logger.error(`Create group expense error: ${error.message}`);
      res.status(500).json({ error: 'Failed to create group expense' });
    }
  }
  
  // Get user's group expenses
  async getGroupExpenses(req, res) {
    try {
      const expenses = await prisma.groupExpense.findMany({
        where: {
          OR: [
            { paidBy: req.userId },
            { members: { some: { userId: req.userId } } }
          ]
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({ expenses });
    } catch (error) {
      logger.error(`Get group expenses error: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch group expenses' });
    }
  }
  
  // Mark member as paid
  async markMemberPaid(req, res) {
    try {
      const { expenseId, memberId } = req.params;
      
      const member = await prisma.groupMember.update({
        where: { id: memberId },
        data: { isPaid: true }
      });
      
      logger.info(`Member marked as paid: ${memberId}`);
      res.json({ member });
    } catch (error) {
      logger.error(`Mark member paid error: ${error.message}`);
      res.status(500).json({ error: 'Failed to update member status' });
    }
  }
  
  // Delete group expense
  async deleteGroupExpense(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.groupExpense.delete({
        where: { id }
      });
      
      logger.info(`Group expense deleted: ${id}`);
      res.json({ message: 'Group expense deleted successfully' });
    } catch (error) {
      logger.error(`Delete group expense error: ${error.message}`);
      res.status(500).json({ error: 'Failed to delete group expense' });
    }
  }
}

module.exports = new GroupExpenseController();

