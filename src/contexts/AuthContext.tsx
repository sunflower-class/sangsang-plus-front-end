import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/apis/authService';
import { initializeAxiosToken, setupAxiosInterceptors, setAuthCallbacks } from '@/config/axiosConfig';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

interface PaymentInfo {
  paymentKey: string;
  orderId: string | null;
  amount: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  paymentInfo: PaymentInfo | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setPaymentInfo: (info: PaymentInfo | null) => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 토큰 갱신 시 사용자 정보 업데이트를 위한 함수
  const updateUserFromToken = (updatedUser: User) => {
    setUser(updatedUser);
    setToken(localStorage.getItem('jwt_token')); // 토큰도 동기화
    console.log('AuthContext: 사용자 정보 업데이트됨', updatedUser);
  };

  // 강제 로그아웃 함수 (토큰 만료 시 사용)
  const forceLogout = async () => {
    console.log('AuthContext: 강제 로그아웃 처리');
    setUser(null);
    setToken(null);
    setPaymentInfo(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('paymentInfo');
    
    // 로그인 페이지로 리다이렉트
    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    // Axios 인터셉터 설정
    setupAxiosInterceptors();
    
    // AuthContext와 axios 인터셉터 연동
    setAuthCallbacks(forceLogout, updateUserFromToken);
    
    // 저장된 토큰과 사용자 정보 불러오기
    const savedToken = localStorage.getItem('jwt_token');
    const savedUser = localStorage.getItem('user');
    const savedPaymentInfo = localStorage.getItem('paymentInfo');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      initializeAxiosToken();
      
      // 게이트웨이에서 토큰 검증을 처리하므로 별도 검증 불필요
      // 실제 API 요청 시 게이트웨이가 토큰 유효성을 확인함
    }
    if (savedPaymentInfo) {
      setPaymentInfo(JSON.parse(savedPaymentInfo));
    }
    setIsLoading(false);
  }, []);

  const handleSetPaymentInfo = (info: PaymentInfo | null) => {
    if (info) {
      localStorage.setItem('paymentInfo', JSON.stringify(info));
    } else {
      localStorage.removeItem('paymentInfo');
    }
    setPaymentInfo(info);
  };

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
      setPaymentInfo(null);
      localStorage.removeItem('user');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('paymentInfo');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, paymentInfo, login, signup, logout, setPaymentInfo: handleSetPaymentInfo, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};