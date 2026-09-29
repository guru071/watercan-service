'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const login = async (data: any) => {
    const res = await api.post('/auth/login', data);
    if (res.data.accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
      setIsAuthenticated(true);
      router.push('/dashboard');
    }
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      router.push('/login');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
