# 🔐 Authentication Implementation Guide

This document describes the complete authentication system implementation matching the PDF requirements.

---

## ✅ Implementation Summary

### **PDF Requirements Met:**
1. ✅ User Login & Signup
2. ✅ Email + Password authentication
3. ✅ After login, redirect to Dashboard (role-based)
4. ✅ Demo user login button with credentials
5. ✅ Secure password hashing (bcrypt)
6. ✅ Session management (HTTP-only cookies)
7. ✅ Protected routes (middleware)
8. ✅ Protected APIs (auth guards)

---

## 📁 Routes Added/Updated

### **New Pages:**
- ✅ `/signup` - User registration page
  - Email, password, name, phone (optional)
  - Client-side password confirmation
  - Auto-login after signup
  - Redirect to `/book` for customers, `/dashboard` for staff

- ✅ `/login` - User login page (updated)
  - Email + password form
  - Demo login button
  - Link to signup page
  - Displays demo credentials

### **New API Routes:**
- ✅ `POST /api/auth/signup` - User registration
  - Validates input with Zod
  - Checks for duplicate emails
  - Hashes password with bcrypt
  - Creates user with role: CUSTOMER
  - Returns 409 if email exists

### **Updated API Routes:**
- ✅ `POST /api/auth` - Login (already existed, working)
- ✅ `DELETE /api/auth` - Logout (already existed)
- ✅ `GET /api/auth` - Get session (already existed)
- ✅ `POST /api/appointments` - Now requires authentication
- ✅ `POST /api/queue` - Now requires authentication

### **Updated Middleware:**
- ✅ `src/proxy.ts`
  - Changed to named export: `export function proxy()`
  - Added protected routes: `/book-new`, `/queue-new`, `/dashboard`
  - Explicitly allows: `/`, `/login`, `/signup`, `/api/auth/*`
  - Redirects unauthenticated users to `/login?redirect={pathname}`

---

## 🗄️ Database Changes

### **User Schema:**
Already exists in `src/lib/db/models/user.model.ts`:
```typescript
{
  _id: ObjectId,
  email: string (lowercase),
  passwordHash: string,
  name: string,
  phone?: string,
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER',
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt?: Date
}
```

### **Indexes Created:**
Run `npm run setup-db` to create:
- ✅ Unique index on `email` (prevents duplicates)
- ✅ Compound index on `role + isActive` (fast lookups)
- ✅ Performance indexes on appointments, queue, services, audit logs

---

## 🌱 Seeding Strategy

### **Database Setup (One-time):**
```bash
npm run setup-db
```
**What it does:**
- Creates unique email index
- Creates performance indexes
- Idempotent (safe to run multiple times)
- Does NOT run during build (manual only)

### **Seed Demo User:**
```bash
npm run seed
```
**What it does:**
- Creates admin user if none exists
- Email: `admin@smartqueue.com`
- Password: `admin123`
- Role: `ADMIN`
- Idempotent (checks if admin exists first)
- Does NOT run during build (manual only)

### **Why Seeding Won't Break Build:**
- Seeds are manual scripts, not part of `npm run build`
- Use `npx tsx` to run TypeScript directly
- Connect to database only when explicitly invoked
- No automatic seeding on deployment

---

## 🔒 Security Implementation

### **1. Page Protection (Middleware):**
**File:** `src/proxy.ts`

**Protected Routes:**
- `/book`, `/book-new`
- `/queue`, `/queue-new`
- `/dashboard` (and all sub-routes)
- `/dashboard`

**Public Routes:**
- `/` (landing page)
- `/login`
- `/signup`
- `/api/auth/*` (login, signup, session)
- Static files (`_next/static`, `_next/image`, etc.)

**How it works:**
1. Proxy intercepts every request before rendering
2. Checks if route is protected
3. Validates session cookie
4. Redirects to `/login?redirect={path}` if invalid
5. Allows request if session valid

### **2. API Protection:**
**Files:** All API routes in `src/app/api/**/route.ts`

**Protected APIs:**
- ✅ `POST /api/appointments` → `requireAuth()`
- ✅ `GET /api/appointments` → `requireStaff()`
- ✅ `POST /api/queue` → `requireAuth()`
- ✅ `GET /api/queue` → `requireStaff()`
- ✅ `POST /api/queue/next` → `requireStaff()`
- ✅ `GET /api/audit-logs` → `requireStaff()`
- ✅ `GET /api/users` → `requireAdmin()`
- ✅ `POST /api/users` → `requireAdmin()`
- ✅ All user CRUD → `requireAdmin()`

**Public APIs:**
- ✅ `GET /api/services` (needed for booking form)
- ✅ `GET /api/health` (monitoring)
- ✅ `POST /api/auth` (login)
- ✅ `POST /api/auth/signup` (registration)

**How it works:**
```typescript
// Inside API route handler:
const user = await requireAuth(); // Throws if no session
// or
const user = await requireStaff(); // Throws if not staff/dashboard
// or
const user = await requireAdmin(); // Throws if not admin
```

Returns 401 if authentication fails.

