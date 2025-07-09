'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/database';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 恢复用户信息
    const savedUser = localStorage.getItem('storyking_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('storyking_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, email: string) => {
    try {
      // 检查用户是否已存在
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      let userData: User;

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          userData = data.user;
        } else {
          // 创建新用户
          const createResponse = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email }),
          });

          if (!createResponse.ok) {
            throw new Error('Failed to create user');
          }

          const createData = await createResponse.json();
          userData = createData.user;
        }
      } else {
        throw new Error('Failed to check user');
      }

      setUser(userData);
      localStorage.setItem('storyking_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('storyking_user');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
