import axios from "axios";
import { VITE_QUESTION_URL } from "../env/env";

const QUESTION_API_URL = VITE_QUESTION_URL;

/** 챗봇 질문 API 호출 */
export const askQuestion = async (payload) => {
  const url = QUESTION_API_URL;
  try {ㅣ
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("챗봇 질문 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** Q&A 목록 조회 */
export const getQnaList = async (limit = 50, offset = 0) => {
  const url = QUESTION_API_URL.replace("/management/chat/query", "/management/rag/qna");
  try {
    const response = await axios.get(url, { params: { limit, offset } });
    return response.data;
  } catch (error) {
    console.error("Q&A 목록 조회 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** Q&A 검색 */
export const searchQna = async (query, limit = 50) => {
  const url = QUESTION_API_URL.replace("/management/chat/query", "/management/rag/qna/search");
  try {
    const response = await axios.post(url, { query, limit });
    return response.data;
  } catch (error) {
    console.error("Q&A 검색 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 대화 생성 */
export const createConversation = async (user_id) => {
  const url = QUESTION_API_URL.replace("/management/chat/query", "/management/conversations/create");
  try {
    const response = await axios.post(url, { user_id });
    return response.data;
  } catch (error) {
    console.error("대화 생성 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 대기 중인 게시글 목록 (관리자) */
export const getPendingPosts = async () => {
  const url = QUESTION_API_URL.replace("/management/chat/query", "/management/admin/pending-posts");
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("대기 게시글 목록 조회 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 게시글 상세 조회 (관리자) */
export const getPostDetail = async (postId) => {
  const url = QUESTION_API_URL.replace("/management/chat/query", `/management/admin/posts/${postId}`);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("게시글 상세 조회 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 게시글 댓글 목록 (관리자) */
export const getPostComments = async (postId) => {
  const url = QUESTION_API_URL.replace("/management/chat/query", `/management/admin/posts/${postId}/comments`);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("게시글 댓글 목록 조회 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 게시글 답변 등록 (관리자) */
export const submitAdminAnswer = async (post_id, admin_answer, admin_user_id) => {
  const url = QUESTION_API_URL.replace("/management/chat/query", "/management/admin/submit-answer");
  try {
    const response = await axios.post(url, { post_id, admin_answer, admin_user_id });
    return response.data;
  } catch (error) {
    console.error("게시글 답변 등록 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default {
  askQuestion,
  getQnaList,
  searchQna,
  createConversation,
  getPendingPosts,
  getPostDetail,
  getPostComments,
  submitAdminAnswer,
};