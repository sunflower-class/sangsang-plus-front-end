import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Plus, Edit, Trash2, Eye, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface PageData {
  id: number;
  product_id?: number;
  user_id: string;
  original_product_info: string;
  generated_html?: {
    html_blocks: string[];
    image_count: number;
    generation_completed: boolean;
  };
  status: 'processing' | 'completed' | 'failed' | 'draft' | 'published';
  created_at: string;
  updated_at: string;
  product_images?: any[];
}

const Dashboard = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!user?.id) return;
      
      try {
        console.log('📋 상품 목록 조회 시작...');
        setLoading(true);
        
        const response = await axios.get<PageData[]>(
          `${import.meta.env.VITE_API_URL}/api/generation/product-details`
        );
        
        console.log('📋 상품 목록 조회 성공:', response.data);
        setPages(response.data);
      } catch (error) {
        console.error('❌ 상품 목록 조회 실패:', error);
        toast.error('상품 목록을 불러오는데 실패했습니다.');
        
        // 에러 시 빈 배열로 설정
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [user?.id]);

  const handleDelete = (pageId: number) => {
    // TODO: 실제 삭제 API 연결 필요
    setPages(prev => prev.filter(page => page.id !== pageId));
    toast.success('페이지가 삭제되었습니다.');
  };

  const getStatusBadge = (status: PageData['status']) => {
    switch (status) {
      case 'completed':
      case 'published':
        return <Badge className="bg-success text-success-foreground">완료</Badge>;
      case 'processing':
        return <Badge className="bg-warning text-warning-foreground">생성 중</Badge>;
      case 'draft':
        return <Badge variant="outline">임시저장</Badge>;
      case 'failed':
        return <Badge className="bg-destructive text-destructive-foreground">실패</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getThumbnail = (page: PageData) => {
    // 상품 이미지가 있으면 사용, 없으면 플레이스홀더
    if (page.product_images && page.product_images.length > 0) {
      return page.product_images[0].temp_url || page.product_images[0].s3_url;
    }
    return 'https://placehold.co/400x300/png?text=Product+Image';
  };

  const getTitle = (page: PageData) => {
    return page.original_product_info || `상세페이지 #${page.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">상품 목록 로딩 중...</h2>
          <p className="text-muted-foreground">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

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
                이번 달 {pages.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length}개 생성
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-simple">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료된 페이지</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pages.filter(p => p.status === 'completed' || p.status === 'published').length}
              </div>
              <p className="text-xs text-muted-foreground">
                전체의 {pages.length > 0 ? Math.round((pages.filter(p => p.status === 'completed' || p.status === 'published').length / pages.length) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-simple">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">처리 중</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pages.filter(p => p.status === 'processing' || p.status === 'draft').length}
              </div>
              <p className="text-xs text-muted-foreground">
                생성 중이거나 수정 필요
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
                  src={getThumbnail(page)}
                  alt={getTitle(page)}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(page.status)}
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{getTitle(page)}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(page.created_at).toLocaleDateString('ko-KR')}</span>
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