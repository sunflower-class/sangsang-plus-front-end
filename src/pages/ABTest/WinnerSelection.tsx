import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import abtestService from '@/apis/abtestService';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';

// 실제 API 응답에 맞는 타입 정의
interface Test {
  id: number;
  name: string;
  status: string;
  created_at: string;
  product_id: string;
  total_impressions: number;
  total_clicks: number;
  total_purchases: number;
  baseline_impressions: number;
  baseline_purchases: number;
  challenger_impressions: number;
  challenger_purchases: number;
  baseline_description: string;
  challenger_description: string;
}

interface WinnerStatus {
  status: string;
  ai_winner_id?: string;
  manual_winner_id?: string;
  winner_selected: boolean;
  can_select_winner: boolean;
  message: string;
}

interface AIAnalysis {
  ai_weights: Record<string, number>;
  variant_analysis: Array<{
    variant_id: string;
    variant_name: string;
    ai_score: number;
    ai_confidence: number;
    cvr: number;
    cart_add_rate: number;
    cart_conversion_rate: number;
    error_rate: number;
    avg_page_load_time: number;
    clicks: number;
    cart_additions: number;
    purchases: number;
    revenue: number;
  }>;
}

const WinnerSelection: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [newChallengerImageUrl, setNewChallengerImageUrl] = useState<string>('');
  const [showNextCycleForm, setShowNextCycleForm] = useState<boolean>(false);

  // 테스트 목록 조회
  const { data: tests, isLoading: testsLoading } = useQuery({
    queryKey: ['abtests', 'list'],
    queryFn: abtestService.getAbTests,
  });

  // URL 파라미터에서 testId 가져오기
  useEffect(() => {
    const testIdFromUrl = searchParams.get('testId');
    console.log('URL에서 받은 testId:', testIdFromUrl);
    if (testIdFromUrl) {
      setSelectedTestId(testIdFromUrl);
    }
  }, [searchParams]);

  // 테스트 목록에서 선택된 테스트 찾기
  const selectedTest = tests?.tests?.find(test => test.id.toString() === selectedTestId);
  
  // 디버깅용 로그
  useEffect(() => {
    console.log('현재 selectedTestId:', selectedTestId);
    console.log('테스트 목록:', tests?.tests);
    console.log('선택된 테스트:', selectedTest);
  }, [selectedTestId, tests]);

  // 승자 상태 조회
  const { data: winnerStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['winner-status', selectedTestId],
    queryFn: () => abtestService.getWinnerStatus(selectedTestId),
    enabled: !!selectedTestId,
  });

  // AI 분석 결과 조회
  const { data: aiAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['ai-analysis', selectedTestId],
    queryFn: () => abtestService.getAIAnalysis(selectedTestId),
    enabled: !!selectedTestId,
  });



  // 수동 승자 선택 뮤테이션
  const selectWinnerMutation = useMutation({
    mutationFn: ({ testId, variantId }: { testId: string; variantId: string }) =>
      abtestService.selectWinner(testId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['winner-status', selectedTestId] });
      queryClient.invalidateQueries({ queryKey: ['abtests', 'list'] });
      setSelectedVariantId('');
      alert('승자가 선택되었습니다!');
    },
    onError: (error) => {
      alert(`승자 선택 실패: ${error.message}`);
    },
  });

  // 테스트 사이클 진행 뮤테이션
  const nextCycleMutation = useMutation({
    mutationFn: (imageUrl: string) => abtestService.nextCycle(selectedTestId, imageUrl),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['winner-status', selectedTestId] });
      queryClient.invalidateQueries({ queryKey: ['abtests', 'list'] });
      alert(`다음 사이클이 생성되었습니다! 새 테스트 ID: ${data.new_test_id}`);
      setShowNextCycleForm(false);
      setNewChallengerImageUrl('');
      // 새로 생성된 테스트로 이동
      navigate(`/abtest/winner?testId=${data.new_test_id}`);
    },
    onError: (error) => {
      alert(`다음 사이클 생성 실패: ${error.message}`);
    },
  });



  const handleSelectWinner = () => {
    if (selectedTestId && selectedVariantId) {
      selectWinnerMutation.mutate({ testId: selectedTestId, variantId: selectedVariantId });
    }
  };



  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      active: { label: '진행중', color: 'bg-green-500' },
      completed: { label: '완료', color: 'bg-blue-500' },
      waiting_for_winner_selection: { label: '승자선택대기', color: 'bg-yellow-500' },
      winner_selected: { label: '승자선택됨', color: 'bg-purple-500' },
      cycle_completed: { label: '사이클완료', color: 'bg-gray-500' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-400' };
    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>승자 선택 및 관리</CardTitle>
            <Button
              onClick={() => navigate('/abtest')}
              variant="outline"
              className="flex items-center gap-2"
            >
              대시보드로 돌아가기
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 테스트 선택 */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">테스트 선택:</label>
              <select
                className="border rounded px-3 py-2 min-w-[300px]"
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                disabled={testsLoading}
              >
                <option value="">테스트를 선택하세요</option>
                {tests?.tests?.map((test: Test) => (
                  <option key={test.id} value={test.id.toString()}>
                    {test.name} - {test.product_id} ({test.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedTestId && (
              <div className="space-y-6">
                {/* 승자 상태 */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3">승자 상태</h3>
                  {statusLoading ? (
                    <p>상태를 불러오는 중...</p>
                  ) : winnerStatus ? (
                    <div className="space-y-2">
                      <p><strong>상태:</strong> {winnerStatus.status}</p>
                      <p><strong>승자 선택됨:</strong> {winnerStatus.winner_selected ? '예' : '아니오'}</p>
                      <p><strong>승자 선택 가능:</strong> {winnerStatus.can_select_winner ? '예' : '아니오'}</p>
                      {winnerStatus.ai_winner_id && (
                        <p><strong>AI 선택 승자:</strong> {winnerStatus.ai_winner_id}</p>
                      )}
                      {winnerStatus.manual_winner_id && (
                        <p><strong>수동 선택 승자:</strong> {winnerStatus.manual_winner_id}</p>
                      )}
                      <p><strong>메시지:</strong> {winnerStatus.message}</p>
                    </div>
                  ) : (
                    <p>승자 상태를 불러올 수 없습니다.</p>
                  )}
                </div>

                {/* AI 분석 결과 */}
                {aiAnalysis && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">AI 분석 결과</h3>
                    <div className="space-y-4">
                      {/* AI 가중치 */}
                      <div>
                        <h4 className="font-medium mb-2">AI 가중치</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(aiAnalysis.ai_weights).map(([key, value]) => (
                            <div key={key} className="bg-blue-50 p-2 rounded">
                              <span className="text-sm font-medium">{key.toUpperCase()}</span>
                              <div className="text-lg font-bold">{(value * 100).toFixed(1)}%</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 변형 분석 */}
                      <div>
                        <h4 className="font-medium mb-2">변형 분석</h4>
                        <div className="grid gap-4">
                          {aiAnalysis.variant_analysis.map((variant) => {
                            // AI 점수가 가장 높은 변형 찾기
                            const maxAiScore = Math.max(...aiAnalysis.variant_analysis.map(v => v.ai_score));
                            const isAiRecommended = variant.ai_score === maxAiScore;
                            
                            return (
                              <div 
                                key={variant.variant_id} 
                                className={`border rounded p-4 ${
                                  isAiRecommended 
                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                    : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-semibold">변형 {variant.variant_id}</h5>
                                    {isAiRecommended && (
                                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                        AI 추천
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <span className={`px-2 py-1 rounded text-sm ${
                                      isAiRecommended ? 'bg-blue-200 text-blue-800' : 'bg-blue-100'
                                    }`}>
                                      AI 점수: {variant.ai_score.toFixed(3)}
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 rounded text-sm">
                                      신뢰도: {((variant.ai_confidence || 0) * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                  <div>CVR: {(variant.cvr * 100).toFixed(2)}%</div>
                                  <div>장바구니율: {(variant.cart_add_rate * 100).toFixed(2)}%</div>
                                  <div>장바구니 CVR: {(variant.cart_conversion_rate * 100).toFixed(2)}%</div>
                                  <div>오류율: {(variant.error_rate * 100).toFixed(2)}%</div>
                                  <div>평균 로드시간: {variant.avg_page_load_time.toFixed(0)}ms</div>
                                  <div>클릭수: {variant.clicks}</div>
                                  <div>구매수: {variant.purchases}</div>
                                  <div>매출: ₩{variant.revenue.toLocaleString()}</div>
                                </div>
                              </div>
                            );
                          })}
                          </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-3 py-2"
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                    >
                      <option value="">변형 선택</option>
                      {aiAnalysis?.variant_analysis.map((variant) => {
                        // AI 점수가 가장 높은 변형 찾기
                        const maxAiScore = Math.max(...aiAnalysis.variant_analysis.map(v => v.ai_score));
                        const isAiRecommended = variant.ai_score === maxAiScore;
                        
                        return (
                          <option key={variant.variant_id} value={variant.variant_id}>
                            변형 {variant.variant_id} (AI점수: {variant.ai_score.toFixed(3)}) {isAiRecommended ? 'AI 추천' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <Button
                      onClick={handleSelectWinner}
                      disabled={selectWinnerMutation.isPending || !selectedVariantId || winnerStatus?.winner_selected}
                      className={`${
                        selectWinnerMutation.isPending || !selectedVariantId || winnerStatus?.winner_selected
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {selectWinnerMutation.isPending ? '선택 중...' : '수동 승자 선택'}
                    </Button>
                  </div>

                  <Button
                    onClick={() => setShowNextCycleForm(true)}
                    disabled={!winnerStatus?.winner_selected}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    다음 사이클
                  </Button>
                </div>

                {/* 다음 사이클 생성 폼 */}
                {showNextCycleForm && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="text-lg font-semibold mb-3">다음 사이클 생성</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          새로운 B안 이미지 URL
                        </label>
                        <input
                          type="url"
                          value={newChallengerImageUrl}
                          onChange={(e) => setNewChallengerImageUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full border rounded px-3 py-2"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          이전 승자가 새로운 A안이 되고, 입력한 이미지가 새로운 B안이 됩니다.
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => nextCycleMutation.mutate(newChallengerImageUrl)}
                          disabled={nextCycleMutation.isPending || !newChallengerImageUrl}
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          {nextCycleMutation.isPending ? '생성 중...' : '다음 사이클 생성'}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowNextCycleForm(false);
                            setNewChallengerImageUrl('');
                          }}
                          variant="outline"
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WinnerSelection;
