import axios from "axios";
import { VITE_REVIEW_URL } from "../env/env";

const API_BASE_URL = VITE_REVIEW_URL;

// --- 리뷰 분석 API (3개 엔드포인트만) ---

/**
 * 파일 업로드를 통한 리뷰 분석
 * POST /api/review/upload-file
 * @param {File} file - 업로드할 파일 (CSV, Excel)
 * @param {string} [productName] - 제품명 (선택사항)
 * @returns {Promise<object>} 파일 업로드 및 분석 결과
 */
export const uploadFileReviews = (file, productName = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (productName) {
    formData.append('product_name', productName);
  }

  return axios.post(`${API_BASE_URL}/upload-file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('파일 업로드 리뷰 분석 성공:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('파일 업로드 리뷰 분석 실패:', error.response ? error.response.data : error.message);
      throw error;
    });
};

/**
 * 수동 리뷰 일괄 분석
 * POST /api/review/batch-manual
 * @param {object} payload - 요청 데이터
 * @param {Array} payload.reviews - 리뷰 목록
 * @param {string} [payload.product_name] - 공통 제품명
 * @returns {Promise<object>} 일괄 분석 결과
 */
export const addBatchManualReviews = (payload) => {
  return axios.post(`${API_BASE_URL}/batch-manual`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      console.log('수동 리뷰 일괄 분석 성공:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('수동 리뷰 일괄 분석 실패:', error.response ? error.response.data : error.message);
      throw error;
    });
};

/**
 * 통합 분석 (파일 + 수동 리뷰)
 * POST /api/review/integrated-analysis
 * @param {File} [file] - 업로드할 파일 (선택사항)
 * @param {string} [productName] - 제품명 (선택사항)
 * @param {Array} [manualReviews] - 수동 리뷰 목록 (선택사항)
 * @returns {Promise<object>} 통합 분석 결과
 */
export const integratedAnalysis = (file = null, productName = null, manualReviews = null) => {
  const formData = new FormData();
  
  if (file) {
    formData.append('file', file);
  }
  if (productName) {
    formData.append('product_name', productName);
  }
  if (manualReviews) {
    formData.append('manual_reviews', JSON.stringify(manualReviews));
  }

  return axios.post(`${API_BASE_URL}/integrated-analysis`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then(response => {
      console.log('통합 분석 성공:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('통합 분석 실패:', error.response ? error.response.data : error.message);
      throw error;
    });
};


