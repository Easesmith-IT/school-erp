'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/schema';

export const DEMO_USERS: User[] = [
  {
    id: 'user-principal',
    name: 'Deepak Singh',
    email: 'principal@school.demo',
    role: 'Principal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  },
  {
    id: 'user-accountant',
    name: 'Ramesh Kulkarni',
    email: 'accountant@school.demo',
    role: 'Accountant',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  },
  {
    id: 'user-teacher',
    name: 'Priya Sharma',
    email: 'teacher@school.demo',
    role: 'Teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  },
  {
    id: 'user-admin',
    name: 'Suresh Nair',
    email: 'admin@school.demo',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  },
];

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string) => boolean;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USERS[0]); // Default to Principal for fast demoing

  useEffect(() => {
    const stored = localStorage.getItem('school_intel_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.email === 'principal@school.demo') {
          parsed.name = 'Deepak Singh';
        }
        setUser(parsed);
      } catch (e) {
        setUser(DEMO_USERS[0]);
      }
    }
  }, []);

  const login = (email: string): boolean => {
    const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      localStorage.setItem('school_intel_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const switchRole = (newRole: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === newRole) || DEMO_USERS[0];
    setUser(target);
    localStorage.setItem('school_intel_user', JSON.stringify(target));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('school_intel_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'Principal',
        login,
        switchRole,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
