# 🔐 AUTHENTICATION & AUTHORIZATION AUDIT

## Current State Analysis (Before NextAuth Implementation)

### 📄 PAGES - Current Accessibility

| Route | Page | Current Access | Should Be |
|-------|------|----------------|-----------|
| `/` | Home/Landing | ✅ Public | ✅ Public (Correct) |
| `/login` | Login | ✅ Public | ✅ Public (Correct) |
| `/book` | Book Appointment | ⚠️ **PUBLIC** | 🔒 **PROTECTED** |
| `/queue` | Queue Status/Join | ⚠️ **PUBLIC** | 🔒 **PROTECTED** |
| `/admin` | Admin Dashboard | ⚠️ **PUBLIC** | 🔒 **ADMIN ONLY** |
| `/admin/services` | Service Management | ⚠️ **PUBLIC** | 🔒 **ADMIN ONLY** |
| `/admin/staff` | Staff Management | ⚠️ **PUBLIC** | 🔒 **ADMIN ONLY** |
| `/admin/activity` | Activity Log | ⚠️ **PUBLIC** | 🔒 **STAFF+ ONLY** |

**Issue:** All pages except login are currently accessible without authentication!

---

### 🔌 API ROUTES - Current Accessibility

#### ✅ Public APIs (No Auth Required - Correct)
| Route | Purpose | Current | Should Be |
|-------|---------|---------|-----------|
| `GET /api/health` | Health check | Public | ✅ Public |
| `GET /api/services` | List services | Public | ✅ Public (for booking) |
| `GET /api/services/:id` | Service details | Public | ✅ Public (for booking) |
| `GET /api/services/:id/slots` | Available slots | Public | ✅ Public (for booking) |

#### ⚠️ UNPROTECTED APIs (Currently Public - MUST PROTECT)
| Route | Purpose | Current | Should Be |
|-------|---------|---------|-----------|
| `POST /api/appointments` | Create appointment | ⚠️ **PUBLIC** | 🔒 **AUTH REQUIRED** |
| `GET /api/appointments` | List appointments | ⚠️ **PUBLIC** | 🔒 **STAFF+ ONLY** |
| `GET /api/appointments/:id` | Get appointment | ⚠️ **PUBLIC** | 🔒 **OWNER or STAFF+** |
| `PATCH /api/appointments/:id` | Update appointment | ⚠️ **PUBLIC** | 🔒 **STAFF+ ONLY** |
| `DELETE /api/appointments/:id` | Cancel appointment | ⚠️ **PUBLIC** | 🔒 **OWNER or STAFF+** |
| `POST /api/queue` | Join queue | ⚠️ **PUBLIC** | 🔒 **AUTH REQUIRED** |
| `GET /api/queue` | List queue | ⚠️ **PUBLIC** | 🔒 **STAFF+ ONLY** |
| `GET /api/queue/:id` | Get queue entry | ⚠️ **PUBLIC** | 🔒 **OWNER or STAFF+** |
| `PATCH /api/queue/:id` | Update queue entry | ⚠️ **PUBLIC** | 🔒 **STAFF+ ONLY** |
| `POST /api/queue/next` | Call next in queue | ⚠️ **PUBLIC** | 🔒 **STAFF+ ONLY** |

#### 🔒 Already Protected APIs (Has Auth Check)
| Route | Purpose | Protection |
|-------|---------|------------|
| `GET /api/users` | List users | ✅ Admin only |
| `POST /api/users` | Create user | ✅ Admin only |
| `GET /api/users/:id` | Get user | ✅ Admin only |
| `PATCH /api/users/:id` | Update user | ✅ Admin only |
| `DELETE /api/users/:id` | Delete user | ✅ Admin only |
| `GET /api/audit-logs` | Activity logs | ✅ Staff+ only |

---

## 🎯 PDF REQUIREMENTS ANALYSIS

Based on the Smart Appointment & Queue Manager requirements:

### Pages That MUST Be Protected

1. **Appointment Booking** (`/book`)
   - PDF Requirement: "Customers book appointments"
   - **Requires:** Authenticated customer or any logged-in user
   - **Reason:** Need customer identity for tracking

