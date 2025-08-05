import axios from "axios";

import { VITE_USER_URL } from "../env/env";

const USER_URL = `${VITE_USER_URL}/users`;

/** 회원가입 요청 */
export const signUp = async (user) => {
  console.log("Attempting to sign up with user data:", { ...user, password: '********' });
  try {
    const response = await axios.post(USER_URL, user);
    console.log("회원가입 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("회원가입 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 로그인 요청 */
export const login = async (credentials) => {
  console.log("로그인 시도:", credentials);
  try {
    const response = await axios.post(`${USER_URL}/authenticate`, credentials);
    localStorage.setItem('user_id', response.data.id);
    console.log("로그인 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("로그인 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 이메일로 사용자 정보 조회 */
export const getUserByEmail = async (email) => {
  console.log("이메일로 사용자 정보 조회 시도:", email);
  try {
    const response = await axios.get(`${USER_URL}/email/${email}`);
    console.log("사용자 정보 조회 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 사용자 이름 변경 */
export const updateUserName = async (id, newName) => {
  console.log(`사용자 ID ${id} 이름 변경 시도:`, { newName });
  try {
    const response = await axios.put(`${USER_URL}/${id}`, { name: newName });
    console.log("이름 변경 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("이름 변경 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 사용자 비밀번호 업데이트 */
export const updateUserPassword = async (id, newPassword) => {
  console.log(`사용자 ID ${id} 비밀번호 업데이트 시도:`, { newPassword: "********" });
  try {
    const response = await axios.put(`${USER_URL}/${id}`, { password: newPassword });
    console.log("비밀번호 업데이트 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("비밀번호 업데이트 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/** 사용자 삭제 */
export const deleteUser = async (id) => {
  console.log(`사용자 ID ${id} 삭제 시도:`);
  try {
    const response = await axios.delete(`${USER_URL}/${id}`);
    console.log("사용자 삭제 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("사용자 삭제 실패:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default {
  signUp,
  login,
  getUserByEmail,
  updateUserName,
  updateUserPassword,
  deleteUser,
};