# Authentication Setup Guide

## Overview
This application uses NextAuth.js v5 (beta) for authentication with email/password credentials.

## Environment Variables
Add the following to your `.env` file:

```env
# NextAuth Secret (required)
# Generate a random string for this (you can use: openssl rand -base64 32)
AUTH_SECRET=your-secret-key-here

# Database URL (already configured)
DATABASE_URL="your-database-url"
```

## Setup Steps

### 1. Generate AUTH_SECRET
Run this command to generate a random secret:
```bash
openssl rand -base64 32
```

Or use any random string generator. Add it to your `.env` file.

### 2. Run Database Migration
Run the migration to add the password field to the User model:
```bash
npx prisma migrate deploy
```

Or if you're in development:
```bash
npx prisma migrate dev
```

### 3. Create Test Users
Visit `/api/dev/seed` to create test users:
- Email: `alice@example.com`, Password: `password123`
- Email: `bob@example.com`, Password: `password123`
- Email: `charlie@example.com`, Password: `password123`

### 4. Sign Up New Users
Users can sign up at `/signup` to create new accounts.

### 5. Sign In
Users can sign in at `/login` with their email and password.

## Features
- ✅ Email/password authentication
- ✅ User signup
- ✅ User login
- ✅ Protected routes (all routes except `/login`, `/signup`, `/dev`, and `/api/auth`)
- ✅ Session management
- ✅ Logout functionality
- ✅ User header with name/email display

## User Roles
- `USER` - Default role for all users
- `ADMIN` - Admin role (can be assigned manually in database)

## Next Steps
1. Implement "My Tasks" dashboard (filtered by logged-in user)
2. Add user invitations
3. Add email verification
4. Add password reset functionality

