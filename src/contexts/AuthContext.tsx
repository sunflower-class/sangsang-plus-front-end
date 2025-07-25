import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '@/apis/userService';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await userService.login({ email, password });
      if (response && response.id) { // 백엔드 응답에 id 필드가 있다면 성공으로 간주
        const userData = { id: response.id, email: response.email, name: response.name };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        // 토큰도 저장해야 한다면 여기에 추가 (예: localStorage.setItem('token', response.token);)
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
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};