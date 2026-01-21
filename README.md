# 💰 Interactive Financial Literacy & AI Finance Mentor Platform

A full-stack web application built with Next.js, Express, and Google Gemini AI to help users manage finances, learn financial literacy, and make informed financial decisions.

## 🌟 Features

### 💼 Financial Management
- **Expense Tracking**: Add, view, and categorize expenses
- **Budget Management**: Create budgets by category with utilization tracking
- **Financial Goals**: Set and track progress toward financial objectives
- **Group Expenses**: Split expenses with friends and family
- **Calculators**: EMI and SIP calculators for loan planning and investments

### 🤖 AI-Powered Features
- **AI Finance Mentor**: Chat-based financial advisor using Google Gemini
- **Quiz Generator**: Generate personalized financial literacy quizzes
- **Scam Detector**: Analyze suspicious messages for potential scams

### 🎨 User Experience
- Modern, responsive UI with Tailwind CSS
- Real-time data updates
- Intuitive dashboard with visual analytics
- Secure authentication with JWT
- Persistent state management with Zustand

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT + bcrypt
- **AI Integration**: Google Gemini API

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd interactive-finance-ai
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   ```
   
   Edit `backend/.env` with your credentials:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-strong-secret-key-here"
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=5000
   NODE_ENV=development
   ```
   
   Generate Prisma client and migrate database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
   
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp env.example .env
   ```
   
   Edit `frontend/.env`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
   
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Open the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## 📖 Usage

### Getting Started
1. Sign up for a new account
2. Log in to access the dashboard
3. Start tracking your expenses
4. Create budgets for different categories
5. Set financial goals
6. Try the AI mentor for financial advice
7. Generate quizzes to test your knowledge
8. Use the scam detector to verify suspicious messages

### Features Overview

#### Dashboard
- View financial overview
- Quick access to all features
- Recent activity summary

#### Expense Tracker
- Add expenses by category
- View spending history
- Filter by date and category

#### Budget Manager
- Create budgets by category
- Track utilization with visual progress bars
- Get warnings when approaching budget limits

#### Goal Planner
- Set financial goals with target dates
- Track progress visually
- Update current savings
- Celebrate when goals are achieved

#### AI Mentor
- Ask financial questions
- Get personalized advice
- View conversation history

#### Learn Module
- Generate quizzes on any financial topic
- Answer multiple-choice questions
- View results and explanations

#### Calculators
- **EMI Calculator**: Calculate loan EMI, total interest
- **SIP Calculator**: Project SIP maturity value and returns

#### Scam Detector
- Analyze suspicious messages
- Get AI-powered fraud detection
- View confidence scores and explanations

## 📁 Project Structure

```
interactive-finance-ai/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── controllers/           # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── financeController.js
│   │   │   ├── aiController.js
│   │   │   ├── scamController.js
│   │   │   └── groupExpenseController.js
│   │   ├── middleware/            # Middleware functions
│   │   │   ├── auth.js           # JWT authentication
│   │   │   └── validation.js     # Input validation
│   │   ├── routes/               # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── finance.routes.js
│   │   │   ├── ai.routes.js
│   │   │   ├── scam.routes.js
│   │   │   └── group.routes.js
│   │   ├── services/             # Business logic
│   │   │   ├── geminiService.js  # Gemini AI integration
│   │   │   └── financeCalculator.js
│   │   └── utils/                # Utilities
│   │       ├── logger.js
│   │       ├── errorHandler.js
│   │       └── validators.js
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── app/                      # Next.js app directory
│   │   ├── layout.js            # Root layout
│   │   ├── page.js              # Landing page
│   │   ├── globals.css          # Global styles
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── dashboard/           # Dashboard page
│   │   ├── expenses/            # Expenses page
│   │   ├── budgets/             # Budgets page
│   │   ├── goals/               # Goals page
│   │   ├── mentor/              # AI mentor page
│   │   ├── learn/               # Quiz page
│   │   ├── scam-detector/       # Scam detector page
│   │   ├── calculators/         # Calculators page
│   │   └── group-expenses/      # Group expenses page
│   ├── components/
│   │   └── Layout.js            # Main layout component
│   ├── store/                   # Zustand stores
│   │   ├── authStore.js         # Auth state
│   │   ├── financeStore.js      # Finance state
│   │   └── aiStore.js           # AI state
│   ├── utils/
│   │   ├── api.js               # Axios setup
│   │   └── formatters.js        # Formatting utilities
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
├── docs/
│   └── tasks.md                 # Detailed task list
└── README.md

```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Finance
- `POST /api/finance/expenses` - Create expense
- `GET /api/finance/expenses` - Get expenses
- `DELETE /api/finance/expenses/:id` - Delete expense
- `POST /api/finance/budgets` - Create budget
- `GET /api/finance/budgets` - Get budgets
- `DELETE /api/finance/budgets/:id` - Delete budget
- `POST /api/finance/goals` - Create goal
- `GET /api/finance/goals` - Get goals
- `PATCH /api/finance/goals/:id/progress` - Update goal progress
- `POST /api/finance/calculators/emi` - Calculate EMI
- `POST /api/finance/calculators/sip` - Calculate SIP

### AI Features
- `POST /api/ai/quiz/generate` - Generate quiz
- `POST /api/ai/quiz/save` - Save quiz result
- `GET /api/ai/quiz/history` - Get quiz history
- `POST /api/ai/mentor/chat` - Chat with mentor
- `GET /api/ai/mentor/history` - Get chat history

### Scam Detection
- `POST /api/scam/detect` - Analyze message
- `GET /api/scam/history` - Get analysis history

### Group Expenses
- `POST /api/group` - Create group expense
- `GET /api/group` - Get group expenses
- `PATCH /api/group/:expenseId/members/:memberId/paid` - Mark as paid

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation
- SQL injection protection (via Prisma)
- CORS configuration

## 🧪 Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
npx prisma studio  # Database GUI
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Next.js dev server
npm run build  # Production build
npm start  # Start production server
```

## 📝 Database Schema

The application uses Prisma with SQLite for development. The main models are:

- **User**: User accounts and authentication
- **Expense**: Individual expense records
- **Budget**: Monthly/annual budgets by category
- **Goal**: Financial goals and progress
- **GroupExpense**: Group expense records
- **GroupMember**: Members of group expenses
- **QuizHistory**: Completed quizzes
- **ChatMessage**: AI mentor conversations
- **ScamLog**: Scam detection history

See `backend/prisma/schema.prisma` for complete schema.

## 🚢 Deployment

### Backend Deployment
1. Use a cloud provider (Render, Fly.io, Railway)
2. Set up PostgreSQL or MySQL database
3. Update `DATABASE_URL` in production
4. Set environment variables
5. Run Prisma migrations

### Frontend Deployment
1. Deploy to Vercel or Netlify
2. Set `NEXT_PUBLIC_API_URL` to your backend URL
3. Configure build settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for powerful AI capabilities
- Next.js team for the amazing framework
- Prisma for excellent ORM
- Tailwind CSS for beautiful styling

## 📧 Support

For support, email your-email@example.com or open an issue.

---

**Built with ❤️ for better financial literacy**