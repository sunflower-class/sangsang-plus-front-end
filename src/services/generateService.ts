import axios from 'axios';
import { toast } from 'sonner';
import { VITE_GENERATE_URL } from '../env/env';

const API_URL = `${VITE_GENERATE_URL}/display-list`;

export interface GenerateRequest {
  product_data: string;
  product_image_url?: string;
  features?: string[];
  target_customer?: string;
  tone?: string;
  user_id?: string;
}

export interface GenerateResponse {
  success: boolean;
  message: string;
  data?: {
    task_id?: string;
    html_list?: string[];
    status?: 'processing' | 'completed' | 'failed';
    estimated_completion_time?: string;
  };
}

export type ProcessingMode = 'async' | 'wait' | 'auto';

export interface GenerateOptions {
  mode: ProcessingMode;
  onProgress?: (progress: number, status: string) => void;
  onComplete?: (result: string[]) => void;
  onError?: (error: Error) => void;
  maxWaitTime?: number; // 최대 대기 시간 (밀리초)
}

class GenerateService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 상세페이지 생성 요청
   */
  async generateHTML(request: GenerateRequest, options: GenerateOptions): Promise<GenerateResponse> {
    try {
      console.log('상세페이지 생성 요청:', { request, options });
      
      // 헤더 설정 (X-User-Id 필수)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (request.user_id) {
        headers['X-User-Id'] = request.user_id;
      }
      
      const response = await axios.post<GenerateResponse>(API_URL, request, { headers });
      
      // 200 OK - 즉시 완료된 경우 (기존 동기 방식)
      if (response.status === 200 && response.data.success && response.data.data?.html_list) {
        console.log('즉시 완료된 HTML 생성:', response.data.data.html_list);
        options.onComplete?.(response.data.data.html_list);
        return response.data;
      }
      
      // 202 Accepted - 비동기 처리 중
      if (response.status === 202) {
        const taskId = response.data.data?.task_id;
        
        if (!taskId) {
          throw new Error('Task ID를 받지 못했습니다.');
        }

        console.log('비동기 처리 시작, Task ID:', taskId);
        
        switch (options.mode) {
          case 'async':
            return this.handleAsyncMode(taskId, response.data, options);
          case 'wait':
            return this.handleWaitMode(taskId, response.data, options);
          case 'auto':
            return this.handleAutoMode(taskId, response.data, options);
          default:
            return this.handleAsyncMode(taskId, response.data, options);
        }
      }
      
      throw new Error(response.data.message || '알 수 없는 응답 형식입니다.');
      
    } catch (error) {
      console.error('HTML 생성 요청 실패:', error);
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message
        : '상세페이지 생성 중 오류가 발생했습니다.';
      
      options.onError?.(new Error(errorMessage));
      throw new Error(errorMessage);
    }
  }

  /**
   * 비동기 모드: 즉시 반환하고 알림으로만 완료 통지
   */
  private async handleAsyncMode(taskId: string, response: GenerateResponse, options: GenerateOptions): Promise<GenerateResponse> {
    toast.success('상세페이지 생성 요청이 접수되었습니다', {
      description: '생성이 완료되면 알림으로 안내해드립니다.'
    });

    // 백그라운드에서 상태 확인 (선택적)
    this.startBackgroundPolling(taskId, options);
    
    return response;
  }

  /**
   * 대기 모드: 완료될 때까지 대기하면서 진행상황 표시
   */
  private async handleWaitMode(taskId: string, response: GenerateResponse, options: GenerateOptions): Promise<GenerateResponse> {
    const maxWaitTime = options.maxWaitTime || 300000; // 5분 기본
    const pollInterval = 2000; // 2초마다 확인
    const maxAttempts = Math.floor(maxWaitTime / pollInterval);
    
    let attempt = 0;
    
    toast.info('상세페이지를 생성하고 있습니다', {
      description: '잠시만 기다려주세요...'
    });

    while (attempt < maxAttempts) {
      try {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        const status = await this.checkTaskStatus(taskId);
        const progress = Math.min(90, (attempt / maxAttempts) * 100);
        
        options.onProgress?.(progress, status.message || '처리 중...');
        
        if (status.success && status.data?.status === 'completed' && status.data.html_list) {
          options.onProgress?.(100, '완료!');
          options.onComplete?.(status.data.html_list);
          
          toast.success('상세페이지 생성이 완료되었습니다!');
          
          return {
            success: true,
            message: '생성 완료',
            data: status.data
          };
        }
        
        if (status.success && status.data?.status === 'failed') {
          throw new Error(status.message || '생성 실패');
        }
        
        attempt++;
      } catch (error) {
        console.error('상태 확인 중 오류:', error);
        // 네트워크 오류는 무시하고 계속 시도
        attempt++;
      }
    }
    
    // 시간 초과
    toast.warning('생성이 예상보다 오래 걸리고 있습니다', {
      description: '완료되면 알림으로 안내해드립니다.'
    });
    
    this.startBackgroundPolling(taskId, options);
    
    return response;
  }

  /**
   * 자동 모드: 예상 시간에 따라 대기/비동기 결정
   */
  private async handleAutoMode(taskId: string, response: GenerateResponse, options: GenerateOptions): Promise<GenerateResponse> {
    const estimatedTime = response.data?.estimated_completion_time;
    
    // 예상 시간이 2분 이하면 대기, 이상이면 비동기
    if (estimatedTime) {
      const estimatedMs = new Date(estimatedTime).getTime() - Date.now();
      if (estimatedMs <= 120000) { // 2분
        return this.handleWaitMode(taskId, response, options);
      }
    }
    
    return this.handleAsyncMode(taskId, response, options);
  }

  /**
   * 백그라운드 폴링 시작
   */
  private startBackgroundPolling(taskId: string, options: GenerateOptions) {
    if (this.pollingIntervals.has(taskId)) {
      clearInterval(this.pollingIntervals.get(taskId));
    }

    const interval = setInterval(async () => {
      try {
        const status = await this.checkTaskStatus(taskId);
        
        if (status.success && status.data?.status === 'completed' && status.data.html_list) {
          clearInterval(interval);
          this.pollingIntervals.delete(taskId);
          
          options.onComplete?.(status.data.html_list);
          console.log('백그라운드 폴링으로 완료 감지:', status.data.html_list);
        }
        
        if (status.success && status.data?.status === 'failed') {
          clearInterval(interval);
          this.pollingIntervals.delete(taskId);
          
          const error = new Error(status.message || '생성 실패');
          options.onError?.(error);
        }
      } catch (error) {
        console.error('백그라운드 폴링 오류:', error);
        // 5번 연속 실패하면 중단
        // 실제로는 더 정교한 로직 필요
      }
    }, 5000); // 5초마다 확인

    this.pollingIntervals.set(taskId, interval);
    
    // 10분 후 자동 정리
    setTimeout(() => {
      if (this.pollingIntervals.has(taskId)) {
        clearInterval(this.pollingIntervals.get(taskId));
        this.pollingIntervals.delete(taskId);
      }
    }, 600000);
  }

  /**
   * 작업 상태 확인
   */
  async checkTaskStatus(taskId: string): Promise<GenerateResponse> {
    try {
      const response = await axios.get<GenerateResponse>(`${API_URL}/status/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('작업 상태 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 폴링 중단
   */
  stopPolling(taskId: string) {
    if (this.pollingIntervals.has(taskId)) {
      clearInterval(this.pollingIntervals.get(taskId));
      this.pollingIntervals.delete(taskId);
    }
  }

  /**
   * 모든 폴링 중단
   */
  stopAllPolling() {
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
  }
}

export const generateService = new GenerateService();
export default generateService;

// 기존 함수와의 호환성을 위한 래퍼
export const generateHTML = async (productData: string, productImageUrl?: string, userId?: string): Promise<string[]> => {
  const request: GenerateRequest = {
    product_data: productData,
    product_image_url: productImageUrl,
    user_id: userId,
  };

  const response = await generateService.generateHTML(request, {
    mode: 'wait', // 기존 동작과 유사하게 대기 모드
    maxWaitTime: 120000, // 2분
  });

  if (response.success && response.data?.html_list) {
    return response.data.html_list;
  }

  throw new Error(response.message || '생성 실패');
};