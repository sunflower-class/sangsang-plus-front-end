import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isTokenExpiringSoon, getTokenTimeToExpiry } from '@/utils/tokenUtils';
import authService from '@/apis/authService';

/**
 * 토큰 자동 갱신 훅
 * 토큰이 만료되기 전에 미리 갱신하여 사용자 경험 향상
 */
export const useTokenRefresh = () => {
  const { token, user } = useAuth();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  const scheduleTokenRefresh = (currentToken: string) => {
    // 기존 타이머 클리어
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const timeToExpiry = getTokenTimeToExpiry(currentToken);
    
    // 토큰이 이미 만료되었거나 5분 이하로 남았으면 즉시 갱신
    if (timeToExpiry <= 5 * 60 * 1000) {
      performTokenRefresh();
      return;
    }

    // 만료 5분 전에 갱신하도록 스케줄링
    const refreshTime = timeToExpiry - (5 * 60 * 1000);
    
    console.log(`토큰 자동 갱신 스케줄링: ${Math.round(refreshTime / 1000 / 60)}분 후`);
    
    refreshTimeoutRef.current = setTimeout(() => {
      performTokenRefresh();
    }, refreshTime);
  };

  const performTokenRefresh = async () => {
    const now = Date.now();
    
    // 중복 요청 방지 (5초 이내 재요청 방지)
    if (now - lastRefreshRef.current < 5000) {
      console.log('토큰 갱신 중복 요청 방지');
      return;
    }

    lastRefreshRef.current = now;

    try {
      console.log('프로액티브 토큰 갱신 시작');
      const newToken = await authService.refreshToken();
      
      // 다음 갱신 스케줄링
      scheduleTokenRefresh(newToken);
      
      console.log('프로액티브 토큰 갱신 완료');
    } catch (error) {
      console.error('프로액티브 토큰 갱신 실패:', error);
      
      // 갱신 실패 시 재시도 (1분 후)
      refreshTimeoutRef.current = setTimeout(() => {
        performTokenRefresh();
      }, 60 * 1000);
    }
  };

  useEffect(() => {
    if (!token || !user) {
      // 토큰이 없으면 스케줄링 중단
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      return;
    }

    // 현재 토큰으로 갱신 스케줄링
    scheduleTokenRefresh(token);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [token, user]);

  // 페이지 포커스 시 토큰 상태 확인
  useEffect(() => {
    const handleFocus = () => {
      if (token && isTokenExpiringSoon(token, 5)) {
        console.log('페이지 포커스 시 토큰 만료 임박 감지, 갱신 시도');
        performTokenRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [token]);
};

export default useTokenRefresh;