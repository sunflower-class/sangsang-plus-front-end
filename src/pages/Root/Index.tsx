import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Target, 
  Palette,
  Code,
  Image as ImageIcon,
  Clock,
  Star,
  Users,
  TrendingUp,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  🚀 AI 기반 자동 생성 서비스
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  AI가 만드는<br />
                  <span className="text-accent">완벽한 상세페이지</span>
                </h1>
                <p className="text-xl opacity-90 leading-relaxed">
                  상품 정보만 입력하면 AI가 매력적인 이커머스 상세페이지를 자동으로 생성합니다. 
                  디자인부터 콘텐츠까지, 모든 것이 자동으로!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg" asChild>
                    <Link to="/generate" className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>지금 시작하기</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg" asChild>
                      <Link to="/signup" className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5" />
                        <span>무료로 시작하기</span>
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-8 text-sm opacity-80">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>무료 체험</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>신용카드 불필요</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>5분만에 완성</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gradient-to-r from-primary to-secondary rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="h-16 bg-accent rounded"></div>
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-16 bg-secondary rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-accent font-medium">
                      <Zap className="h-5 w-5" />
                      <span>실시간 AI 생성</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
