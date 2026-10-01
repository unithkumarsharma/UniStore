import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';
import {
  signInWithGoogle,
  signInWithApple,
  loginWithEmail,
  registerWithEmail,
  logoutFirebase,
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, fullName: string, password?: string, phone?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  loginWithFirebase: (email: string, pass: string) => Promise<boolean>;
  registerWithFirebase: (email: string, fullName: string, pass: string) => Promise<boolean>;
  syncFirebaseSession: (params: { idToken: string; email?: string; fullName?: string; phone?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('unistore_token') || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from Supabase on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('unistore_token');
      if (savedToken) {
        try {
          const profile = await api.getMe(savedToken);
          setUser(profile);
          setToken(savedToken);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('unistore_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string = 'password123'): Promise<boolean> => {
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('unistore_token', res.token);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const register = async (email: string, fullName: string, password: string = 'password123', phone?: string): Promise<boolean> => {
    try {
      const res = await api.register(email, fullName, password, phone);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('unistore_token', res.token);
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  };

  /**
   * Firebase Google OAuth Login & Supabase Sync
   */
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const fbResult = await signInWithGoogle();
      const res = await api.firebaseLogin({
        idToken: fbResult.token,
        email: fbResult.user.email || undefined,
        fullName: fbResult.user.displayName || undefined,
      });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('unistore_token', res.token);
      return true;
    } catch (err) {
      console.error('Firebase Google login failed:', err);
      throw err;
    }
  };

  /**
   * Firebase Apple OAuth Login & Supabase Sync
   */
  const loginWithApple = async (): Promise<boolean> => {
    try {
      const fbResult = await signInWithApple();
      const res = await api.firebaseLogin({
        idToken: fbResult.token,
        email: fbResult.user.email || undefined,
        fullName: fbResult.user.displayName || undefined,
      });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('unistore_token', res.token);
      return true;
    } catch (err) {
      console.error('Firebase Apple login failed:', err);
      throw err;
    }
  };

  /**
   * Sync custom Firebase Session (e.g. Phone OTP) with Supabase
   */
  const syncFirebaseSession = async (params: { idToken: string; email?: string; fullName?: string; phone?: string }): Promise<boolean> => {
    try {
      const res = await api.firebaseLogin(params);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('unistore_token', res.token);
      return true;
    } catch (err) {
      console.error('Firebase session sync failed:', err);
      throw err;
    }
  };

  /**
   * Firebase Email & Password Login
   */
  const loginWithFirebase = async (email: string, pass: string): Promise<boolean> => {
    try {
      const fbResult = await loginWithEmail(email, pass);
      const res = await api.firebaseLogin({
        idToken: fbResult.token,
        email: fbResult.user.email || undefined,
        fullName: fbResult.user.displayName || undefined,
      });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('unistore_token', res.token);
      return true;
    } catch (err) {
      console.error('Firebase Email login failed:', err);
      throw err;
    }
  };

  /**
   * Firebase Email & Password Registration
   */
  const registerWithFirebase = async (email: string, fullName: string, pass: string): Promise<boolean> => {
    try {
      const fbResult = await registerWithEmail(email, pass);
      const res = await api.firebaseLogin({
        idToken: fbResult.token,
        email,
        fullName,
      });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('unistore_token', res.token);
      return true;
    } catch (err) {
      console.error('Firebase registration failed:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('unistore_token');
    localStorage.removeItem('unistore_cache_current_user');
    logoutFirebase().catch(() => {});
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...data });
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'STAFF';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithApple,
        loginWithFirebase,
        registerWithFirebase,
        syncFirebaseSession,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
