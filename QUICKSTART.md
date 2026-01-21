# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🎯 Prerequisites
- Node.js 18+
- Google Gemini API key: https://makersuite.google.com/app/apikey

## 🚀 Quick Setup

### 1. Backend Setup (Terminal 1)
```bash
cd backend
npm install
cp env.example .env
```
Edit `.env` and add your GEMINI_API_KEY:
```env
GEMINI_API_KEY="your-key-here"
JWT_SECRET="change-this-to-random-string-min-32-chars"
```

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 2. Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
cp env.example .env
npm run dev
```

### 3. Open Browser
Go to: **http://localhost:3000**

### 4. Create Account
- Click "Sign up"
- Enter email and password
- Start using the app!

## ✅ Verify It's Working
1. ✅ Login page loads
2. ✅ Can create account
3. ✅ Dashboard shows after login
4. ✅ Can add an expense
5. ✅ Can generate a quiz
6. ✅ Can chat with AI mentor

## 🆘 Common Issues

**Backend won't start?**
- Check if GEMINI_API_KEY is set
- Make sure port 5000 is free

**Frontend shows "Cannot connect"?**
- Check backend is running
- Verify NEXT_PUBLIC_API_URL in frontend/.env

**Database error?**
- Run: `cd backend && npx prisma migrate dev`

## 📚 More Help
- Detailed guide: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Project docs: [README.md](README.md)
- Task list: [docs/tasks.md](docs/tasks.md)

**Ready to build! 🚀**

