"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, logout, getUser, AuthResponse } from './auth';

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  logout,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated
        if (isAuthenticated()) {
          const currentUser = getUser();
          setUser(currentUser);
        } else if (pathname !== '/login') {
          // Redirect to login if not authenticated and not already on login page
          router.push('/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        if (pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const value = {
    user,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 