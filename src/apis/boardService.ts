import axios from "axios";
import { VITE_BOARD_URL } from "../env/env"; 

const API_BASE_URL = VITE_BOARD_URL;

/**
 * Generic API caller function using axios.
 * @param {string} method - The HTTP method (get, post, patch, delete).
 * @param {string} endpoint - The API endpoint.
 * @param {object} [data={}] - The data for POST, PATCH requests.
 * @param {object} [params={}] - The query parameters for GET requests.
 * @returns {Promise<any>} - The response data from the API.
 */
const apiClient = async (method: string, endpoint: string, data: object = {}, params: object = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await axios({
      method,
      url,
      data,
      params,
      headers: { "Content-Type": "application/json" },
    });
    console.log(`API Call: ${method.toUpperCase()} ${url}`, { data, params });
    console.log(`Response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API Error: ${method.toUpperCase()} ${url}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

// --- Post APIs ---

/**
 * Create a new post.
 * POST /api/posts
 * @param {object} payload - The post creation data.
 * @param {string} payload.title - The title of the post.
 * @param {string} payload.content - The content of the post.
 * @param {string} payload.author - The author of the post.
 * @param {string} [payload.user_id] - The ID of the user.
 * @param {string[]} [payload.tags] - A list of tags.
 * @param {string} [payload.status] - The status of the post (e.g., "pending").
 * @returns {Promise<any>} The created post data.
 */
export const createPost = (payload: object) => {
  return apiClient('post', '/posts', payload);
};

/**
 * Get a list of posts.
 * GET /api/posts
 * @param {object} [params] - Query parameters.
 * @param {string} [params.status] - Filter by post status.
 * @param {string} [params.author] - Filter by author.
 * @param {number} [params.limit] - The maximum number of posts to return.
 * @param {number} [params.offset] - The starting offset for pagination.
 * @returns {Promise<any>} A list of posts.
 */
export const getPosts = (params: object = {}) => {
  return apiClient('get', '/posts', {}, params);
};

/**
 * Get a single post by its ID.
 * GET /api/posts/{post_id}
 * @param {string} postId - The ID of the post.
 * @returns {Promise<any>} The post data.
 */
export const getPost = (postId: string) => {
  return apiClient('get', `/posts/${postId}`);
};

/**
 * Update the status of a post.
 * PATCH /api/posts/{post_id}/status
 * @param {string} postId - The ID of the post.
 * @param {object} payload - The data for updating the status.
 * @param {string} payload.status - The new status ('pending', 'approved', 'rejected').
 * @returns {Promise<any>} The updated post data.
 */
export const updatePostStatus = (postId: string, payload: object) => {
  return apiClient('patch', `/posts/${postId}/status`, payload);
};

/**
 * Get all posts with "pending" status.
 * GET /api/posts/pending
 * @returns {Promise<any>} A list of pending posts.
 */
export const getPendingPosts = () => {
  return apiClient('get', '/posts/pending');
};


// --- Comment APIs ---

/**
 * Create a comment on a post.
 * POST /api/posts/{post_id}/comments
 * @param {string} postId - The ID of the post to comment on.
 * @param {object} payload - The comment creation data.
 * @param {string} payload.content - The content of the comment.
 * @param {string} payload.author - The author of the comment.
 * @param {boolean} [payload.is_admin] - Whether the comment is from an admin.
 * @returns {Promise<any>} The created comment data.
 */
export const createComment = (postId: string, payload: object) => {
  return apiClient('post', `/posts/${postId}/comments`, payload);
};

/**
 * Get all comments for a specific post.
 * GET /api/posts/{post_id}/comments
 * @param {string} postId - The ID of the post.
 * @returns {Promise<any>} A list of comments for the post.
 */
export const getPostComments = (postId: string) => {
  return apiClient('get', `/posts/${postId}/comments`);
};
