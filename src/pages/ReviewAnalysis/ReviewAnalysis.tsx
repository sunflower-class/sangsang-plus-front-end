import React, { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  MessageSquare, 
  Filter,
  Download,
  RefreshCw,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  positivePercentage: number;
  negativePercentage: number;
  topKeywords: string[];
  sentimentTrend: Array<{ date: string; positive: number; negative: number; neutral: number }>;
}

interface ProductReview {
  id: string;
  productName: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  date: string;
  helpfulCount: number;
}

const ReviewAnalysis: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - 실제로는 API에서 가져올 데이터
  const mockStats: ReviewStats = {
    totalReviews: 1247,
    averageRating: 4.2,
    positivePercentage: 68,
    negativePercentage: 15,
    topKeywords: ['품질', '배송', '가격', '디자인', '사용감'],
    sentimentTrend: [
      { date: '2024-01', positive: 65, negative: 20, neutral: 15 },
      { date: '2024-02', positive: 70, negative: 18, neutral: 12 },
      { date: '2024-03', positive: 68, negative: 15, neutral: 17 },
    ]
  };

  const mockReviews: ProductReview[] = [
    {
      id: '1',
      productName: '프리미엄 무선 이어폰',
      rating: 5,
      comment: '음질이 정말 좋고 착용감도 편안합니다. 배송도 빨라서 만족해요!',
      sentiment: 'positive',
      keywords: ['음질', '착용감', '배송'],
      date: '2024-03-15',
      helpfulCount: 23
    },
    {
      id: '2',
      productName: '스마트 워치',
      rating: 2,
      comment: '배터리 지속시간이 너무 짧아요. 하루도 못 가네요.',
      sentiment: 'negative',
      keywords: ['배터리', '지속시간'],
      date: '2024-03-14',
      helpfulCount: 15
    },
    {
      id: '3',
      productName: '블루투스 스피커',
      rating: 4,
      comment: '소리는 좋은데 크기가 생각보다 커요.',
      sentiment: 'neutral',
      keywords: ['소리', '크기'],
      date: '2024-03-13',
      helpfulCount: 8
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-4 w-4" />;
      case 'negative': return <AlertTriangle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleAnalyzeReviews = async () => {
    setIsLoading(true);
    // 실제 분석 API 호출
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            리뷰 분석 대시보드
          </h1>
          <p className="text-muted-foreground mt-2">
            AI 기반 고객 리뷰 분석으로 인사이트를 얻어보세요
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleAnalyzeReviews}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {isLoading ? '분석 중...' : '새로 분석'}
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            리포트 다운로드
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">제품 선택</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="all">전체 제품</option>
                <option value="earphones">무선 이어폰</option>
                <option value="smartwatch">스마트 워치</option>
                <option value="speaker">블루투스 스피커</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">기간 선택</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="7d">최근 7일</option>
                <option value="30d">최근 30일</option>
                <option value="90d">최근 90일</option>
                <option value="1y">최근 1년</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">분석 유형</label>
              <select className="w-full p-2 border rounded-lg">
                <option value="sentiment">감정 분석</option>
                <option value="keyword">키워드 분석</option>
                <option value="rating">평점 분석</option>
                <option value="comprehensive">종합 분석</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 리뷰 수</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              전월 대비 +12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {mockStats.averageRating}
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${star <= mockStats.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              5점 만점 기준
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">긍정 리뷰</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.positivePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              전체 리뷰 중 긍정적 평가
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">부정 리뷰</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockStats.negativePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              개선이 필요한 영역
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>주요 키워드</CardTitle>
            <CardDescription>고객들이 자주 언급하는 키워드들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockStats.topKeywords.map((keyword, index) => (
                <Badge 
                  key={keyword} 
                  variant="outline" 
                  className={`text-sm ${index === 0 ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>최근 리뷰</CardTitle>
            <CardDescription>최신 고객 피드백</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-l-4 border-primary/20 pl-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSentimentColor(review.sentiment)}`}
                      >
                        {getSentimentIcon(review.sentiment)}
                        <span className="ml-1 capitalize">{review.sentiment}</span>
                      </Badge>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{review.productName}</span>
                    <span className="text-xs text-muted-foreground">• 도움됨 {review.helpfulCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI 인사이트
          </CardTitle>
          <CardDescription>AI가 분석한 주요 개선 포인트</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-green-700">강점</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">고객들이 제품 품질에 대해 높게 평가</span>
                </li>
                <li className="flex items-start gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">배송 서비스에 대한 만족도가 높음</span>
                </li>
                <li className="flex items-start gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">디자인과 사용편의성 호평</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-red-700">개선점</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <span className="text-sm">배터리 수명 관련 불만이 증가</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <span className="text-sm">일부 제품의 크기/무게 관련 피드백</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <span className="text-sm">고객 서비스 응답 시간 개선 필요</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewAnalysis;
