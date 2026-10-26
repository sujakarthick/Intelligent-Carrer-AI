import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('skilltwin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('skilltwin_token');
      if (storedToken) {
        try {
          const res = await api.get<User>('/auth/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('skilltwin_token');
          localStorage.removeItem('skilltwin_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { access_token, user_id, full_name } = res.data;
    localStorage.setItem('skilltwin_token', access_token);
    setToken(access_token);
    setUser({ id: user_id, email, full_name });
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/register', {
      full_name: fullName,
      email,
      password,
    });
    const { access_token, user_id, full_name: name } = res.data;
    localStorage.setItem('skilltwin_token', access_token);
    setToken(access_token);
    setUser({ id: user_id, email, full_name: name });
  };

  const logout = () => {
    localStorage.removeItem('skilltwin_token');
    localStorage.removeItem('skilltwin_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
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
