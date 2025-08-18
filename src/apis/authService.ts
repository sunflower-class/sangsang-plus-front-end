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
  user: any; 
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
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      throw new Error('리프레시 토큰이 없습니다');
    }

    const response = await axios.post<{
      success: boolean;
      message: string;
      token: string;
      refreshToken: string;
      user: any;
      expiresIn: number;
    }>(`${AUTH_URL}/refresh`, {
      refresh_token: refreshTokenValue
    });
    
    console.log('🔄 Refresh API 응답:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '토큰 갱신 실패');
    }
    
    const { token: accessToken, refreshToken: newRefreshToken } = response.data;
    console.log('📝 추출된 토큰들:', { accessToken: !!accessToken, newRefreshToken: !!newRefreshToken });
    
    // 새 토큰을 저장
    console.log('💾 localStorage에 토큰 저장 중...');
    localStorage.setItem('jwt_token', accessToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    
    // 저장 확인
    const savedJwtToken = localStorage.getItem('jwt_token');
    const savedRefreshToken = localStorage.getItem('refresh_token');
    console.log('✅ localStorage 저장 확인:', {
      jwt_saved: !!savedJwtToken,
      refresh_saved: !!savedRefreshToken,
      jwt_length: savedJwtToken?.length || 0
    });
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    return accessToken;
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
    
    // 에러 타입별 처리
    if (error.response?.status === 401) {
      console.warn('INVALID_REFRESH_TOKEN: 리프레시 토큰이 만료되거나 유효하지 않음');
    } else if (error.response?.status === 400) {
      console.warn('MALFORMED_REFRESH_TOKEN: 토큰 형식이 잘못됨');
    } else if (error.response?.status === 503) {
      console.warn('SERVICE_UNAVAILABLE: Keycloak 연결 실패');
    }
    
    // 리프레시 토큰도 만료된 경우 로그아웃 처리
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
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

/** 이메일로 사용자 정보 조회 */
export const getUserByEmail = async (email: string) => {
  console.log("이메일로 사용자 정보 조회 시도:", email);
  try {
    const response = await axios.get(`${AUTH_URL}/email/${email}`);
    console.log("사용자 정보 조회 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 사용자 이름 변경 */
export const updateUserName = async (id: string, newName: string) => {
  console.log(`사용자 ID ${id} 이름 변경 시도:`, { newName });
  try {
    const response = await axios.put(`${AUTH_URL}/${id}`, { name: newName });
    console.log("이름 변경 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("이름 변경 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 사용자 비밀번호 업데이트 */
export const updateUserPassword = async (id: string, newPassword: string) => {
  console.log(`사용자 ID ${id} 비밀번호 업데이트 시도:`, { newPassword: "********" });
  try {
    const response = await axios.put(`${AUTH_URL}/${id}`, { password: newPassword });
    console.log("비밀번호 업데이트 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("비밀번호 업데이트 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 사용자 삭제 */
export const deleteUser = async (id: string) => {
  console.log(`사용자 ID ${id} 삭제 시도:`);
  try {
    const response = await axios.delete(`${AUTH_URL}/${id}`);
    console.log("사용자 삭제 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("사용자 삭제 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default {
  login,
  signup,
  logout,
  refreshToken,
  verifyToken,
  getUserByEmail,
  updateUserName,
  updateUserPassword,
  deleteUser,
};