import { useState, useEffect, useCallback } from 'react';
import * as authService from '../api/authService';
import { ACCESS_TOKEN_KEY } from '../api/config';

const USER_KEY = 'user';

export default function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      console.log('🔍 useAuth: Loading user from localStorage:', stored);
      const parsed = stored ? JSON.parse(stored) : null;
      console.log('✅ useAuth: Parsed user:', parsed);
      console.log('🔑 useAuth: Current access token exists:', !!localStorage.getItem(ACCESS_TOKEN_KEY));
      return parsed;
    } catch (e) {
      console.error('❌ useAuth: Error parsing user from localStorage:', e);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true); setError(null);
    try {
      const data = await authService.loginUser({ email, password });
      console.log('useAuth: Login successful, user data:', data?.user);
      console.log('useAuth: User ID:', data?.user?.id, 'Type:', typeof data?.user?.id);
      if (data?.user) {
        setUser(data.user);
        try { localStorage.setItem(USER_KEY, JSON.stringify(data.user)); } catch (e) {}
      }
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logoutUser();
    setUser(null);
    // ⬅️ إعادة توجيه لصفحة تسجيل الدخول
    window.location.href = '/login';
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true); setError(null);
    try {
      const res = await authService.registerUser(payload);
      return res;
    } catch (err) { setError(err); throw err; } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // Optionally verify token validity here
  }, []);

  return { user, loading, error, login, logout, register };
}
