# JWT Authentication - Complete Frontend Implementation Guide

## 🎯 Current Status

### ✅ What's Already Implemented
1. **Login page** (`app/login/page.tsx`)
   - Stores `accessToken` in localStorage ✅
   - Stores `refreshToken` in localStorage ✅
   - Stores `user` and `agent` info ✅

2. **API library** (`lib/api.ts`)
   - `getAuthHeaders()` helper function ✅
   - Auth headers added to protected endpoints ✅

3. **Backend**
   - JWT middleware ready ✅
   - All endpoints support JWT ✅

### ❌ What's Missing (Need to Complete)

1. **Logout doesn't clear tokens**
2. **No token expiry handling**
3. **No redirect to login if unauthorized**
4. **No token refresh mechanism**
5. **Dashboard doesn't show user info from token**

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### STEP 1: Fix Logout to Clear Tokens

**File:** `components/layout/header.tsx` (line ~62)

**Current Code:**
```typescript
const handleLogout = () => {
  router.push('/login');
};
```

**Updated Code:**
```typescript
const handleLogout = async () => {
  try {
    // Get refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Call backend logout endpoint
    if (refreshToken) {
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    }
    
    // Clear all auth data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('agent');
    
    console.log('[AUTH] Logged out successfully');
    
    // Redirect to login
    router.push('/login');
  } catch (error) {
    console.error('[AUTH] Logout error:', error);
    // Still clear local data and redirect even if API call fails
    localStorage.clear();
    router.push('/login');
  }
};
```

**Also Update:** `components/layout/sidebar.tsx` (same logout function at line ~75)

---

### STEP 2: Add Auth Check on Protected Pages

**Create:** `lib/auth.ts` (new file)

```typescript
'use client';

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('accessToken');
  return !!token;
};

export const getAuthUser = () => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  const agentStr = localStorage.getItem('agent');
  
  return {
    user: userStr ? JSON.parse(userStr) : null,
    agent: agentStr ? JSON.parse(agentStr) : null,
  };
};

export const requireAuth = (router: any) => {
  if (!isAuthenticated()) {
    console.log('[AUTH] Not authenticated, redirecting to login...');
    router.push('/login');
    return false;
  }
  return true;
};
```

---

### STEP 3: Protect Dashboard and Other Pages

**File:** `app/dashboard/page.tsx`

**Add at the top of the component:**

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthUser } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  
  // Add this useEffect at the very beginning
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('[AUTH] Not authenticated, redirecting...');
      router.push('/login');
    }
  }, [router]);
  
  // Rest of your existing code...
```

**Repeat for all protected pages:**
- `app/appointments/page.tsx`
- `app/bulk-booking/page.tsx`
- `app/confirm-acb/page.tsx`
- `app/doctors/page.tsx`
- `app/payments/page.tsx`
- `app/reports/page.tsx`
- `app/settings/page.tsx`

---

### STEP 4: Handle 401/403 Responses Globally

**File:** `lib/api.ts`

**Add error handling wrapper:**

```typescript
// Add this after getAuthHeaders()
const handleApiResponse = async (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    console.log('[AUTH] Token expired or invalid, clearing session...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('agent');
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Authentication required');
  }
  
  return response.json();
};

// Example: Update profile.get
profile: {
  get: async (): Promise<Agent> => {
    const response = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);  // ← Use this
  },
  // ... update all other endpoints similarly
}
```

---

### STEP 5: Show Logged-in User Info in Header

**File:** `components/layout/header.tsx`

**Add this code after the useState declarations:**

```typescript
const [userName, setUserName] = useState('Corporate Agent');
const [userEmail, setUserEmail] = useState('agent@echannelling.com');

useEffect(() => {
  // Load user info from localStorage
  const agentStr = localStorage.getItem('agent');
  const userStr = localStorage.getItem('user');
  
  if (agentStr) {
    const agent = JSON.parse(agentStr);
    setUserName(agent.name || 'Corporate Agent');
    setUserEmail(agent.email || 'agent@echannelling.com');
  } else if (userStr) {
    const user = JSON.parse(userStr);
    setUserEmail(user.email || 'agent@echannelling.com');
  }
}, []);
```

**Update the avatar section to use dynamic data:**

```typescript
<DropdownMenuLabel>
  <div className="flex flex-col space-y-1">
    <p className="text-sm font-medium">{userName}</p>
    <p className="text-xs text-gray-500">{userEmail}</p>
  </div>
