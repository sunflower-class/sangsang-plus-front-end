import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '@/apis/userService';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean; // 관리자 여부 추가
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>; // refreshUser 함수 추가
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const refreshUser = async () => {
    if (user?.email) {
      try {
        const fullUserData = await userService.getUserByEmail(user.email);
        if (fullUserData) {
          setUser(fullUserData);
          localStorage.setItem('user', JSON.stringify(fullUserData));
        }
      } catch (error) {
        console.error('사용자 정보 갱신 실패:', error);
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const authResponse = await userService.login({ email, password });
      if (authResponse && authResponse.id) {
        // 인증 성공 후, 이메일로 사용자 상세 정보 조회
        const fullUserData = await userService.getUserByEmail(email);
        if (fullUserData) {
          setUser(fullUserData);
          localStorage.setItem('user', JSON.stringify(fullUserData));
          return true;
        }
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
      await userService.signUp({ email, password, name });
      // 회원가입 성공 후 바로 로그인 처리 또는 로그인 페이지로 리다이렉트
      // 여기서는 성공만 반환하고 Login.tsx에서 navigate하도록 합니다.
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // localStorage.removeItem('token'); // 토큰도 삭제해야 한다면 추가
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};