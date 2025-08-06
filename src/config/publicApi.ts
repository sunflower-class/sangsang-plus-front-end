import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * 공개 API용 axios 인스턴스 (토큰 없이 호출)
 * QnA, 공지사항 등 인증이 필요하지 않은 API용
 */
export const publicApiClient: AxiosInstance = axios.create({
  timeout: 10000, // 10초 타임아웃
});

// Request 인터셉터: 토큰을 추가하지 않음
publicApiClient.interceptors.request.use(
  (config) => {
    // 공개 API는 토큰을 추가하지 않음
    console.log(`Public API 호출: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터: 에러 로깅만 하고 자동 로그아웃하지 않음
publicApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const requestUrl = error.config?.url || '';
    
    if (error.response) {
      // 서버 응답이 있는 경우
      console.warn(`Public API 에러: ${error.response.status} ${requestUrl}`, error.response.data);
    } else if (error.request) {
      // 서버 응답이 없는 경우 (네트워크 에러, 서버 다운 등)
      console.error(`Public API 네트워크 에러: ${requestUrl}`, error.message);
    } else {
      // 기타 에러
      console.error(`Public API 요청 설정 에러: ${requestUrl}`, error.message);
    }
    
    return Promise.reject(error);
  }
);

export default publicApiClient;