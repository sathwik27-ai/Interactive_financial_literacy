# 🔧 Troubleshooting Guide

## Signup Failed Issues

### Issue: "Failed to create user"

#### Possible Causes & Solutions:

### 1. Prisma Client Not Generated
**Symptom:** Database errors in backend logs

**Solution:**
```bash
cd backend
npx prisma generate
```

### 2. Database Not Migrated
**Symptom:** Table doesn't exist errors

**Solution:**
```bash
cd backend
npx prisma migrate dev --name init
```

### 3. Missing Environment Variables
**Symptom:** JWT errors or database connection errors

**Solution:**
1. Check `backend/.env` exists
2. Verify these variables are set:
   ```
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key-here"
   GEMINI_API_KEY="your-gemini-key"
   PORT=5000
   NODE_ENV=development
   ```

### 4. Backend Not Running
**Symptom:** Network errors in frontend

**Solution:**
```bash
cd backend
npm run dev
```
Should see: "Server running on port 5000"

### 5. CORS Issues
**Symptom:** Request blocked by CORS policy

**Solution:**
1. Check backend is running
2. Verify frontend/.env has: `NEXT_PUBLIC_API_URL=http://localhost:5000`
3. Restart both servers

### 6. Bcrypt Installation Issue
**Symptom:** Module not found: bcrypt

**Solution:**
```bash
cd backend
npm install bcrypt
```

### 7. Database File Permissions
**Symptom:** Cannot write to database

**Solution:**
```bash
cd backend
rm prisma/dev.db
npx prisma migrate dev --name init
```

## Complete Reset

If nothing works, do a complete reset:

```bash
# Backend reset
cd backend
rm -rf node_modules
rm -rf prisma/dev.db
rm -rf prisma/migrations
npm install
npx prisma migrate dev --name init
cp env.example .env
# Edit .env with your keys
npm run dev

# Frontend reset (in another terminal)
cd frontend
rm -rf node_modules
rm -rf .next
npm install
cp env.example .env
npm run dev
```

## Check Backend Logs

Watch backend terminal for errors:
- Prisma errors
- JWT errors
- Validation errors
- Database connection errors

## Test Backend Directly

Use Postman or curl to test:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

Should return user object on success.

## Common Error Messages

### "Cannot find module '@prisma/client'"
**Fix:** `cd backend && npx prisma generate`

### "Table User does not exist"
**Fix:** `cd backend && npx prisma migrate dev`

### "Invalid prisma.user.findUnique() invocation"
**Fix:** `cd backend && npx prisma generate && npm run dev`

### "Authentication failed"
**Fix:** Check JWT_SECRET in backend/.env

### "Network Error"
**Fix:** Check backend is running and frontend NEXT_PUBLIC_API_URL

## Still Not Working?

1. **Check browser console** - Look for API errors
2. **Check backend terminal** - Look for server errors
3. **Verify .env files** - Both frontend and backend
4. **Restart everything** - Kill all processes and restart

---

**Need more help?** Check backend/server logs for detailed error messages.

