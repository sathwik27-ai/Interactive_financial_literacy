// AI Controller (Quiz, Mentor Chat)
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const geminiService = require('../services/geminiService');

const prisma = new PrismaClient();

class AIController {
  // Start learning session with notes and quiz
  async startSession(req, res) {
    try {
      const { userId, startModule } = req.body;
      
      // Use authenticated user ID from token, or provided userId
      const sessionUserId = req.userId || userId || 'guest';
      const module = startModule || 'budgeting-101';
      
      const moduleNames = {
        'budgeting-101': 'Budgeting Fundamentals',
        'investing-basics': 'Investing Basics',
        'credit-management': 'Credit Management',
        'savings-strategies': 'Savings Strategies',
        'debt-management': 'Debt Management',
        'financial-planning': 'Financial Planning'
      };

      // Generate session ID
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate session token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { sessionId, userId: sessionUserId, module },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Calculate expiration (24 hours from now)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Construct session URL
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const sessionUrl = `${baseUrl}/learn?session=${sessionId}&token=${token}&module=${module}`;
      
      // Generate notes for the module
      const moduleTopic = moduleNames[module] || module;
      const notes = await this.generateModuleNotes(module, moduleTopic);
      
      logger.info(`Session started: ${sessionId} for user ${sessionUserId}`);
      
      res.json({
        sessionUrl,
        sessionId,
        expiresAt: expiresAt.toISOString(),
        module,
        notes
      });
    } catch (error) {
      logger.error(`Start session error: ${error.message}`);
      res.status(500).json({ error: 'Failed to start session' });
    }
  }

  // Generate module notes using Gemini API
  async generateModuleNotes(module, moduleTopic) {
    try {
      // Create a comprehensive, topic-specific prompt for Gemini
      const prompt = `You are a financial education expert. Generate comprehensive, detailed educational notes about "${moduleTopic}" for financial literacy learners.

Topic: ${moduleTopic}

Generate educational content that includes:

1. **Key Concepts and Definitions**
   - Define important terms and concepts clearly
   - Explain fundamental principles

2. **Important Principles and Strategies**
   - List key principles (3-5 main points)
   - Explain proven strategies

3. **Practical Tips and Best Practices**
   - Provide actionable advice
   - Include step-by-step guidance where relevant

4. **Common Mistakes to Avoid**
   - List frequent errors people make
   - Explain why these mistakes are harmful

5. **Real-World Examples**
   - Include practical scenarios
   - Use relatable examples with numbers/amounts

Format the response as clear, structured markdown with headings (use # for main titles, ## for sections, ### for subsections). Keep it informative, educational, and easy to understand. Make it comprehensive - aim for 500-800 words of valuable content.

Focus specifically on "${moduleTopic}" and make all content relevant to this topic.`;

      // Always try Gemini API first
      const notes = await geminiService.generateContent(prompt);
      
      // Validate response
      if (notes && notes.trim() && notes.trim().length > 50 && !notes.includes('Content generation failed') && !notes.includes('not available')) {
        logger.info(`Notes generated successfully for ${moduleTopic} via Gemini API`);
        return notes;
      }
      
      // If Gemini fails or returns invalid response, use fallback
      logger.warn(`Gemini API failed for notes generation, using fallback for ${moduleTopic}`);
      return this.getFallbackNotes(module, moduleTopic);
    } catch (error) {
      logger.error(`Error generating notes from Gemini: ${error.message}`);
      // Use fallback notes if Gemini fails
      return this.getFallbackNotes(module, moduleTopic);
    }
  }