</DropdownMenuLabel>
```

---

### STEP 6: Token Refresh (Optional but Recommended)

**File:** `lib/api.ts`

**Add refresh token function:**

```typescript
// Add to api object
auth: {
  login: async (email: string, password: string) => {
    // ... existing code
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/auth/logout`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    return response.json();
  },
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  },
},
```

---

### STEP 7: Auto-Refresh Before Token Expires

**File:** `app/layout.tsx` or create `components/AuthProvider.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Don't run on login page
    if (pathname === '/login') return;
    
    // Check if token exists
    const token = localStorage.getItem('accessToken');
    if (!token && pathname !== '/login') {
      router.push('/login');
      return;
    }
    
    // Set up token refresh interval (every 10 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            refreshToken: localStorage.getItem('refreshToken') 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.accessToken);
          console.log('[AUTH] Token refreshed successfully');
        } else {
          console.log('[AUTH] Token refresh failed, logging out...');
          localStorage.clear();
          router.push('/login');
        }
      } catch (error) {
        console.error('[AUTH] Token refresh error:', error);
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(refreshInterval);
  }, [router, pathname]);
  
  return <>{children}</>;
}
```

---

## 🧪 TESTING CHECKLIST

After implementing all steps, test these scenarios:

### Test 1: Login Flow
- [ ] Go to `/login`
- [ ] Enter credentials: `agent@corporate.com` / `password123`
- [ ] Click Login
- [ ] Check localStorage has: `accessToken`, `refreshToken`, `user`, `agent`
- [ ] Check console shows: `[AUTH] Login successful`
- [ ] Redirected to `/dashboard`

### Test 2: Protected Pages
- [ ] Clear localStorage
- [ ] Try to access `/dashboard`
- [ ] Should redirect to `/login`
- [ ] Login again
- [ ] All pages should work

### Test 3: Logout Flow
- [ ] Login first
- [ ] Click logout (avatar dropdown)
- [ ] Check localStorage cleared
- [ ] Redirected to `/login`
- [ ] Try accessing `/dashboard` - should redirect to login

### Test 4: Token in API Calls
- [ ] Login
- [ ] Go to Settings page
- [ ] Open Network tab in DevTools
- [ ] Check `/api/profile` request
- [ ] Should see header: `Authorization: Bearer eyJhbGc...`

### Test 5: Token Expiry (Optional)
- [ ] Login
- [ ] Wait 16 minutes (token expires)
- [ ] Try to access Settings
- [ ] Should redirect to login with message "Session expired"

---

## 📁 FILES TO UPDATE

| File | Action | Status |
|------|--------|--------|
| `components/layout/header.tsx` | Update handleLogout | ❌ TODO |
| `components/layout/sidebar.tsx` | Update handleLogout | ❌ TODO |
| `lib/auth.ts` | Create new file | ❌ TODO |
| `lib/api.ts` | Add handleApiResponse | ❌ TODO |
| `app/dashboard/page.tsx` | Add auth check | ❌ TODO |
| `app/appointments/page.tsx` | Add auth check | ❌ TODO |
| `app/bulk-booking/page.tsx` | Add auth check | ❌ TODO |
| `app/confirm-acb/page.tsx` | Add auth check | ❌ TODO |
| `app/doctors/page.tsx` | Add auth check | ❌ TODO |
| `app/payments/page.tsx` | Add auth check | ❌ TODO |
| `app/reports/page.tsx` | Add auth check | ❌ TODO |
| `app/settings/page.tsx` | Add auth check | ❌ TODO |
| `components/AuthProvider.tsx` | Create (optional) | ❌ TODO |

---

## ⚡ QUICK IMPLEMENTATION (Minimum Required)

If you want to implement quickly, do these 3 things minimum:

1. **Fix logout** (Step 1) - 5 minutes
2. **Create auth.ts** (Step 2) - 5 minutes  
3. **Add auth check to all pages** (Step 3) - 15 minutes

Total: ~25 minutes for basic JWT auth protection!

---

## 🚀 PRODUCTION CHECKLIST

Before deploying to production:

- [ ] All logout buttons clear localStorage
- [ ] All protected pages check authentication
- [ ] API calls handle 401/403 errors
- [ ] Token refresh implemented (if tokens expire)
- [ ] User info displayed in header
- [ ] Test with multiple agents
- [ ] Test logout from all pages
- [ ] Test expired token scenario

---

## 📞 NEED HELP?

If you get stuck:
1. Check browser console for `[AUTH]` logs
2. Check Network tab for API requests
3. Verify localStorage has tokens after login
4. Check backend logs for JWT verification
