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
      
      // JWT 토큰은 axios 인터셉터에서 자동으로 추가됨
      // Spring Gateway에서 JWT를 파싱해서 X-User-Id를 다운스트림으로 전달
      const response = await axios.post<GenerateResponse>(API_URL, request);
      
      // 응답 전체 구조 로깅
      console.log('=== 생성 API 응답 전체 구조 ===');
      console.log('Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('Response Data Type:', typeof response.data);
      console.log('Response Data Keys:', response.data ? Object.keys(response.data) : 'null');
      
      // 200 OK - 즉시 완료된 경우 (기존 동기 방식)
      if (response.status === 200 && response.data.success && response.data.data?.html_list) {
        console.log('즉시 완료된 HTML 생성:', response.data.data.html_list);
        options.onComplete?.(response.data.data.html_list);
        return response.data;
      }
      
      // 202 Accepted - 비동기 처리 중
      if (response.status === 202) {
        console.log('202 응답 - 비동기 처리 감지');
        console.log('response.data:', response.data);
        console.log('response.data.data:', response.data.data);
        console.log('response.data.data?.task_id:', response.data.data?.task_id);
        
        // task_id가 다른 위치에 있을 수 있으므로 여러 경로 확인
        const taskId = response.data.data?.task_id || 
                       (response.data as any).task_id || 
                       (response.data as any).taskId || 
                       (response.data.data as any)?.taskId;
        
        console.log('추출된 Task ID:', taskId);
        
        if (!taskId) {
          console.error('Task ID를 찾을 수 없음. 응답 구조:', response.data);
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
    let lastStatus = '';
    
    toast.info('상세페이지를 생성하고 있습니다', {
      description: '잠시만 기다려주세요...'
    });

    while (attempt < maxAttempts) {
      try {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        const status = await this.checkTaskStatus(taskId);
        const currentStatus = status.data?.status || 'processing';
        
        // 상태가 변경되었을 때만 토스트 알림
        if (currentStatus !== lastStatus) {
          lastStatus = currentStatus;
          
          if (currentStatus === 'processing') {
            // 처리 중 상태 - 진행 단계별 메시지
            const progressMessages = [
              'AI가 상품 정보를 분석하고 있습니다...',
              '최적의 레이아웃을 구성하고 있습니다...',
              'HTML 코드를 생성하고 있습니다...',
              '이미지를 최적화하고 있습니다...',
              '마지막 검토를 진행하고 있습니다...'
            ];
            const messageIndex = Math.min(Math.floor(attempt / 10), progressMessages.length - 1);
            options.onProgress?.(Math.min(90, (attempt / maxAttempts) * 100), progressMessages[messageIndex]);
          }
        }
        
        if (status.success && status.data?.status === 'completed') {
          options.onProgress?.(100, '완료!');
          
          // HTML 데이터가 있으면 콜백 호출
          if (status.data.html_list) {
            options.onComplete?.(status.data.html_list);
            toast.success('상세페이지 생성이 완료되었습니다!', {
              description: `${status.data.html_list.length}개의 섹션이 생성되었습니다.`
            });
          } else if (status.data.product_details_id) {
            toast.success('상세페이지 생성이 완료되었습니다!', {
              description: '곧 에디터로 이동합니다.'
            });
          }
          
          return {
            success: true,
            message: '생성 완료',
            data: status.data
          };
        }
        
        if (status.success && status.data?.status === 'failed') {
          const errorMessage = status.data.error || status.message || '생성 실패';
          toast.error('상세페이지 생성 실패', {
            description: errorMessage
          });
          throw new Error(errorMessage);
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

    let failureCount = 0;
    const maxFailures = 5;
    let lastNotifiedStatus = '';

    const interval = setInterval(async () => {
      try {
        const status = await this.checkTaskStatus(taskId);
        const currentStatus = status.data?.status || 'processing';
        
        // 상태가 변경되었을 때 알림
        if (currentStatus !== lastNotifiedStatus) {
          lastNotifiedStatus = currentStatus;
          
          if (currentStatus === 'processing') {
            // 백그라운드에서 처리 중인 경우 간헐적으로 알림
            console.log(`작업 ${taskId} 백그라운드에서 처리 중...`);
          }
        }
        
        if (status.success && status.data?.status === 'completed') {
          clearInterval(interval);
          this.pollingIntervals.delete(taskId);
          
          // HTML 데이터가 있으면 콜백 호출
          if (status.data.html_list) {
            options.onComplete?.(status.data.html_list);
            toast.success('🎉 상세페이지 생성 완료!', {
              description: `${status.data.html_list.length}개의 섹션이 성공적으로 생성되었습니다.`,
              duration: 5000,
              action: {
                label: '에디터로 이동',
                onClick: () => {
                  // 에디터로 이동하는 로직은 컴포넌트에서 처리
                  console.log('에디터로 이동 요청');
                }
              }
            });
          } else if (status.data.product_details_id) {
            toast.success('🎉 상세페이지 생성 완료!', {
              description: '에디터에서 결과를 확인하세요.',
              duration: 5000
            });
          } else {
            console.log('작업 완료됨 (상세 데이터 없음):', taskId);
          }
          
          // 성공 시 실패 카운트 리셋
          failureCount = 0;
        }
        
        if (status.success && status.data?.status === 'failed') {
          clearInterval(interval);
          this.pollingIntervals.delete(taskId);
          
          const errorMessage = status.data.error || status.message || '생성 실패';
          toast.error('상세페이지 생성 실패', {
            description: errorMessage,
            duration: 5000
          });
          
          const error = new Error(errorMessage);
          options.onError?.(error);
        }
        
        // 성공적인 요청 시 실패 카운트 리셋
        failureCount = 0;
        
      } catch (error) {
        console.error('백그라운드 폴링 오류:', error);
        failureCount++;
        
        // 연속 실패 횟수 초과 시 중단
        if (failureCount >= maxFailures) {
          clearInterval(interval);
          this.pollingIntervals.delete(taskId);
          
          toast.warning('작업 상태 확인 중단', {
            description: '네트워크 문제로 상태 확인이 중단되었습니다. 나중에 다시 확인해주세요.'
          });
          
          options.onError?.(new Error('폴링 실패 횟수 초과'));
        }
      }
    }, 5000); // 5초마다 확인

    this.pollingIntervals.set(taskId, interval);
    
    // 10분 후 자동 정리
    setTimeout(() => {
      if (this.pollingIntervals.has(taskId)) {
        clearInterval(this.pollingIntervals.get(taskId));
        this.pollingIntervals.delete(taskId);
        
        toast.info('작업 모니터링 종료', {
          description: '작업이 오래 걸리고 있습니다. 완료 시 알림을 받으실 수 있습니다.'
        });
      }
    }, 600000);
  }

  /**
   * 작업 상태 확인 - Redis 상태 데이터를 기반으로 함
   */
  async checkTaskStatus(taskId: string): Promise<GenerateResponse> {
    try {
      const response = await axios.get<GenerateResponse>(`${API_URL}/status/${taskId}`);
      
      // Redis 상태 구조에 맞게 처리
      // status: processing | completed | failed
      console.log('작업 상태 확인:', { taskId, status: response.data });
      
      // Redis에서 가져온 상태를 그대로 사용
      if (response.data.data?.status) {
        const status = response.data.data.status;
        
        // 상태별 처리
        if (status === 'processing') {
          console.log(`작업 ${taskId} 처리 중...`);
        } else if (status === 'completed') {
          console.log(`작업 ${taskId} 완료!`);
          // 결과 데이터도 함께 가져오기 시도
          try {
            const resultResponse = await axios.get(`${API_URL}/result/${taskId}`);
            if (resultResponse.data?.data) {
              response.data.data = {
                ...response.data.data,
                ...resultResponse.data.data
              };
            }
          } catch (resultError) {
            console.log('결과 데이터 조회 실패 (정상적인 경우일 수 있음):', resultError);
          }
        } else if (status === 'failed') {
          console.error(`작업 ${taskId} 실패:`, response.data.data.error);
        }
      }
      
      return response.data;
    } catch (error) {
      // 404 에러는 작업이 완료되어 상태 정보가 삭제된 것으로 간주
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('작업 완료로 인한 404 - 상태 확인 중단:', taskId);
        return {
          success: true,
          message: '작업 완료됨 (404)',
          data: {
            status: 'completed',
            task_id: taskId
          }
        };
      }
      
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