  // Fallback notes when AI generation fails
  getFallbackNotes(module, moduleTopic) {
    const fallbackNotes = {
      'budgeting-101': `# Budgeting Fundamentals

## Key Concepts
A budget is a financial plan that helps you track income and expenses. It's the foundation of good financial management.

## Important Principles
1. **50/30/20 Rule**: Allocate 50% to needs, 30% to wants, and 20% to savings
2. **Track Everything**: Record all income and expenses accurately
3. **Review Regularly**: Update your budget monthly to reflect changes

## Practical Tips
- Use budgeting apps or spreadsheets to track expenses
- Set aside money for emergencies before spending on wants
- Automate savings transfers to build the habit
- Review your budget weekly to stay on track

## Common Mistakes to Avoid
- Not accounting for irregular expenses
- Being too restrictive (allows for unexpected costs)
- Forgetting to include savings as an expense
- Not adjusting the budget when income changes

## Real-World Example
If you earn ₹50,000/month:
- Needs (50%): ₹25,000 (rent, groceries, utilities)
- Wants (30%): ₹15,000 (entertainment, dining out)
- Savings (20%): ₹10,000 (emergency fund, investments)`,
      
      'investing-basics': `# Investing Basics

## Key Concepts
Investing means putting money into assets that can grow over time, such as stocks, bonds, or mutual funds.

## Important Principles
1. **Diversification**: Spread investments across different asset classes
2. **Long-term Focus**: Think in years, not days or weeks
3. **Start Early**: Time in the market beats timing the market

## Practical Tips
- Start with SIPs (Systematic Investment Plans) in mutual funds
- Invest in index funds for low-cost diversification
- Avoid trying to time the market
- Reinvest dividends for compound growth

## Common Mistakes to Avoid
- Investing without emergency fund
- Putting all money in one stock
- Panic selling during market downturns
- Chasing high returns without understanding risk

## Real-World Example
Investing ₹5,000/month via SIP at 12% annual return:
- After 10 years: ~₹11.5 lakhs
- After 20 years: ~₹48 lakhs
- Power of compounding grows your wealth exponentially`,
      
      'credit-management': `# Credit Management

## Key Concepts
Credit management involves understanding credit scores, building credit history, and using credit responsibly.

## Important Principles
1. **Pay on Time**: Late payments hurt your credit score
2. **Keep Utilization Low**: Use less than 30% of credit limit
3. **Build History**: Maintain active accounts over time

## Practical Tips
- Check your credit score regularly (free via CIBIL, Experian)
- Pay credit card bills in full each month
- Keep credit accounts active but don't overuse
- Avoid applying for multiple credit cards at once

## Common Mistakes to Avoid
- Missing payment deadlines
- Maxing out credit cards
- Closing old credit accounts
- Not checking credit reports for errors

## Real-World Example
Good credit score (750+):
- Lower interest rates on loans
- Better credit card offers
- Easier loan approvals
- Saves thousands in interest over time`,
      
      'savings-strategies': `# Savings Strategies

## Key Concepts
Savings strategies help you build wealth by setting aside money regularly and making it work for you.

## Important Principles
1. **Pay Yourself First**: Save before spending
2. **Automate Savings**: Set up automatic transfers
3. **Emergency Fund First**: Build 6 months of expenses

## Practical Tips
- Use the envelope method for discretionary spending
- Set up separate savings accounts for different goals
- Take advantage of employer 401(k) matching
- Review and reduce unnecessary expenses regularly

## Common Mistakes to Avoid
- Saving whatever is left (often nothing)
- Not having an emergency fund
- Saving in low-interest accounts only
- Not setting specific savings goals

## Real-World Example
Saving strategy:
- Emergency fund: ₹3 lakhs (6 months expenses)
- Short-term goals: Separate account for vacations
- Long-term goals: SIPs for retirement
- Automate ₹10,000/month to savings`,
      
      'debt-management': `# Debt Management

## Key Concepts
Debt management involves creating a plan to pay off debts efficiently while avoiding new debt.

## Important Principles
1. **Prioritize High-Interest Debt**: Pay off credit cards first
2. **Snowball or Avalanche**: Choose a payoff strategy
3. **Avoid New Debt**: Don't borrow while paying off

## Practical Tips
- List all debts with interest rates
- Pay minimums on all, extra on highest interest
- Consider debt consolidation if rates are high
- Negotiate with creditors for better terms

## Common Mistakes to Avoid
- Only paying minimums
- Taking new debt while paying old
- Ignoring high-interest debt
- Not having a debt payoff plan

## Real-World Example
Debt payoff plan:
- Credit Card 1: ₹50,000 at 24% APR - Priority 1
- Personal Loan: ₹2 lakhs at 12% APR - Priority 2
- Home Loan: ₹30 lakhs at 8% APR - Priority 3
Focus extra payments on Credit Card 1 first`,
      
      'financial-planning': `# Financial Planning

## Key Concepts
Financial planning involves setting goals, creating a roadmap, and making informed decisions about money.

## Important Principles
1. **Set Clear Goals**: Define what you want to achieve
2. **Create a Timeline**: Set deadlines for goals
3. **Review and Adjust**: Update plan as life changes

## Practical Tips
- Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Create separate plans for short, medium, and long-term goals
- Review your financial plan annually
- Work with a financial advisor for complex situations

## Common Mistakes to Avoid
- Not having clear financial goals
- Planning without considering inflation
- Not reviewing the plan regularly
- Ignoring insurance and estate planning

## Real-World Example
Financial plan timeline:
- Short-term (1-3 years): Emergency fund, vacation
- Medium-term (3-7 years): Down payment for home
- Long-term (7+ years): Retirement, children's education
Each goal needs specific savings targets and timelines`
    };

    return fallbackNotes[module] || `# ${moduleTopic}

Educational content for ${moduleTopic} is being prepared. Please check back soon for comprehensive learning materials.`;
  }

