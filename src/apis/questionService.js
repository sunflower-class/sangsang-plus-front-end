import axios from "axios";
import { VITE_QUESTION_URL} from "../env/env";

const API_BASE_URL = VITE_QUESTION_URL;

/**
 * Generic API caller function using axios.
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
    console.log(`API 호출: ${method.toUpperCase()} ${url}`, data, params);
    console.log(`응답:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API 오류 발생: ${method.toUpperCase()} ${url}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- Chatbot API ---

/**
 * RAG 챗봇 답변 생성
 * POST /management/chat/query
 * @param {object} payload - The request payload.
 * @param {string} payload.question - 사용자가 챗봇에게 던지는 질문.
 * @param {string} [payload.user_id] - 사용자 ID (대화 기록 관리용).
 * @param {string} [payload.conversation_id] - 대화 세션 ID.
 * @returns {Promise<object>} The chat query response.
 */
export const chatQuery = (payload) => {
  return apiClient('post', '/chat/query', payload);
};

// --- Board & Post API ---

/**
 * 게시글 요약 및 검수 대기 질문 등록
 * POST /management/posts/summarize_and_submit
 * @param {object} payload - The request payload.
 * @param {string} payload.text_content - 요약 및 질문 생성을 위한 원본 텍스트.
 * @param {string[]} [payload.tags] - 적용할 태그 리스트.
 * @returns {Promise<any>} The API response.
 */
export const summarizeAndSubmitPost = (payload) => {
  return apiClient('post', '/posts/summarize_and_submit', payload);
};

/**
 * 게시판 게시물 등록
 * POST /management/board/posts
 * @param {object} payload - The request payload.
 * @param {string} payload.title - 게시판에 등록할 게시물의 제목.
 * @param {string} payload.content - 게시판에 등록할 게시물의 본문.
 * @param {string} payload.user_id - 게시물을 작성한 사용자의 ID.
 * @returns {Promise<any>} The API response.
 */
export const createBoardPost = (payload) => {
  return apiClient('post', '/board/posts', payload);
};

// --- Q&A Management API ---

/**
 * 검수 대기 질문 목록 조회
 * GET /management/qna/pending
 * @returns {Promise<object>} List of pending Q&As.
 */
export const getPendingQnas = () => {
  return apiClient('get', '/qna/pending');
};

/**
 * 검수 대기 질문 처리
 * POST /management/qna/review_and_register
 * @param {object} payload - The request payload.
 * @returns {Promise<any>} The API response.
 */
export const reviewAndRegisterQna = (payload) => {
  return apiClient('post', '/qna/review_and_register', payload);
};

// --- RAG Q&A API ---

/**
 * RAG Q&A 목록 조회
 * GET /management/rag/qna
 * @param {object} [params] - Query parameters.
 * @returns {Promise<object>} List of RAG Q&A items.
 */
export const getRagQnaList = (params) => {
  return apiClient('get', '/rag/qna', {}, params);
};

/**
 * RAG Q&A 검색
 * POST /management/rag/qna/search
 * @param {object} payload - The search payload.
 * @returns {Promise<object>} Search results.
 */
export const searchRagQna = (payload) => {
  return apiClient('post', '/rag/qna/search', payload);
};

/**
 * RAG Q&A 상세 조회
 * GET /management/rag/qna/{qna_id}
 * @param {string} qnaId - The ID of the Q&A item.
 * @returns {Promise<object>} The Q&A item details.
 */
export const getRagQnaDetail = (qnaId) => {
  return apiClient('get', `/rag/qna/${qnaId}`);
};

/**
 * RAG Q&A 수정
 * PUT /management/rag/qna/{qna_id}
 * @param {string} qnaId - The ID of the Q&A item to update.
 * @param {object} payload - The update payload.
 * @returns {Promise<object>} The operation response.
 */
export const updateRagQna = (qnaId, payload) => {
  return apiClient('put', `/rag/qna/${qnaId}`, payload);
};

/**
 * RAG Q&A 삭제
 * DELETE /management/rag/qna/{qna_id}
 * @param {string} qnaId - The ID of the Q&A item to delete.
 * @param {object} payload - The delete payload.
 * @returns {Promise<object>} The operation response.
 */
export const deleteRagQna = (qnaId, payload) => {
  return apiClient('delete', `/rag/qna/${qnaId}`, payload);
};

// --- Conversation API ---

/**
 * 새로운 대화 세션 생성
 * POST /management/conversations/create
 * @param {object} payload - The request payload.
 * @param {string} payload.user_id - 사용자 ID.
 * @returns {Promise<object>} The conversation creation response.
 */
export const createConversation = (payload) => {
  return apiClient('post', '/conversations/create', payload);
};

/**
 * 대화 기록 조회
 * GET /management/conversations/{user_id}/{conversation_id}
 * @param {string} userId - The user's ID.
 * @param {string} conversationId - The conversation's ID.
 * @returns {Promise<object>} The conversation history.
 */
export const getConversation = (userId, conversationId) => {
  return apiClient('get', `/conversations/${userId}/${conversationId}`);
};

// --- Feedback API ---

/**
 * 사용자 피드백 등록
 * POST /management/feedback
 * @param {object} payload - The feedback payload.
 * @returns {Promise<object>} The feedback response.
 */
export const addFeedback = (payload) => {
  return apiClient('post', '/feedback', payload);
};

// --- Admin Specific APIs ---

/**
 * 관리자 답변 등록
 * POST /management/admin/submit-answer
 * @param {object} payload - The request payload.
 * @returns {Promise<any>} The API response.
 */
export const submitAdminAnswer = (payload) => {
    return apiClient('post', '/admin/submit-answer', payload);
};

/**
 * 대기 중인 게시글 목록
 * GET /management/admin/pending-posts
 * @returns {Promise<any>} List of pending posts.
 */
export const getPendingPosts = () => {
    return apiClient('get', '/admin/pending-posts');
};

/**
 * 게시글 상세 조회
 * GET /management/admin/posts/{post_id}
 * @param {string} postId - The ID of the post.
 * @returns {Promise<any>} The post details.
 */
export const getPostDetail = (postId) => {
    return apiClient('get', `/admin/posts/${postId}`);
};

/**
 * 게시글 댓글 조회
 * GET /management/admin/posts/{post_id}/comments
 * @param {string} postId - The ID of the post.
 * @returns {Promise<any>} The post comments.
 */
export const getPostComments = (postId) => {
    return apiClient('get', `/admin/posts/${postId}/comments`);
};
