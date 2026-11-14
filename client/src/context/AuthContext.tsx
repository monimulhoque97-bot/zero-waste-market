import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  quickLoginDemo: (role: 'seller' | 'customer' | 'ngo') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('zw_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (token) {
        const profile = await api.getMe();
        setUser(profile);
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('zw_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('zw_token');
    setToken(null);
    setUser(null);
  };

  const quickLoginDemo = async (role: 'seller' | 'customer' | 'ngo') => {
    setIsLoading(true);
    try {
      const emailMap = {
        seller: 'seller@zerowaste.in',
        customer: 'customer@zerowaste.in',
        ngo: 'ngo@zerowaste.in',
      };
      const email = emailMap[role];
      const res = await api.login({ email, password: 'Password123!' });
      login(res.token, res.user);
    } catch (err: any) {
      console.error('Demo login failed:', err);
      alert('Demo login failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (token) {
      const profile = await api.getMe();
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user ? user.role : null,
        isLoading,
        login,
        logout,
        quickLoginDemo,
        refreshUser,
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