  // Generate quiz
  async generateQuiz(req, res) {
    try {
      const { topic, notes, module } = req.body;
      
      if (!topic && !notes) {
        return res.status(400).json({ error: 'Topic or notes is required' });
      }
      
      // Get module-specific topic name
      const moduleNames = {
        'budgeting-101': 'Budgeting Fundamentals',
        'investing-basics': 'Investing Basics',
        'credit-management': 'Credit Management',
        'savings-strategies': 'Savings Strategies',
        'debt-management': 'Debt Management',
        'financial-planning': 'Financial Planning'
      };
      
      const moduleTopic = module && moduleNames[module] ? moduleNames[module] : (topic || 'Financial Literacy');
      
      // If notes provided, generate quiz based on notes content with module specificity
      let questions;
      if (notes) {
        questions = await geminiService.generateQuizFromNotes(notes, moduleTopic, module);
      } else {
        questions = await geminiService.generateQuiz(moduleTopic, module);
      }
      
      logger.info(`Quiz generated for module: ${module || 'unknown'}, topic: ${moduleTopic}`);
      res.json({ questions });
    } catch (error) {
      logger.error(`Generate quiz error: ${error.message}`);
      res.status(500).json({ error: 'Failed to generate quiz' });
    }
  }
  
  // Save quiz result
  async saveQuizResult(req, res) {
    try {
      const { topic, score, totalQuestions, answers } = req.body;
      
      const quizHistory = await prisma.quizHistory.create({
        data: {
          userId: req.userId,
          topic,
          score,
          totalQuestions,
          answers: JSON.stringify(answers)
        }
      });
      
      logger.info(`Quiz result saved: ${quizHistory.id}`);
      res.status(201).json({ quizHistory });
    } catch (error) {
      logger.error(`Save quiz result error: ${error.message}`);
      res.status(500).json({ error: 'Failed to save quiz result' });
    }
  }
  
  // Get quiz history
  async getQuizHistory(req, res) {
    try {
      const quizzes = await prisma.quizHistory.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      
      res.json({ quizzes });
    } catch (error) {
      logger.error(`Get quiz history error: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
  }
  
  // Chat with mentor
  async chatWithMentor(req, res) {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Get recent chat history
      const chatHistory = await prisma.chatMessage.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      
      const reversedHistory = chatHistory.reverse();
      
      // Add current user message
      const userMessage = await prisma.chatMessage.create({
        data: {
          userId: req.userId,
          role: 'user',
          content: message
        }
      });
      
      // Get AI response
      const conversation = [...reversedHistory.map(m => ({
        role: m.role,
        content: m.content
      })), {
        role: 'user',
        content: message
      }];
      
      const aiResponse = await geminiService.chatWithMentor(conversation);
      
      // Save AI response
      const assistantMessage = await prisma.chatMessage.create({
        data: {
          userId: req.userId,
          role: 'assistant',
          content: aiResponse
        }
      });
      
      logger.info(`Mentor chat: User ${req.userId}`);
      res.json({
        messages: [
          {
            id: userMessage.id,
            role: 'user',
            content: message,
            createdAt: userMessage.createdAt
          },
          {
            id: assistantMessage.id,
            role: 'assistant',
            content: aiResponse,
            createdAt: assistantMessage.createdAt
          }
        ]
      });
    } catch (error) {
      logger.error(`Chat with mentor error: ${error.message}`);
      res.status(500).json({ error: 'Failed to get mentor response' });
    }
  }
  
  // Get chat history
  async getChatHistory(req, res) {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'asc' },
        take: 100
      });
      
      res.json({ messages });
    } catch (error) {
      logger.error(`Get chat history error: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  }
}

module.exports = new AIController();

