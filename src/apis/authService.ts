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

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
  };
}

/**
 * 로그인 요청
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${AUTH_URL}/login`, credentials);
    
    // JWT 토큰을 localStorage에 저장
    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token);
      // axios 기본 헤더에 토큰 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
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
    const response = await axios.post<AuthResponse>(`${AUTH_URL}/register`, userData);
    
    // 회원가입 성공 시 토큰 저장 (자동 로그인)
    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
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
 * 토큰 검증
 */
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    
    const response = await axios.get(`${AUTH_URL}/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    return false;
  }
};

export default {
  login,
  signup,
  logout,
  refreshToken,
  verifyToken
};