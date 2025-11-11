'use client';

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('accessToken');
  return !!token;
};

/**
 * Get authenticated user and agent data
 */
export const getAuthUser = () => {
  if (typeof window === 'undefined') return { user: null, agent: null };
  
  const userStr = localStorage.getItem('user');
  const agentStr = localStorage.getItem('agent');
  
  return {
    user: userStr ? JSON.parse(userStr) : null,
    agent: agentStr ? JSON.parse(agentStr) : null,
  };
};

/**
 * Require authentication - redirect to login if not authenticated
 * Returns true if authenticated, false otherwise
 */
export const requireAuth = (router: any): boolean => {
  if (!isAuthenticated()) {
    console.log('[AUTH] Not authenticated, redirecting to login...');
    router.push('/login');
    return false;
  }
  return true;
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('agent');
  console.log('[AUTH] Authentication data cleared');
};

/**
 * Get access token
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};
