/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
import { 
  BarChart3, 
  Star, 
  MessageSquare, 
  Download,
  ArrowLeft,
  ThumbsUp,
  AlertTriangle,
  Target,
  TrendingDown,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const ReviewAnalysisResult: React.FC = () => {
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 분석 결과 가져오기
    const reviewData = localStorage.getItem('reviewAnalysisData');
    
    if (!reviewData) {
      navigate('/review-analysis');
      return;
    }

    try {
      // localStorage에서 데이터 파싱
      const storedData = JSON.parse(reviewData);
      console.log('저장된 데이터:', storedData);
      
      // 새로운 데이터 구조 확인 (원본 리뷰가 포함된 경우)
      let rawApiResult;
      
      if (storedData.analysisResult) {
        // 새로운 구조: { analysisResult, originalReviews, productName }
        rawApiResult = storedData.analysisResult;
      } else {
        // 기존 구조: API 응답만 저장된 경우
        rawApiResult = storedData;
      }
      
      console.log('원본 API 응답:', rawApiResult);
      
      // --- 공통 변환 함수 (report 또는 analysis_report 지원) ---
      const normalizeApiResult = (raw: any) => {
        const report = raw.report || raw.analysis_report; // 두 가지 키 모두 지원
        if (!report || !report.summary) return raw; // 이미 정규화 되었거나 구조 다름

        const summary = report.summary;
        const sentimentDist = summary.sentiment_distribution || {};
        const keywords: string[] = summary.common_key_points || [];
        const keywordsWithSentiment = keywords.map((keyword: string) => ({
          keyword,
          sentiment: 'neutral' as const
        }));

        return {
          product_name: report.product_name,
            // summary.total_reviews 는 전체 리뷰 수
          total_reviews: summary.total_reviews,
          average_rating: summary.average_rating,
          overall_sentiment: {
            positive: sentimentDist['긍정'] || sentimentDist['positive'] || 0,
            negative: sentimentDist['부정'] || sentimentDist['negative'] || 0,
            neutral: sentimentDist['중립'] || sentimentDist['neutral'] || 0
          },
          top_keywords: keywordsWithSentiment,
          insights: {
            strengths: report.trends?.positive_aspects || [],
            weaknesses: report.trends?.key_issues || [],
            recommendations: report.recommendations || []
          },
          individual_results: (report.individual_analyses || []).map((analysis: any, index: number) => ({
            review_id: `review_${index}`,
            sentiment: analysis.sentiment === '긍정' ? 'positive' : analysis.sentiment === '부정' ? 'negative' : 'neutral',
            confidence: analysis.sentiment_score ?? 0.5,
            keywords: analysis.key_points || [],
            summary: `분석 결과: ${analysis.sentiment}`,
            rating_prediction: analysis.overall_rating || 0
          }))
        };
      };

      // 변환 적용: report 또는 analysis_report 있으면 정규화
      const apiResult: Record<string, unknown> = (rawApiResult.report || rawApiResult.analysis_report)
        ? normalizeApiResult(rawApiResult)
        : rawApiResult;
      
      console.log('변환된 분석 결과:', apiResult);
      setAnalysisResult(apiResult);
      setIsLoading(false);
    } catch (error) {
      console.error('분석 결과 파싱 오류:', error);
      navigate('/review-analysis');
    }
  }, [navigate]);

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

  const getKeywordColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-50 text-green-700 border-green-200';
      case 'negative': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const handleNewAnalysis = () => {
    localStorage.removeItem('reviewAnalysisData');
    navigate('/review-analysis');
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    
    const report = {
      analysisDate: new Date().toISOString(),
      summary: analysisResult,
      detailedReviews: analysisResult.individual_results
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-800 mb-2">분석 중...</h1>
            <p className="text-muted-롣foreground">
              AI가 리뷰를 분석하고 있습니다. 잠시만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">분석 결과를 찾을 수 없습니다</h1>
            <p className="text-muted-foreground mb-4">
              분석할 데이터가 없습니다. 새로운 분석을 시작해주세요.
            </p>
            <Button onClick={handleNewAnalysis}>
              새 분석 시작하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/review-analysis')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            새 분석
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              분석 결과
            </h1>
            <p className="text-muted-foreground mt-1">
              {analysisResult.total_reviews}개 리뷰에 대한 종합 분석 결과입니다
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleDownloadReport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            리포트 다운로드
          </Button>
        </div>
      </div>

      {/* Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">분석된 리뷰</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisResult.total_reviews}</div>
            <p className="text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              분석 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">평균 예상 평점</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {(analysisResult.average_rating || 0).toFixed(1)}
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${star <= Math.round(analysisResult.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
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
            <div className="text-2xl font-bold text-green-600">
              {analysisResult.overall_sentiment && analysisResult.total_reviews > 0 
                ? Math.round((analysisResult.overall_sentiment.positive / analysisResult.total_reviews) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analysisResult.overall_sentiment?.positive || 0}개 리뷰
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">부정 리뷰</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analysisResult.overall_sentiment && analysisResult.total_reviews > 0 
                ? Math.round((analysisResult.overall_sentiment.negative / analysisResult.total_reviews) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analysisResult.overall_sentiment?.negative || 0}개 리뷰
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              추출된 키워드
            </CardTitle>
            <CardDescription>리뷰에서 자주 언급된 키워드와 감정 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analysisResult.top_keywords || []).map((keyword, index) => (
                <div key={keyword.keyword} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{keyword.keyword}</div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getKeywordColor(keyword.sentiment)}`}
                  >
                    {getSentimentIcon(keyword.sentiment)}
                    <span className="ml-1 capitalize">{keyword.sentiment}</span>
                  </Badge>
                </div>
              ))}
              {(!analysisResult.top_keywords || analysisResult.top_keywords.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  추출된 키워드가 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              감정 분포
            </CardTitle>
            <CardDescription>리뷰의 감정별 분포 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>긍정적</span>
                  <span>{analysisResult.overall_sentiment?.positive || 0}개</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${analysisResult.overall_sentiment && analysisResult.total_reviews > 0 
                        ? (analysisResult.overall_sentiment.positive / analysisResult.total_reviews) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>중립적</span>
                  <span>{analysisResult.overall_sentiment?.neutral || 0}개</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${analysisResult.overall_sentiment && analysisResult.total_reviews > 0 
                        ? (analysisResult.overall_sentiment.neutral / analysisResult.total_reviews) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>부정적</span>
                  <span>{analysisResult.overall_sentiment?.negative || 0}개</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ 
                      width: `${analysisResult.overall_sentiment && analysisResult.total_reviews > 0 
                        ? (analysisResult.overall_sentiment.negative / analysisResult.total_reviews) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            분석 인사이트 및 개선 제안
          </CardTitle>
          <CardDescription>분석 결과를 바탕으로 한 종합적인 인사이트</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-green-700 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                주요 강점
              </h3>
              <ul className="space-y-2">
                {(analysisResult.insights?.strengths || []).map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
                {(!analysisResult.insights?.strengths || analysisResult.insights.strengths.length === 0) && (
                  <li className="text-sm text-muted-foreground">강점이 분석되지 않았습니다.</li>
                )}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                개선 영역
              </h3>
              <ul className="space-y-2">
                {(analysisResult.insights?.weaknesses || []).map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
                {(!analysisResult.insights?.weaknesses || analysisResult.insights.weaknesses.length === 0) && (
                  <li className="text-sm text-muted-foreground">개선 영역이 분석되지 않았습니다.</li>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                <Target className="h-4 w-4" />
                실행 제안
              </h3>
              <ul className="space-y-2">
                {(analysisResult.insights?.recommendations || []).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
                {(!analysisResult.insights?.recommendations || analysisResult.insights.recommendations.length === 0) && (
                  <li className="text-sm text-muted-foreground">실행 제안이 분석되지 않았습니다.</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Details */}
      <Card>
        <CardHeader>
          <CardTitle>분석된 리뷰 상세</CardTitle>
          <CardDescription>각 리뷰의 감정 분석 및 키워드 추출 결과</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(analysisResult.individual_results || []).map((review, index) => (
              <div key={review.review_id || index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">리뷰 {index + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      {analysisResult.product_name || '분석 대상 제품'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSentimentColor(review.sentiment)}`}
                    >
                      {getSentimentIcon(review.sentiment)}
                      <span className="ml-1 capitalize">{review.sentiment}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      신뢰도: {Math.round((review.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
                
                {review.summary && <p className="text-sm">{review.summary}</p>}
                
                {review.rating_prediction && review.rating_prediction > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">예상 평점:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-3 w-3 ${star <= Math.round(review.rating_prediction || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {review.rating_prediction?.toFixed(1)}점
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium">추출된 키워드:</span>
                  {(review.keywords || []).map((keyword, keywordIndex) => (
                    <Badge key={keywordIndex} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {(!review.keywords || review.keywords.length === 0) && (
                    <span className="text-xs text-muted-foreground">키워드가 추출되지 않았습니다.</span>
                  )}
                </div>
              </div>
            ))}
            {(!analysisResult.individual_results || analysisResult.individual_results.length === 0) && (
              <div className="text-center text-muted-foreground py-8">
                개별 리뷰 분석 결과가 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={handleNewAnalysis}>
          새로운 분석 시작
        </Button>
        <Button onClick={handleDownloadReport}>
          <Download className="h-4 w-4 mr-2" />
          상세 리포트 다운로드
        </Button>
      </div>
    </div>
  );
};

export default ReviewAnalysisResult;
