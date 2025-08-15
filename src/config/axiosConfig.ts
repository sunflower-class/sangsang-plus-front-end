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

      // refresh 요청은 무한 루프를 방지하기 위해 제외
      const isRefreshRequest = requestUrl.includes('/api/auth/refresh');
      
      // 401 에러이고 아직 재시도하지 않은 경우, refresh 요청이 아닌 경우
      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
        originalRequest._retry = true;

        try {
          // 토큰 갱신 시도
          console.log('토큰 만료 감지, 리프레시 시도 중...');
          const newToken = await authService.refreshToken();
          console.log('토큰 리프레시 성공');
          
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

      // refresh 요청에서 401이 발생한 경우 (리프레시 토큰도 만료)
      if (error.response?.status === 401 && isRefreshRequest) {
        console.warn('리프레시 토큰도 만료됨, 로그아웃 처리');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
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