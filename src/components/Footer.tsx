import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '@/assets/images/logo.png';
const Footer = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/sangsangplus-admin-dashboard-portal');

  if (isAdminPage) {
    return (
      <footer className="bg-background-soft border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2025 상상더하기 관리자 페이지. All rights reserved.
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-background-soft border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="상상더하기 로고" className="h-12 w-12" />
              <span className="text-lg font-bold text-gradient-primary">상상더하기</span>
            </div>
            <p className="text-muted-foreground text-sm">
              AI로 매력적인 이커머스 상세페이지를 자동 생성하고 관리하는 스마트 플랫폼
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">서비스</h3>
            <div className="space-y-2">
              <Link to="/generate" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                AI 상세페이지 생성
              </Link>
              <Link to="/dashboard" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                페이지 관리
              </Link>
              <Link to="/qna" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                고객 지원
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">지원</h3>
            <div className="space-y-2">
              <Link to="/qna" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Q&A 게시판
              </Link>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                사용 가이드
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                고객센터
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">정책</h3>
            <div className="space-y-2">
              <Link to="/terms-of-service" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                이용약관
              </Link>
              <Link to="/privacy-policy" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                개인정보처리방침
              </Link>
              <Link to="/cookie-policy" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                쿠키 정책
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 상상더하기. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;