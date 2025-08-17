/**
 * JWT 토큰 유틸리티 함수들
 */

export interface JWTPayload {
  userId?: string;
  sub?: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  exp?: number;
  iat?: number;
}

/**
 * JWT 토큰을 디코드하여 페이로드 반환
 */
export const decodeJWTPayload = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};

/**
 * JWT 토큰이 만료되었는지 확인
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return true;
  
  // exp는 초 단위, Date.now()는 밀리초 단위
  return payload.exp * 1000 < Date.now();
};

/**
 * JWT 토큰이 곧 만료될지 확인 (기본 5분 전)
 */
export const isTokenExpiringSoon = (token: string, minutesBefore = 5): boolean => {
  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return true;
  
  const expirationTime = payload.exp * 1000;
  const warningTime = expirationTime - (minutesBefore * 60 * 1000);
  
  return Date.now() > warningTime;
};

/**
 * JWT 토큰에서 사용자 정보 추출
 */
export const extractUserFromToken = (token: string) => {
  const payload = decodeJWTPayload(token);
  if (!payload) return null;
  
  return {
    id: payload.userId || payload.sub || '',
    email: payload.email || payload.preferred_username || '',
    name: payload.name || payload.preferred_username || payload.email || '',
    isAdmin: false // 필요시 role 필드에서 판단
  };
};

/**
 * 토큰 만료까지 남은 시간 (밀리초)
 */
export const getTokenTimeToExpiry = (token: string): number => {
  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return 0;
  
  const expirationTime = payload.exp * 1000;
  const timeLeft = expirationTime - Date.now();
  
  return Math.max(0, timeLeft);
};

/**
 * 토큰 만료까지 남은 시간을 포맷된 문자열로 반환
 */
export const formatTimeToExpiry = (token: string): string => {
  const timeLeft = getTokenTimeToExpiry(token);
  
  if (timeLeft === 0) return '만료됨';
  
  const minutes = Math.floor(timeLeft / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}일 남음`;
  if (hours > 0) return `${hours}시간 남음`;
  if (minutes > 0) return `${minutes}분 남음`;
  return '곧 만료';
};