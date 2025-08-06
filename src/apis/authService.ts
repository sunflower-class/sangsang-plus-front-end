import axios from "axios";
import { VITE_API_URL } from "../env/env";

const AUTH_URL = `${VITE_API_URL}/api/auth`;

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface ServerAuthResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken: string;
  user: any; // null일 수 있음
  expiresIn: number;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
  };
}

// JWT 토큰을 디코드하여 사용자 정보 추출
const decodeJWTPayload = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};

/**
 * 로그인 요청
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post<ServerAuthResponse>(`${AUTH_URL}/login`, credentials);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '로그인 실패');
    }
    
    const { token, refreshToken } = response.data;
    
    // JWT 토큰을 localStorage에 저장
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    
    // axios 기본 헤더에 토큰 설정
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // JWT에서 사용자 정보 추출
    const payload = decodeJWTPayload(token);
    if (!payload) {
      throw new Error('토큰 파싱 실패');
    }
    
    const user = {
      id: payload.userId || payload.sub,
      email: payload.email || payload.preferred_username,
      name: payload.name || payload.preferred_username || payload.email,
      isAdmin: false // 필요시 role에서 판단
    };
    
    return { token, user };
  } catch (error) {
    console.error("로그인 실패:", error);
    throw error;
  }
};

/**
 * 회원가입 요청
 */
export const signup = async (userData: SignupRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post<ServerAuthResponse>(`${AUTH_URL}/register`, userData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '회원가입 실패');
    }
    
    const { token, refreshToken } = response.data;
    
    // JWT 토큰을 localStorage에 저장
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    
    // axios 기본 헤더에 토큰 설정
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // JWT에서 사용자 정보 추출
    const payload = decodeJWTPayload(token);
    if (!payload) {
      throw new Error('토큰 파싱 실패');
    }
    
    const user = {
      id: payload.userId || payload.sub,
      email: payload.email || payload.preferred_username,
      name: payload.name || payload.preferred_username || payload.email,
      isAdmin: false
    };
    
    return { token, user };
  } catch (error) {
    console.error("회원가입 실패:", error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    // 서버에 로그아웃 요청 (선택적)
    const token = localStorage.getItem('jwt_token');
    if (token) {
      await axios.post(`${AUTH_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (error) {
    console.error("로그아웃 요청 실패:", error);
  } finally {
    // 로컬 토큰 삭제
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * 토큰 갱신
 */
export const refreshToken = async (): Promise<string> => {
  try {
    const response = await axios.post<{ token: string }>(`${AUTH_URL}/refresh`);
    const newToken = response.data.token;
    
    localStorage.setItem('jwt_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    return newToken;
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
    throw error;
  }
};

/**
 * 토큰 검증 (게이트웨이에서 처리하므로 로컬 검사만)
 */
export const verifyToken = async (): Promise<boolean> => {
  // 게이트웨이에서 토큰 검증을 처리하므로 
  // 로컬에 토큰이 있는지만 확인
  const token = localStorage.getItem('jwt_token');
  return token !== null;
};

export default {
  login,
  signup,
  logout,
  refreshToken,
  verifyToken
};