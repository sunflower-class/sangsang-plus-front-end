import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/apis/authService';
import { initializeAxiosToken, setupAxiosInterceptors } from '@/config/axiosConfig';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Axios 인터셉터 설정
    setupAxiosInterceptors();
    
    // 저장된 토큰과 사용자 정보 불러오기
    const savedToken = localStorage.getItem('jwt_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      initializeAxiosToken();
      
      // 토큰 유효성 검증
      authService.verifyToken().then(isValid => {
        if (!isValid) {
          // 토큰이 유효하지 않으면 로그아웃 처리
          logout();
        }
      });
    }
    setIsLoading(false);
  }, []);

  const refreshUser = async () => {
    // JWT 토큰 기반으로는 서버에서 사용자 정보를 가져오는 API가 필요
    // 현재는 localStorage의 정보 유지
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.signup({ email, password, name });
      if (response.token && response.user) {
        // 회원가입 성공 시 자동 로그인
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('jwt_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};