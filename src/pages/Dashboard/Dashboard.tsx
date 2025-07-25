import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Plus, Edit, Trash2, Eye, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PageData {
  id: string;
  title: string;
  createdAt: string;
  thumbnail: string;
  status: 'completed' | 'generating' | 'draft';
}

const Dashboard = () => {
  const [pages, setPages] = useState<PageData[]>([]);

  useEffect(() => {
    // 더미 데이터 로드
    const dummyPages: PageData[] = [
      {
        id: '1',
        title: '프리미엄 무선 헤드폰 상세페이지',
        createdAt: '2024-01-15',
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        status: 'completed',
      },
      {
        id: '2',
        title: '스마트워치 Galaxy Watch 상세페이지',
        createdAt: '2024-01-14',
        thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
        status: 'completed',
      },
      {
        id: '3',
        title: '친환경 텀블러 상세페이지',
        createdAt: '2024-01-13',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        status: 'draft',
      },
    ];
    setPages(dummyPages);
  }, []);

  const handleDelete = (pageId: string) => {
    setPages(prev => prev.filter(page => page.id !== pageId));
    toast.success('페이지가 삭제되었습니다.');
  };

  const getStatusBadge = (status: PageData['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">완료</Badge>;
      case 'generating':
        return <Badge className="bg-warning text-warning-foreground">생성 중</Badge>;
      case 'draft':
        return <Badge variant="outline">임시저장</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">대시보드</h1>
            <p className="text-muted-foreground">생성한 상세페이지를 관리하고 수정하세요</p>
          </div>
          <Button className="btn-primary mt-4 md:mt-0" asChild>
            <Link to="/generate" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>새 페이지 생성</span>
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-simple">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 페이지 수</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pages.length}</div>
              <p className="text-xs text-muted-foreground">
                이번 달 {pages.filter(p => p.createdAt.startsWith('2024-01')).length}개 생성
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-simple">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료된 페이지</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pages.filter(p => p.status === 'completed').length}</div>
              <p className="text-xs text-muted-foreground">
                전체의 {Math.round((pages.filter(p => p.status === 'completed').length / pages.length) * 100)}%
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-simple">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">임시저장</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pages.filter(p => p.status === 'draft').length}</div>
              <p className="text-xs text-muted-foreground">
                수정이 필요한 페이지
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page.id} className="card-elevated hover-lift group">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={page.thumbnail}
                  alt={page.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(page.status)}
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{page.title}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(page.createdAt).toLocaleDateString('ko-KR')}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/editor/${page.id}`} className="flex items-center space-x-1">
                      <Edit className="h-3 w-3" />
                      <span>수정</span>
                    </Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>미리보기</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {pages.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">첫 번째 상세페이지를 생성해보세요</h3>
            <p className="text-muted-foreground mb-6">
              AI가 매력적인 이커머스 상세페이지를 자동으로 생성해드립니다
            </p>
            <Button className="btn-primary" asChild>
              <Link to="/generate">지금 시작하기</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;