import axios from "axios";
import { VITE_REVIEW_URL } from "../env/env";

const API_BASE_URL = VITE_REVIEW_URL;

/**
 * Generic API caller function using axios for review analysis.
 * @param {string} method - The HTTP method (get, post, put, delete).
 * @param {string} endpoint - The API endpoint.
 * @param {object} [data={}] - The data for POST, PUT requests.
 * @param {object} [params={}] - The query parameters for GET requests.
 * @returns {Promise<any>} - The response data from the API.
 */
const apiClient = async (method, endpoint, data = {}, params = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await axios({
      method,
      url,
      data,
      params,
      headers: { "Content-Type": "application/json" },
    });
    console.log(`리뷰 분석 API 호출: ${method.toUpperCase()} ${url}`, data, params);
    console.log(`응답:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`리뷰 분석 API 오류 발생: ${method.toUpperCase()} ${url}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- 리뷰 분석 API ---

/**
 * 단일 리뷰 분석
 * POST /python/review/analyze
 * @param {object} payload - The request payload.
 * @param {string} payload.review_text - 리뷰 텍스트 (별점 정보 포함 가능).
 * @param {string} [payload.product_name] - 제품명 (선택사항).
 * @returns {Promise<object>} The analysis result.
 */
export const analyzeSingleReview = (payload) => {
  return apiClient('post', '/analyze', payload);
};

/**
 * 종합 리뷰 분석 (여러 리뷰)
 * POST /python/review/comprehensive-analysis
 * @param {object} payload - The request payload.
 * @param {string} payload.product_name - 제품명.
 * @param {object[]} payload.reviews - 리뷰 배열.
 * @param {string} payload.reviews[].review_text - 리뷰 텍스트 (별점 정보 포함 가능).
 * @param {string} [payload.reviews[].product_name] - 제품명 (선택사항).
 * @returns {Promise<object>} The comprehensive analysis result.
 */
export const analyzeMultipleReviews = (payload) => {
  return apiClient('post', '/comprehensive-analysis', payload);
};

// --- 기본 시스템 API ---

/**
 * API 상태 확인
 * GET /python
 * @returns {Promise<object>} API 상태 정보.
 */
export const checkApiStatus = () => {
  // API_BASE_URL에서 /python/review를 제거하고 /python만 사용
  const baseUrl = API_BASE_URL.replace('/python/review', '/python');
  return axios.get(baseUrl)
    .then(response => {
      console.log('리뷰 분석 API 상태 확인:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('리뷰 분석 API 상태 확인 실패:', error.response ? error.response.data : error.message);
      throw error;
    });
};

/**
 * Kafka 메시지 전송
 * POST /python/message
 * @param {object} payload - 전송할 메시지 데이터.
 * @returns {Promise<object>} The message sending result.
 */
export const sendKafkaMessage = (payload) => {
  // API_BASE_URL에서 /python/review를 제거하고 /python/message 사용
  const url = API_BASE_URL.replace('/python/review', '/python/message');
  return axios.post(url, payload, {
    headers: { "Content-Type": "application/json" }
  })
    .then(response => {
      console.log('Kafka 메시지 전송 성공:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Kafka 메시지 전송 실패:', error.response ? error.response.data : error.message);
      throw error;
    });
};

// --- 타입 정의 (참고용) ---
export interface ReviewRequest {
  review_text: string;
  product_name?: string | null;
}

export interface MultipleReviewsRequest {
  product_name: string;
  reviews: ReviewRequest[];
}

export interface AnalysisResult {
  review_id?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  summary?: string;
  rating_prediction?: number;
}

export interface ComprehensiveAnalysisResult {
  product_name: string;
  total_reviews: number;
  overall_sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  average_rating: number;
  top_keywords: Array<{
    keyword: string;
    frequency: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  individual_results: AnalysisResult[];
}
