// Google Gemini AI service
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.enabled = !!process.env.GEMINI_API_KEY;
    if (this.enabled) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        logger.info('Gemini service initialized');
      } catch (e) {
        logger.error(`Failed to initialize Gemini: ${e.message}`);
        this.enabled = false;
      }
    } else {
      logger.warn('GEMINI_API_KEY not set. Using fallback responses for AI features.');
    }
  }
  
  /**
   * Generate quiz from learning notes content using Gemini API - unique for each module
   */
  async generateQuizFromNotes(notes, moduleTopic, moduleId) {
    try {
      if (!this.enabled) {
        logger.warn('Gemini API not enabled, using fallback quiz');
        return this.getFallbackQuizFromNotes(moduleTopic);
      }

      // Use provided module topic or extract from notes
      const topic = moduleTopic || (() => {
        const topicMatch = notes.match(/#\s+(.+?)\n/);
        return topicMatch ? topicMatch[1] : 'Financial Literacy';
      })();

      // Module-specific context for unique quiz generation
      const moduleContext = {
        'budgeting-101': {
          focus: 'budgeting, income and expense tracking, 50/30/20 rule, financial planning basics',
          examples: 'monthly budgets, expense categories, savings allocation'
        },
        'investing-basics': {
          focus: 'investments, stocks, bonds, mutual funds, SIPs, diversification, compound interest',
          examples: 'investment portfolios, risk management, long-term wealth building'
        },
        'credit-management': {
          focus: 'credit scores, credit cards, loans, interest rates, debt management, credit history',
          examples: 'credit utilization, payment history, credit building strategies'
        },
        'savings-strategies': {
          focus: 'savings techniques, emergency funds, goal-based saving, automated savings',
          examples: 'savings accounts, emergency fund planning, financial goals'
        },
        'debt-management': {
          focus: 'debt payoff strategies, interest rates, debt consolidation, prioritizing debts',
          examples: 'debt snowball method, debt avalanche method, loan management'
        },
        'financial-planning': {
          focus: 'financial goals, retirement planning, insurance, estate planning, comprehensive financial strategy',
          examples: 'financial roadmaps, goal setting, life stage planning'
        }
      };

      const context = moduleId && moduleContext[moduleId] ? moduleContext[moduleId] : {
        focus: 'financial literacy and money management',
        examples: 'practical financial scenarios'
      };

      // Create module-specific, unique prompt for quiz generation
      const prompt = `You are an educational assessment expert specializing in financial literacy. Generate a UNIQUE quiz with 5 multiple choice questions specifically for the "${topic}" module.

MODULE: ${topic}
FOCUS AREAS: ${context.focus}
EXAMPLE TOPICS: ${context.examples}

LEARNING NOTES:
${notes}

CRITICAL REQUIREMENTS FOR UNIQUE QUIZ:
1. **Module-Specific Questions**: Create questions that are SPECIFIC to "${topic}" and cannot be used for other modules
2. **Test Key Concepts**: Cover main concepts and definitions unique to this module
3. **Assess Module Principles**: Include questions about principles and strategies specific to "${topic}"
4. **Practical Module Application**: Test understanding of tips and practices relevant to this module
5. **Module-Specific Scenarios**: Include real-world examples that relate to "${topic}"

IMPORTANT: Make each question UNIQUE to "${topic}" module. Questions should:
- Reference specific concepts, strategies, or examples from "${topic}"
- Use terminology and scenarios specific to this module
- Test understanding that applies specifically to "${topic}"
- NOT be generic financial questions that could apply to any module
- Include module-specific details, numbers, or examples when relevant

Question Distribution:
- Question 1: Basic concept definition specific to "${topic}"
- Question 2: Key principle or strategy from "${topic}"
- Question 3: Practical application of "${topic}" concepts
- Question 4: Common mistake or pitfall in "${topic}"
- Question 5: Real-world scenario or advanced understanding of "${topic}"

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks, just pure JSON):
[
  {
    "question": "Question text specific to ${topic} module and based on the notes",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  }
]

The "correct" field should be the index (0-3) of the correct option. Ensure all questions are UNIQUE to "${topic}" and cannot be used interchangeably with other modules.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from markdown code blocks if present
      let jsonText = text.trim();
      const fenced = text.match(/```(?:json)?[\s\S]*?```/i);
      if (fenced) {
        jsonText = fenced[0].replace(/```(?:json)?/gi, '').replace(/```/gi, '').trim();
      }
      
      // Try to find JSON array in the text
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const quiz = JSON.parse(jsonText);
      
      // Validate quiz structure
      if (!Array.isArray(quiz) || quiz.length === 0) {
        throw new Error('Invalid quiz format returned from AI');
      }
      
      // Ensure all questions have required fields
      const validQuiz = quiz.map((q, idx) => ({
        question: q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: typeof q.correct === 'number' && q.correct >= 0 && q.correct < 4 ? q.correct : 0
      }));
      
      logger.info(`Quiz generated successfully for module "${moduleId || 'unknown'}" (${topic}) via Gemini API (${validQuiz.length} questions)`);
      return validQuiz;
    } catch (error) {
      logger.error(`Error generating quiz from notes via Gemini: ${error.message}`);
      logger.error(`Stack: ${error.stack}`);
      // Return fallback quiz if Gemini fails
      return this.getFallbackQuizFromNotes(moduleTopic);
    }
  }

  /**
   * Fallback quiz when Gemini API fails
   */
  getFallbackQuizFromNotes(moduleTopic = 'Financial Literacy') {
    return [
      {
        question: 'What is the main topic covered in these learning notes?',
        options: [
          'Financial planning and management',
          'Entertainment and leisure',
          'Sports and fitness',
          'Technology and innovation'
        ],
        correct: 0
      },
      {
        question: 'Which of the following is a key principle mentioned in the notes?',
        options: [
          'Spend all income immediately',
          'Track everything and review regularly',
          'Ignore savings and investments',
          'Avoid financial planning'
        ],
        correct: 1
      },
      {
        question: 'According to the notes, what is recommended for financial success?',
        options: [
          'Avoid planning and budgeting',
          'Review regularly and track expenses',
          'Never save money',
          'Ignore all expenses'
        ],
        correct: 1
      },
      {
        question: 'What should be prioritized based on the learning notes?',
        options: [
          'Spending on wants',
          'Emergency fund and savings',
          'Accumulating debt',
          'Ignoring financial goals'
        ],
        correct: 1
      },
      {
        question: 'What common mistake should be avoided according to the notes?',
        options: [
          'Following the practical tips',
          'Not accounting for irregular expenses',
          'Budgeting regularly',
          'Saving money consistently'
        ],
        correct: 1
      }
    ];
  }

  /**
   * Generate a finance quiz on a given topic using Gemini API - unique for each module
   */
  async generateQuiz(topic, moduleId) {
    try {
      if (!this.enabled) {
        logger.warn('Gemini API not enabled, using fallback quiz');
        return this.getFallbackQuizForTopic(topic);
      }

      // Module-specific context for unique quiz generation
      const moduleContext = {
        'budgeting-101': {
          focus: 'budgeting, income and expense tracking, 50/30/20 rule, financial planning basics',
          keyTerms: 'budget, income, expenses, savings allocation, needs vs wants'
        },
        'investing-basics': {
          focus: 'investments, stocks, bonds, mutual funds, SIPs, diversification, compound interest',
          keyTerms: 'investment, portfolio, risk, return, diversification, SIP, mutual fund'
        },
        'credit-management': {
          focus: 'credit scores, credit cards, loans, interest rates, debt management, credit history',
          keyTerms: 'credit score, APR, credit utilization, credit history, credit limit'
        },
        'savings-strategies': {
          focus: 'savings techniques, emergency funds, goal-based saving, automated savings',
          keyTerms: 'emergency fund, savings goal, automated savings, compound interest, savings rate'
        },
        'debt-management': {
          focus: 'debt payoff strategies, interest rates, debt consolidation, prioritizing debts',
          keyTerms: 'debt snowball, debt avalanche, debt consolidation, interest rate, minimum payment'
        },
        'financial-planning': {
          focus: 'financial goals, retirement planning, insurance, estate planning, comprehensive financial strategy',
          keyTerms: 'financial goals, retirement planning, insurance, estate planning, financial roadmap'
        }
      };

      const context = moduleId && moduleContext[moduleId] ? moduleContext[moduleId] : {
        focus: 'financial literacy and money management',
        keyTerms: 'financial planning, money management, personal finance'
      };

      // Create comprehensive, module-specific, unique prompt
      const prompt = `You are a financial education expert. Generate a UNIQUE quiz with 5 multiple choice questions specifically for the "${topic}" module.

MODULE: ${topic}
FOCUS AREAS: ${context.focus}
KEY TERMS: ${context.keyTerms}

CRITICAL REQUIREMENTS FOR UNIQUE QUIZ:
1. **Module-Specific Questions**: Create questions that are SPECIFIC to "${topic}" module
2. **Test Core Concepts**: Cover fundamental concepts unique to "${topic}"
3. **Practical Application**: Include questions testing real-world application of "${topic}" concepts
4. **Key Principles**: Assess understanding of important principles specific to "${topic}"
5. **Module-Specific Scenarios**: Include questions about situations unique to "${topic}"

IMPORTANT: Make each question UNIQUE to "${topic}" module. Questions should:
- Be specific to "${topic}" and NOT generic financial questions
- Use terminology and concepts from "${topic}" focus areas
- Include scenarios and examples relevant only to "${topic}"
- Test understanding that applies specifically to "${topic}"
- NOT be interchangeable with questions from other modules

Question Distribution:
- Question 1: Basic concept definition specific to "${topic}"
- Question 2: Key principle or strategy from "${topic}"
- Question 3: Practical application of "${topic}" concepts
- Question 4: Common mistake or pitfall in "${topic}"
- Question 5: Real-world scenario or advanced understanding of "${topic}"

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks, just pure JSON):
[
  {
    "question": "Question text specific to ${topic} module",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  }
]

The "correct" field should be the index (0-3) of the correct option. Ensure all questions are UNIQUE to "${topic}" and cannot be used for other modules.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from markdown code blocks if present
      let jsonText = text.trim();
      const fenced = text.match(/```(?:json)?[\s\S]*?```/i);
      if (fenced) {
        jsonText = fenced[0].replace(/```(?:json)?/gi, '').replace(/```/gi, '').trim();
      }
      
      // Try to find JSON array in the text
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const quiz = JSON.parse(jsonText);
      
      // Validate quiz structure
      if (!Array.isArray(quiz) || quiz.length === 0) {
        throw new Error('Invalid quiz format returned from AI');
      }
      
      // Ensure all questions have required fields
      const validQuiz = quiz.map((q, idx) => ({
        question: q.question || `Question ${idx + 1} about ${topic}`,
        options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: typeof q.correct === 'number' && q.correct >= 0 && q.correct < 4 ? q.correct : 0
      }));
      
      logger.info(`Quiz generated successfully for module "${moduleId || 'unknown'}" (${topic}) via Gemini API (${validQuiz.length} questions)`);
      return validQuiz;
    } catch (error) {
      logger.error(`Error generating quiz for topic "${topic}" via Gemini: ${error.message}`);
      logger.error(`Stack: ${error.stack}`);
      // Return fallback quiz if Gemini fails
      return this.getFallbackQuizForTopic(topic);
    }
  }

  /**
   * Fallback quiz when Gemini API fails for a topic
   */
  getFallbackQuizForTopic(topic) {
    return [
      {
        question: `What is the main focus of ${topic}?`,
        options: [
          'Financial planning and management',
          'Entertainment activities',
          'Sports and fitness',
          'Technology usage'
        ],
        correct: 0
      },
      {
        question: `Which principle is important in ${topic}?`,
        options: [
          'Spending freely',
          'Regular tracking and review',
          'Ignoring expenses',
          'Avoiding planning'
        ],
        correct: 1
      },
      {
        question: `What is a key strategy in ${topic}?`,
        options: [
          'Avoiding savings',
          'Setting clear goals and tracking progress',
          'Ignoring budgets',
          'Spending everything'
        ],
        correct: 1
      },
      {
        question: `According to ${topic}, what should be prioritized?`,
        options: [
          'Immediate wants',
          'Emergency fund and savings',
          'Unnecessary expenses',
          'Avoiding financial planning'
        ],
        correct: 1
      },
      {
        question: `What is essential for success in ${topic}?`,
        options: [
          'Ignoring financial principles',
          'Consistent tracking and disciplined approach',
          'Avoiding planning',
          'Spending without limits'
        ],
        correct: 1
      }
    ];
  }
  
  /**
   * AI Financial Mentor chat
   */
  async chatWithMentor(messages) {
    try {
      if (!this.enabled) {
        const last = messages[messages.length - 1]?.content || '';
        return `I am your finance mentor. Without live AI, here is general guidance based on your message: "${last.slice(0, 120)}". Build an emergency fund (3-6 months), avoid high-interest debt, budget 50/30/20, and invest regularly in diversified funds.`;
      }
      // Convert chat history to Gemini format
      const chatHistory = messages
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
        .slice(-10); // Last 10 messages for context
      
      const chat = this.model.startChat({ history: chatHistory });
      
      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      logger.error(`Error in mentor chat: ${error.message}`);
      return 'I had trouble generating an answer. Tip: keep expenses < income, automate savings, and invest consistently for long-term growth.';
    }
  }
  
  /**
   * Heuristic scoring for common scam/spam patterns
   */
  scoreHeuristics(message) {
    const text = (message || '').toLowerCase();
    const signals = [];
    const add = (reason, weight) => signals.push({ reason, weight });

    // Prize / lottery / giveaway
    if (/you[\s-]?won|congratulations|winner|prize|lottery|giveaway/.test(text)) add('Prize/Lottery claim', 0.35);
    // Urgency / pressure
    if (/urgent|immediately|within\s?24\s?hours|act now|last chance|limited time/.test(text)) add('Urgency pressure', 0.2);
    // Sensitive info requests
    if (/otp|one[-\s]?time\s?password|password|pin\b|cvv/.test(text)) add('Requests sensitive info (OTP/PIN/CVV)', 0.35);
    // Irreversible payments
    if (/wire transfer|gift card|crypto|bitcoin|usdt|wallet address|send funds|western union/.test(text)) add('Irreversible payment request', 0.3);
    // Unrealistic promises
    if (/(too good to be true|guaranteed returns|100% profit|double your money|get rich)/.test(text)) add('Unrealistic promises', 0.25);
    // Authority + threat combo
    if (/(bank|irs|income tax|government|customs|police|court|visa|immigration)/.test(text) && /(fine|penalty|arrest|suspend|freeze|deactivate)/.test(text)) add('Threat + authority', 0.3);
    // Phishing links
    if (/verify your account|update your account|login here|reset here|confirm your details/.test(text) && /(http|https):\/\//.test(text)) add('Phishing link', 0.25);
    // Loan scam
    if (/pre-approved loan|quick loan|no credit check|processing fee|instant approval/.test(text)) add('Loan scam pattern', 0.2);
    // Investment scam
    if (/investment opportunity|insider|forex|binary options|mlm|crypto scheme/.test(text)) add('Investment scam pattern', 0.2);

    // Tally score
    const score = Math.min(1, signals.reduce((s, a) => s + a.weight, 0));
    let verdict = 'Legitimate / Safe';
    if (score >= 0.6) verdict = 'Likely Scam';
    else if (score >= 0.3) verdict = 'Suspicious';

    return { score, signals, verdict };
  }

  /**
   * Analyze if a message is a scam
   */
  async detectScam(message) {
    try {
      // Always run heuristics first to avoid false "safe"
      const heur = this.scoreHeuristics(message);
      if (!this.enabled) {
        return {
          isScam: heur.verdict !== 'Legitimate / Safe',
          category: heur.verdict === 'Legitimate / Safe' ? null : 'Heuristic flags',
          confidence: Math.max(0.5, heur.score),
          explanation: heur.signals.map(s => s.reason).join('; ') || 'No scam signals detected.'
        };
      }

      // Ask Gemini with stricter rubric
      const prompt = `Role: You are an intelligent Scam & Fraud Detection Assistant trained to analyze text for scams, misleading claims, spam, fraud attempts, phishing, fake financial advice, investment scams, loan scams, job scams, crypto scams, and suspicious messages.

Instructions:
- Do not always respond "safe" — evaluate content meaningfully.
- Analyze tone, promises, urgency, money requests, too-good-to-be-true claims, phishing patterns, emotional manipulation.
- Check for grammar clues, unknown sources, malicious intent, offers, threats, false authority.
- If unsure → mark as Suspicious, not Safe. Be strict — better to flag than miss a scam.

Return ONLY a valid JSON object with this exact structure:
{
  "isScam": true/false,
  "category": "Type of scam if detected or null",
  "confidence": 0.0-1.0,
  "explanation": "Concise explanation"
}

Message to analyze: "${message}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const fenced = text.match(/```json[\s\S]*?```/i);
      const jsonCandidate = fenced ? fenced[0].replace(/```json|```/gi, '') : text;
      const jsonText = jsonCandidate.trim();
      const ai = JSON.parse(jsonText);

      // Merge with heuristic: never downgrade below heuristic risk
      const aiIsScam = !!ai.isScam;
      const finalIsScam = heur.verdict !== 'Legitimate / Safe' ? true : aiIsScam;
      const finalConfidence = Math.max(ai.confidence ?? 0.6, Math.min(0.95, heur.score + 0.2));
      const finalCategory = finalIsScam ? (ai.category || 'Heuristic flags') : null;
      const finalExplanation = [
        ai.explanation || '',
        heur.signals.length ? `Signals: ${heur.signals.map(s => s.reason).join(', ')}` : ''
      ].filter(Boolean).join(' | ');

      return {
        isScam: finalIsScam,
        category: finalCategory,
        confidence: finalConfidence,
        explanation: finalExplanation
      };
    } catch (error) {
      logger.error(`Error detecting scam: ${error.message}`);
      // Fall back to heuristics-only
      const heur = this.scoreHeuristics(message);
      return {
        isScam: heur.verdict !== 'Legitimate / Safe',
        category: heur.verdict === 'Legitimate / Safe' ? null : 'Heuristic flags',
        confidence: Math.max(0.5, heur.score),
        explanation: heur.signals.map(s => s.reason).join('; ') || 'No scam signals detected.'
      };
    }
  }
  
  /**
   * Generate content from a prompt (generic helper)
   */
  async generateContent(prompt) {
    try {
      if (!this.enabled) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from AI');
      }
      
      return text;
    } catch (error) {
      logger.error(`Error generating content: ${error.message}`);
      // Re-throw to let caller handle with fallback
      throw error;
    }
  }

  /**
   * Get personalized financial advice
   */
  async getFinancialAdvice(context) {
    try {
      const prompt = `Based on the following financial context, provide personalized advice in 2-3 sentences.
Context: ${JSON.stringify(context)}
Keep it practical and actionable.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      logger.error(`Error getting financial advice: ${error.message}`);
      throw new Error('Failed to get financial advice');
    }
  }
}

// Export singleton instance
module.exports = new GeminiService();

