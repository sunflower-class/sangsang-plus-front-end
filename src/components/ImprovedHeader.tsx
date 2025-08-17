import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/form/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/misc/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/overlay/sheet';
import { Badge } from '@/components/ui/data-display/badge';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  MessageSquare, 
  BarChart3, 
  Home,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/images/logo.png';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  { label: '홈', href: '/', icon: Home },
  { label: '상세페이지 제작', href: '/generate', icon: Sparkles },
  { label: '리뷰 분석', href: '/review-analysis', icon: BarChart3 },
  { label: 'Q&A', href: '/qna', icon: MessageSquare },
  { label: '요금제', href: '/payments', icon: CreditCard },
];

const ImprovedHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="상상더하기 로고" className="h-12 w-12" />
            <span className="hidden sm:inline text-xl font-bold text-gradient-primary">상상더하기</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = isActivePath(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`
                      relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="ml-1 text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 border-orange-200"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu - 항상 표시 */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <img src={logo} alt="상상더하기 로고" className="h-8 w-8" />
                    <h2 className="text-lg font-semibold">상상더하기</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={closeMobileMenu}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {user && (
                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const isActive = isActivePath(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={closeMobileMenu}
                          className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                            ${isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }
                          `}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                )}

                {/* Mobile User Actions */}
                {user ? (
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center space-x-3 px-4 py-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Link
                        to="/profile"
                        onClick={closeMobileMenu}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>마이페이지</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="w-full justify-start"
                      onClick={closeMobileMenu}
                    >
                      <Link to="/login">로그인</Link>
                    </Button>
                    <Button 
                      className="w-full" 
                      asChild
                      onClick={closeMobileMenu}
                    >
                      <Link to="/signup">회원가입</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Desktop User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">환영합니다!</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center space-x-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>마이페이지</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={logout} 
                    className="flex items-center space-x-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" asChild className="hover:bg-muted/50 transition-colors">
                  <Link to="/login">로그인</Link>
                </Button>
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md transition-all" asChild>
                  <Link to="/signup">회원가입</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ImprovedHeader;
