import axios from 'axios';
import { VITE_ABTEST_URL } from '../env/env';
import {
  CreateTestWithBriefRequest,
  CreateTestRequest,
  TestActionRequest,
  TestListResponse,
  TestDetailResponse,
  VariantAssignmentResponse,
  StatusResponse,
  TestEventRequest,
  ManualDecisionRequest,
  CycleActionRequest,
  LongTermMetricsRequest,
  isErrorResponse
} from '@/types/abtest';

const ABTEST_URL = `${VITE_ABTEST_URL}/api/abtest`;

// Axios 인스턴스 (추후 인터셉터/공통 헤더 확장 가능)
const api = axios.create({ baseURL: ABTEST_URL });

// 공통 에러 핸들링 래퍼
async function requestWrapper<T>(fn: () => Promise<unknown>): Promise<T> {
  try {
    const res = await fn();
    // axios response 객체로 가정
    if (typeof res === 'object' && res !== null && 'data' in res) {
      return (res as { data: unknown }).data as T;
    }
    return res as T;
  } catch (e: unknown) {
    const maybeAxios = e as { response?: { data?: unknown } };
    if (isErrorResponse(maybeAxios.response?.data)) {
      throw new Error(maybeAxios.response!.data.error);
    }
    throw e;
  }
}

/**
 * 실험 계약서와 함께 A/B 테스트 생성
 */
export const createTestWithBrief = (testData: CreateTestWithBriefRequest) =>
  requestWrapper<StatusResponse & { test_id?: string }>(() => api.post('/create-with-brief', testData));

export const createTest = (data: CreateTestRequest) =>
  requestWrapper<StatusResponse & { test_id?: string }>(() => api.post('/create', data));

/**
 * A/B 테스트 목록 조회
 */
export const getAbTests = () => requestWrapper<TestListResponse>(() => api.get('/list'));

/**
 * A/B 테스트 상세 조회
 */
export const getTestDetail = (testId: string) => requestWrapper<TestDetailResponse>(() => api.get(`/${testId}`));

/**
 * A/B 테스트 결과 조회
 */
export const getTestResults = (testId: string) => requestWrapper<Record<string, unknown>>(() => api.get(`/${testId}/results`));

/**
 * 테스트 액션 (시작, 일시정지, 완료)
 */
export const testAction = (actionData: TestActionRequest) =>
  requestWrapper<StatusResponse | { error: string }>(() => api.post('/action', actionData));

/**
 * 테스트 요약 목록 조회
 */
export const getTestSummaries = (limit = 10) =>
  requestWrapper<Record<string, unknown>>(() => api.get('/dashboard/test-summaries', { params: { limit } }));

/**
 * 실시간 메트릭 조회
 */
export const getRealTimeMetrics = (testId: string) =>
  requestWrapper<Record<string, unknown>>(() => api.get(`/dashboard/real-time/${testId}`));

/**
 * 실험 리포트 생성
 */
export const generateExperimentReport = (testId: string) =>
  requestWrapper<Record<string, unknown>>(() => api.get(`/report/${testId}`));

/**
 * 사용자별 변형 조회
 */
export const getUserVariant = (testId: string, userId: string, sessionId?: string) => {
  const params: Record<string, string> = {};
  if (sessionId) params.session_id = sessionId;
  return requestWrapper<VariantAssignmentResponse>(() => api.get(`/${testId}/variant/${userId}`, { params }));
};

// 추가 기능들
export const recordTestEvent = (data: TestEventRequest) =>
  requestWrapper<StatusResponse>(() => api.post('/event', data));

export const manualSelectWinner = (data: ManualDecisionRequest) =>
  requestWrapper<StatusResponse>(() => api.post('/manual-decision', data));

export const cycleAction = (data: CycleActionRequest) =>
  requestWrapper<StatusResponse>(() => api.post('/cycle/action', data));

export const startLongTermMonitoring = (test_id: string) =>
  requestWrapper<StatusResponse>(() => api.post('/long-term-monitoring/start', null, { params: { test_id } }));

export const recordLongTermMetrics = (data: LongTermMetricsRequest) =>
  requestWrapper<StatusResponse>(() => api.post('/long-term-monitoring/record', data));

export const getEvents = (test_id: string, limit = 100) =>
  requestWrapper<Record<string, unknown>>(() => api.get(`/${test_id}/events`, { params: { limit } }));

export const banditVariant = (testId: string, userId: string, sessionId?: string) => {
  const params: Record<string, string> = {};
  if (sessionId) params.session_id = sessionId;
  // 실제 경로: /api/abtest/{test_id}/variant-bandit/{user_id}
  return requestWrapper<VariantAssignmentResponse>(() => api.get(`/${testId}/variant-bandit/${userId}`, { params }));
};


export default {
  createTestWithBrief,
  createTest,
  getAbTests,
  getTestDetail,
  getTestResults,
  testAction,
  getTestSummaries,
  getRealTimeMetrics,
  generateExperimentReport,
  getUserVariant,
  banditVariant,
  recordTestEvent,
  manualSelectWinner,
  cycleAction,
  startLongTermMonitoring,
  recordLongTermMetrics,
  getEvents,
};
