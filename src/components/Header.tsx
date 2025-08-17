import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/form/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/misc/dropdown-menu';
import { Sparkles, User, LogOut, Plus, HelpCircle, Home } from 'lucide-react';
import logo from '@/assets/images/logo.png';
import NotificationBell from '@/components/notifications/NotificationBell';


const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/sangsangplus-admin-dashboard-portal');

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="상상더하기 로고" className="h-12 w-12" />
          <span className="text-xl font-bold text-gradient-primary">상상더하기</span>
        </Link>

        {/* Navigation */}
        {!isAdminPage && (
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              // 로그인 상태
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>대시보드</span>
                </Link>
                <Link
                  to="/generate"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/generate')
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>새 페이지 생성</span>
                </Link>
                <Link
                  to="/qna"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/qna')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Q&A</span>
                </Link>
              </>
            ) : (
              // 로그아웃 상태
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
                  }`}
                >
                  서비스 소개
                </Link>
                <Link
                  to="/qna"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive('/qna') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
                  }`}
                >
                  Q&A
                </Link>
              </>
            )}
          </nav>
        )}

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user && <NotificationBell />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="hidden md:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>마이페이지</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="flex items-center space-x-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild>
                <Link to="/login">로그인</Link>
              </Button>
              <Button className="btn-primary" asChild>
                <Link to="/signup">회원가입</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;