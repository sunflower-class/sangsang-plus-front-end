import axios from "axios";

import { VITE_API_URL } from "../env/env";

const USER_API_URL = `${VITE_API_URL}/users`;

/** 회원가입 요청 */
export const signUp = async (user) => {
  console.log("Attempting to sign up with user data:", user);
  try {
    const response = await axios.post(USER_API_URL, user);
    console.log("회원가입 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("회원가입 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 로그인을 요청 */
export const login = async (credentials) => {
  console.log("로그인 시도:", credentials);
  try {
    const response = await axios.post(`${USER_API_URL}/authenticate`, credentials);
    console.log("로그인 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("로그인 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default {
  signUp,
  login,
};
