import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

interface ProtectedRouteProps {
  adminOnly?: boolean; // 관리자 전용 여부
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // 로딩 중 표시
  }

  // 인증 여부 확인
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 관리자 전용 페이지인 경우, 관리자 권한 확인 (임시 비활성화)
  // if (adminOnly && !user.isAdmin) {
  //   return <Navigate to="/unauthorized" replace />; // 권한 없음 페이지로 리다이렉트
  // }

  return <Outlet />;
};

export default ProtectedRoute;
