import axios from 'axios';
import authService from '../apis/authService';

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

      // 인증 관련 API에서만 401 오류 시 자동 로그아웃 처리
      const isAuthAPI = requestUrl.includes('/api/auth') || 
                       requestUrl.includes('/api/users') ||
                       requestUrl.includes('/api/profile');

      // 401 에러이고 아직 재시도하지 않은 경우, 그리고 인증 관련 API인 경우만
      if (error.response?.status === 401 && !originalRequest._retry && isAuthAPI) {
        originalRequest._retry = true;

        try {
          // 토큰 갱신 시도
          const newToken = await authService.refreshToken();
          
          // 원래 요청에 새 토큰 적용하여 재시도
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          console.warn('토큰 갱신 실패, 로그아웃 처리');
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          
          // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인 필수 페이지인 경우만)
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

      // 인증 관련이 아닌 API의 401 오류는 그냥 에러로 처리 (로그아웃하지 않음)
      if (error.response?.status === 401 && !isAuthAPI) {
        console.warn(`API 호출 권한 없음: ${requestUrl}`, error.response);
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