### **3. Session Management:**
**File:** `src/lib/auth/session.ts`

**Features:**
- ✅ HTTP-only cookies (not accessible via JavaScript)
- ✅ Base64-encoded payload (userId + createdAt)
- ✅ 7-day expiration
- ✅ Secure flag in production
- ✅ SameSite: 'lax' (CSRF protection)

**Session Structure:**
```typescript
{
  userId: string,
  createdAt: number
}
```
Base64-encoded, NOT encrypted (consider JWT for production).

---

## 📋 Setup Instructions

### **1. Initial Setup (First Time):**
```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.local.example .env.local
# Edit .env.local with your MongoDB credentials

# 3. Create database indexes
npm run setup-db

# 4. Seed demo user
npm run seed

# 5. Run development server
npm run dev
```

### **2. Testing Authentication:**
```bash
# Visit http://localhost:3000/login

# Option 1: Demo Login
Click "Demo Login (Admin)" button
→ Should redirect to /dashboard dashboard

# Option 2: Manual Login
Email: admin@smartqueue.com
Password: admin123
→ Should redirect to /dashboard dashboard

# Option 3: Create New Account
Click "Sign Up"
Fill form with your details
→ Should auto-login and redirect to /book
```

### **3. Testing Protection:**
```bash
# Test protected page (should redirect to login):
curl http://localhost:3000/dashboard
→ Expect: 307 redirect to /login

# Test protected API (should return 401):
curl http://localhost:3000/api/appointments
→ Expect: 401 Unauthorized

# Test public API (should work):
curl http://localhost:3000/api/services
→ Expect: 200 OK + data
```

---

## ✅ Compliance Checklist

### **PDF Requirements:**
- [x] User can register (signup page)
- [x] User can log in (login page)
- [x] Email + Password authentication
- [x] After login, redirect to Dashboard (role-based routing)
- [x] Demo user login button on login page
- [x] Demo credentials displayed on UI

### **Security Requirements:**
- [x] All pages protected except login/signup
- [x] All business APIs protected
- [x] Passwords hashed with bcrypt (salt rounds: 10)
- [x] Sessions stored in HTTP-only cookies
- [x] No passwords in client code
- [x] 401 returned for unauthenticated API calls
- [x] Unique email constraint (database index)
- [x] Input validation with Zod

### **Architecture Requirements:**
- [x] Next.js App Router
- [x] TypeScript strict mode
- [x] MongoDB native driver
- [x] No localStorage for auth
- [x] Server-side session validation
- [x] Middleware for route protection

### **Deployment Safety:**
- [x] Seeding doesn't run on build
- [x] Database setup is manual
- [x] Environment variables required
- [x] No hardcoded credentials (except demo user seed)
- [x] Idempotent seed scripts

---

## 🔧 Troubleshooting

### **Issue: "Demo login failed"**
**Solution:**
```bash
npm run seed
```
This creates the admin user in the database.

### **Issue: "Email already registered"**
**Solution:**
This is correct behavior. Each email can only be used once.

### **Issue: "Cannot access /dashboard without login"**
**Solution:**
This is correct behavior. Middleware is protecting the route.

### **Issue: "Signup returns 500 error"**
**Solution:**
Run `npm run setup-db` to create the unique email index.

### **Issue: "Middleware not working"**
**Solution:**
Ensure `src/proxy.ts` exists and uses named export:
```typescript
export function proxy(request: NextRequest) { ... }
```

---

## 📊 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Journey                          │
└─────────────────────────────────────────────────────────┘

1. New User:
   Visit /signup
   → Fill form
   → POST /api/auth/signup
   → User created in DB
   → Session cookie set
   → Redirect to /book

2. Existing User (Manual Login):
   Visit /login
   → Fill credentials
   → POST /api/auth
   → Verify password
   → Session cookie set
   → Redirect to /dashboard or /

3. Existing User (Demo Login):
   Visit /login
   → Click "Demo Login"
   → POST /api/auth (admin@smartqueue.com)
   → Session cookie set
   → Redirect to /dashboard

4. Protected Page Access:
   Visit /dashboard
   → Middleware intercepts
   → Check session cookie
   → Valid? → Allow access
   → Invalid? → Redirect to /login?redirect=/dashboard

5. Protected API Call:
   POST /api/appointments
   → requireAuth() checks session
   → Valid? → Process request
   → Invalid? → Return 401
```

---

## 🎯 Next Steps

1. **Enhance Security (Optional):**
   - Replace Base64 tokens with JWT (signed)
   - Add refresh tokens
   - Implement rate limiting on login
   - Add CSRF tokens

2. **User Experience:**
   - Password reset flow
   - Email verification
   - Remember me checkbox
   - Social login (Google, etc.)

3. **Admin Features:**
   - User management UI
   - Role assignment
   - Activity logs

---

## 📝 Notes

- Demo credentials are displayed on login page (as per PDF)
- Passwords are NEVER sent to client (only hashes stored in DB)
- Session cookies are HTTP-only (not accessible via JavaScript)
- Middleware uses named export `proxy` (Next.js 16 convention)
- All database operations are lazy (connect only when needed)

