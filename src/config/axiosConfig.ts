import axios from 'axios';
import authService from '../apis/authService';
import { extractUserFromToken, isTokenExpired } from '../utils/tokenUtils';

let authContextLogout: (() => void) | null = null;
let authContextUpdateUser: ((user: any) => void) | null = null;

/**
 * AuthContext와 연동을 위한 콜백 등록
 */
export const setAuthCallbacks = (logout: () => void, updateUser: (user: any) => void) => {
  authContextLogout = logout;
  authContextUpdateUser = updateUser;
};

/**
 * Axios 인터셉터 설정
 * 모든 요청에 JWT 토큰을 자동으로 추가하고, 토큰 만료 시 갱신 처리
 */
export const setupAxiosInterceptors = () => {
  // Request 인터셉터: 모든 요청에 토큰 추가
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response 인터셉터: 401 에러 시 토큰 갱신 시도
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const requestUrl = originalRequest.url || '';

      // refresh 요청은 무한 루프를 방지하기 위해 제외
      const isRefreshRequest = requestUrl.includes('/api/auth/refresh');
      
      // 401 에러이고 아직 재시도하지 않은 경우, refresh 요청이 아닌 경우
      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
        originalRequest._retry = true;

        try {
          // 토큰 갱신 시도
          console.log('토큰 만료 감지, 리프레시 시도 중...');
          const newAccessToken = await authService.refreshToken();
          console.log('토큰 리프레시 성공');
          
          // JWT에서 사용자 정보 추출하여 AuthContext 업데이트
          const updatedUser = extractUserFromToken(newAccessToken);
          if (updatedUser && authContextUpdateUser) {
            authContextUpdateUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('사용자 정보 동기화 완료', updatedUser);
          } else {
            console.warn('토큰에서 사용자 정보 추출 실패, 기존 사용자 정보 유지');
          }
          
          // SSE 재연결을 위한 이벤트 발생
          window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
            detail: { token: newAccessToken, user: updatedUser } 
          }));
          
          // 원래 요청에 새 토큰 적용하여 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          console.warn('토큰 갱신 실패, 로그아웃 처리');
          
          // AuthContext를 통한 로그아웃 처리
          if (authContextLogout) {
            authContextLogout();
          } else {
            // 폴백: 직접 처리
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
            
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
              window.location.href = '/login';
            }
          }
          return Promise.reject(refreshError);
        }
      }

      // refresh 요청에서 401이 발생한 경우 (리프레시 토큰도 만료)
      if (error.response?.status === 401 && isRefreshRequest) {
        console.warn('리프레시 토큰도 만료됨, 로그아웃 처리');
        
        // AuthContext를 통한 로그아웃 처리
        if (authContextLogout) {
          authContextLogout();
        } else {
          // 폴백: 직접 처리
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * 초기 토큰 설정
 * 앱 시작 시 localStorage에 저장된 토큰을 axios 기본 헤더에 설정
 */
export const initializeAxiosToken = () => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};