2. **Queue Management** (`/queue`)
   - PDF Requirement: "Join queue, view position"
   - **Requires:** Authenticated user
   - **Reason:** Need identity to track position

3. **Admin Dashboard** (`/admin`)
   - PDF Requirement: "Admin manages system"
   - **Requires:** Admin or Staff role
   - **Reason:** Administrative functions

4. **Service Management** (`/admin/services`)
   - PDF Requirement: "Configure services"
   - **Requires:** Admin role only
   - **Reason:** System configuration

5. **Staff Management** (`/admin/staff`)
   - PDF Requirement: "Manage users"
   - **Requires:** Admin role only
   - **Reason:** User management

6. **Activity Log** (`/admin/activity`)
   - PDF Requirement: "Audit trail"
   - **Requires:** Staff or Admin role
   - **Reason:** Security audit

### Pages That Can Remain Public

1. **Home/Landing** (`/`)
   - Information only
   - Links to login/book

2. **Login** (`/login`)
   - Entry point for authentication

---

## 🔑 AUTHENTICATION REQUIREMENTS

### User Roles (From PDF)
- **CUSTOMER**: Book appointments, join queue
- **STAFF**: View activity, manage appointments/queue
- **ADMIN**: Full system access

### Access Control Matrix

| Feature | CUSTOMER | STAFF | ADMIN |
|---------|----------|-------|-------|
| View services (public) | ✅ | ✅ | ✅ |
| Book appointment | ✅ | ✅ | ✅ |
| Join queue | ✅ | ✅ | ✅ |
| View own appointments | ✅ | ✅ | ✅ |
| View all appointments | ❌ | ✅ | ✅ |
| Manage appointments | ❌ | ✅ | ✅ |
| Manage queue | ❌ | ✅ | ✅ |
| View activity log | ❌ | ✅ | ✅ |
| Manage services | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## 🚨 SECURITY VULNERABILITIES (Current State)

### Critical Issues

1. **No Page Protection**
   - Anyone can access admin dashboard
   - Anyone can view all appointments
   - Anyone can modify queue

2. **No API Protection**
   - APIs don't check authentication
   - No session validation
   - Anyone can call any endpoint

3. **Data Exposure**
   - User data accessible without login
   - Appointment details exposed
   - Queue information public

4. **Privilege Escalation**
   - No role validation
   - No ownership checks
   - Anyone can perform admin actions

---

## ✅ NEXTAUTH.JS IMPLEMENTATION PLAN

### Why NextAuth.js?

- Industry standard for Next.js authentication
- Built-in session management
- MongoDB adapter available
- Role-based access control support
- CSRF protection
- Secure by default

### Implementation Strategy

#### 1. Install Dependencies
```bash
npm install next-auth@latest @auth/mongodb-adapter
```

#### 2. Create NextAuth Configuration
- File: `src/app/api/auth/[...nextauth]/route.ts`
- Providers: Credentials (email/password)
- Adapter: MongoDB
- Session: JWT
- Callbacks: Add role to session

#### 3. Protect Pages
Create middleware or client-side wrapper:
- Check session on mount
- Redirect to /login if unauthenticated
- Check role for admin pages

#### 4. Protect API Routes
Add to each protected route:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

#### 5. Update Login Page
Replace custom auth with NextAuth `signIn()`

#### 6. Update Logout
Replace custom logout with NextAuth `signOut()`

---

## 📋 PAGES TO PROTECT

### Tier 1: Any Authenticated User
- `/book` - Book appointment
- `/queue` - Join/view queue

### Tier 2: Staff or Admin
- `/admin` - Dashboard (read-only for staff)
- `/admin/activity` - Activity logs

### Tier 3: Admin Only
- `/admin/services` - Service configuration
- `/admin/staff` - User management

---

## 🔌 APIs TO PROTECT

### Tier 1: Any Authenticated User
```typescript
POST /api/appointments      // Create appointment (own)
POST /api/queue            // Join queue
GET  /api/appointments/:id  // View own appointment only
GET  /api/queue/:id        // View own queue entry only
```

