# 🔧 Fix Authentication Issue

## Problem
The backend is rejecting task creation because it cannot validate the Supabase JWT token.

## Root Cause
The `JWT_SECRET` in `backend/.env` is a random string, but it needs to be your **Supabase Project's JWT Secret** to validate tokens issued by Supabase Auth.

## Solution Steps

### 1. Get Your Supabase JWT Secret

1. Go to: https://supabase.com/dashboard
2. Select your project: `kvyngafdkcvmjhatwdab`
3. Click on **Project Settings** (⚙️ gear icon in the sidebar)
4. Navigate to **API** section
5. Find **JWT Settings** section
6. Copy the **JWT Secret** (a long base64-encoded string)

### 2. Update Backend .env File

Open `backend/.env` and replace the `JWT_SECRET` line with your actual Supabase JWT Secret:

```env
# Before (WRONG - random string):
JWT_SECRET=lJBoTDT6Jabzo+tHTcIV+qsu9fwNAlMl6aCUkjmOw8hOuhimclcXBfqCreH7FLA4INQInCXJBFiJyvBdVtFWfw==

# After (CORRECT - your Supabase JWT Secret):
JWT_SECRET=your-actual-supabase-jwt-secret-here
```

### 3. Restart Backend Server

After updating the .env file:

```bash
cd backend

# Stop the current server (Ctrl+C if running)

# Restart it
go run main.go
```

### 4. Test Task Creation

Now try creating a task again in the frontend - it should work!

## Alternative: Quick Test

You can also verify by checking your Supabase project settings:
- The JWT Secret is used to sign all auth tokens
- It's typically 64+ characters long
- It's different from the ANON_KEY and SERVICE_ROLE_KEY

## Why This Happens

The backend uses JWT middleware to validate tokens from the frontend. When a user logs in via Supabase:
1. Supabase Auth issues a JWT token signed with the project's JWT Secret
2. Frontend sends this token to backend in Authorization header
3. Backend tries to validate using its JWT_SECRET
4. If the secrets don't match → "Invalid or expired token" error ❌
5. If secrets match → Token validated successfully ✅
