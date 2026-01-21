# 🚀 Interactive Finance AI - Setup Guide

This guide will walk you through setting up the project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd interactive-finance-ai
```

## Step 2: Set Up Backend

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp env.example .env
```

Edit the `.env` file with your actual values:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret - Use a strong random string
JWT_SECRET="change-this-to-a-random-secret-key-min-32-characters-long"

# Google Gemini API Key - Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY="your-actual-gemini-api-key-here"

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

**Important:** 
- Replace `JWT_SECRET` with a strong random string (at least 32 characters)
- Replace `GEMINI_API_KEY` with your actual Google Gemini API key

### 2.3 Set Up Database

Generate Prisma client:
```bash
npx prisma generate
```

Create database and run migrations:
```bash
npx prisma migrate dev --name init
```

### 2.4 Start Backend Server

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

You can verify it's running by visiting: `http://localhost:5000/health`

## Step 3: Set Up Frontend

### 3.1 Install Dependencies

Open a **new terminal window** and navigate to the project root:

```bash
cd frontend
npm install
```

### 3.2 Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cp env.example .env
```

Edit the `.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Important:** Make sure the port matches your backend PORT.

### 3.3 Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

Open your browser and navigate to: `http://localhost:3000`

## Step 4: Verify Installation

1. Open `http://localhost:3000` in your browser
2. You should see the login page
3. Click "Sign up" to create a new account
4. After signing up, you'll be logged in automatically
5. You should see the dashboard

## Step 5: Test Features

### Test Authentication
- ✅ Sign up with a new email
- ✅ Log out and log back in
- ✅ Try accessing dashboard without login (should redirect to login)

### Test Expense Tracking
- ✅ Add a few expenses
- ✅ View expenses list
- ✅ Delete an expense

### Test Budget Management
- ✅ Create a budget
- ✅ Add expenses in that category
- ✅ Check budget utilization

### Test Goals
- ✅ Create a financial goal
- ✅ Update progress

### Test AI Features
- ✅ Generate a quiz on "Budgeting" or "Investing"
- ✅ Chat with the AI mentor
- ✅ Test the scam detector with a suspicious message

### Test Calculators
- ✅ Calculate EMI for a loan
- ✅ Calculate SIP returns

## Troubleshooting

### Backend Issues

**Problem:** `Cannot find module '@prisma/client'`
**Solution:** Run `npx prisma generate` in the backend directory

**Problem:** Port 5000 is already in use
**Solution:** Change PORT in backend/.env to another port (e.g., 5001), and update frontend/.env accordingly

**Problem:** Database migration fails
**Solution:** Delete the `dev.db` file in the backend directory and run `npx prisma migrate dev --name init` again

**Problem:** JWT authentication errors
**Solution:** Make sure JWT_SECRET in backend/.env is set and not empty

### Frontend Issues

**Problem:** `Cannot connect to API`
**Solution:** 
- Make sure backend server is running
- Check NEXT_PUBLIC_API_URL in frontend/.env matches backend PORT
- Check CORS settings in backend/src/app.js

**Problem:** Page shows blank or errors
**Solution:** 
- Check browser console for errors
- Make sure all dependencies are installed: `npm install`
- Try clearing browser cache

**Problem:** Styling looks broken
**Solution:** 
- Make sure Tailwind CSS is compiled: restart dev server
- Check if postcss.config.js exists

### Database Issues

**Problem:** Want to view/modify database
**Solution:** Run `npx prisma studio` in the backend directory. This opens a GUI.

**Problem:** Need to reset database
**Solution:** Delete `backend/dev.db` and run `npx prisma migrate dev --name init`

### Gemini AI Issues

**Problem:** Quiz generation fails
**Solution:** 
- Verify GEMINI_API_KEY is correct in backend/.env
- Check API quotas at Google AI Studio

**Problem:** "Failed to generate quiz"
**Solution:** 
- Check internet connection
- Verify Gemini API key is valid
- Check backend logs for detailed error

## Development Workflow

### Running Both Servers

You need **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Making Code Changes

- **Backend:** Changes are auto-reloaded by nodemon
- **Frontend:** Changes are hot-reloaded by Next.js

### Database Changes

If you modify the Prisma schema:

1. Update `backend/prisma/schema.prisma`
2. Generate client: `npx prisma generate`
3. Create migration: `npx prisma migrate dev --name description-of-change`

### Viewing Logs

- **Backend:** Logs appear in terminal running `npm run dev`
- **Frontend:** Check browser console (F12)

## Next Steps

Once everything is working:

1. 📖 Read the [README.md](README.md) for feature overview
2. 📚 Check [docs/tasks.md](docs/tasks.md) for project details
3. 🎨 Customize the UI and branding
4. 🚀 Deploy to production when ready

## Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review error messages in terminal/browser console
3. Check the docs/ folder for more information
4. Verify all environment variables are set correctly

## Production Deployment

For production deployment:

1. Use PostgreSQL instead of SQLite
2. Update DATABASE_URL to production database
3. Set NODE_ENV=production
4. Use strong, random JWT_SECRET
5. Configure CORS properly
6. Deploy frontend to Vercel
7. Deploy backend to Render/Fly.io

See README.md for deployment instructions.

---

**Happy coding! 🎉**