### Tier 2: Staff or Admin
```typescript
GET    /api/appointments    // List all
PATCH  /api/appointments/:id
DELETE /api/appointments/:id
GET    /api/queue           // List all
PATCH  /api/queue/:id
POST   /api/queue/next      // Call next
GET    /api/audit-logs      // Already protected ✅
```

### Tier 3: Admin Only
```typescript
GET    /api/users           // Already protected ✅
POST   /api/users           // Already protected ✅
PATCH  /api/users/:id       // Already protected ✅
DELETE /api/users/:id       // Already protected ✅
POST   /api/services        // Future: Create service
PATCH  /api/services/:id    // Future: Update service
```

---

## 🔄 AUTH FLOW (NextAuth)

### Login Flow
```
1. User visits /login
2. Enters email + password
3. Calls signIn('credentials', { email, password })
4. NextAuth validates credentials
5. Creates session (JWT)
6. Redirects to callback URL
7. Session stored in HTTP-only cookie
```

### Protected Page Flow
```
1. User navigates to /admin
2. Page checks session (useSession())
3. If no session → redirect to /login
4. If session exists → render page
5. If wrong role → show 403 error
```

### Protected API Flow
```
1. Client calls API endpoint
2. API calls getServerSession()
3. If no session → return 401
4. If wrong role → return 403
5. If authorized → process request
```

### Logout Flow
```
1. User clicks logout
2. Calls signOut({ callbackUrl: '/' })
3. NextAuth clears session
4. Redirects to home
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Setup NextAuth
- [ ] Install next-auth and MongoDB adapter
- [ ] Create auth route configuration
- [ ] Add SessionProvider to layout
- [ ] Configure environment variables

### Phase 2: Protect Pages
- [ ] Create ProtectedRoute component
- [ ] Wrap /book with auth check
- [ ] Wrap /queue with auth check
- [ ] Wrap /admin/* with role check

### Phase 3: Protect APIs
- [ ] Add session check to appointment routes
- [ ] Add session check to queue routes
- [ ] Add role validation for admin routes
- [ ] Add ownership checks (user can only see own data)

### Phase 4: Update Auth UI
- [ ] Update login page to use NextAuth
- [ ] Update NavigationBar with NextAuth session
- [ ] Update logout to use NextAuth signOut
- [ ] Add session loading states

### Phase 5: Testing
- [ ] Test login/logout flow
- [ ] Test protected page redirects
- [ ] Test API 401 responses
- [ ] Test role-based access control

---

## ⚠️ BREAKING CHANGES

### Files to Remove (Old Auth)
- `src/lib/auth/session.ts` - Custom session management
- `src/app/api/auth/route.ts` - Custom auth endpoints

### Files to Modify
- `src/app/login/page.tsx` - Use NextAuth signIn
- `src/components/organisms/NavigationBar.tsx` - Use NextAuth session
- All protected API routes - Add getServerSession
- All protected pages - Add session check

### New Files to Create
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `src/components/auth/ProtectedRoute.tsx` - Page wrapper
- `src/lib/auth/auth-options.ts` - Shared auth config

---

## 🎯 SUCCESS CRITERIA

After implementation:

1. ✅ Unauthenticated users redirected to /login
2. ✅ Protected APIs return 401 without session
3. ✅ Admin pages check for admin role
4. ✅ Users can only see own appointments
5. ✅ Staff can see all data but cannot modify services/users
6. ✅ Admins have full access
7. ✅ Session persists across page refreshes
8. ✅ Logout clears session properly

---

## 📊 SUMMARY

**Current Status:**
- 🔴 **6 of 8 pages unprotected**
- 🔴 **10 of 13 APIs unprotected**
- 🔴 **No role-based access control**
- 🔴 **Data exposure vulnerability**

**After NextAuth Implementation:**
- ✅ All pages properly protected
- ✅ All APIs properly protected
- ✅ Role-based access enforced
- ✅ Secure session management
- ✅ CSRF protection
- ✅ Industry-standard auth

**Estimated Implementation Time:** 2-3 hours

Ready to proceed with NextAuth.js implementation.
