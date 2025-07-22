import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: { name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    // 실제 앱에서는 여기서 로컬 스토리지나 쿠키에서 사용자 정보를 로드합니다.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // 실제 로그인 로직 (API 호출 등)
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password') {
          const newUser = { name: '테스트유저' };
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          resolve();
        } else {
          reject(new Error('잘못된 이메일 또는 비밀번호입니다.'));
        }
      }, 500);
    });
  };

  const signup = async (email: string, password: string, name: string) => {
    // 실제 회원가입 로직 (API 호출 등)
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password && name) {
          // 실제로는 백엔드에 사용자 정보를 저장합니다.
          resolve();
        } else {
          reject(new Error('모든 필드를 입력해주세요.'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
