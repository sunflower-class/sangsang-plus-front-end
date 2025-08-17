import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import abtestService from '@/apis/abtestService';
import { PageVariant } from '@/types/abtest';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';

interface TestItem {
  test_id: string;
  test_name: string;
  status: string;
  product_name: string;
  variants_count: number;
  test_mode: string;
}

type VariantData = PageVariant; // 스펙 기반 공용 타입 사용

const statusLabels: Record<string, string> = {
  draft: '초안',
  active: '진행중',
  paused: '일시정지',
  completed: '완료',
  manual_decision: '수동결정',
  winner_selected: '승자선택',
  cycle_completed: '사이클완료',
  archived: '보관됨'
};

const ABTest = () => {
  const [userId, setUserId] = useState('');
  const [sessionId] = useState(() => uuidv4());
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [variant, setVariant] = useState<VariantData | null>(null);
  const [fetchingVariant, setFetchingVariant] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [creatingSample, setCreatingSample] = useState(false);

  // 사용자 ID 초기화
  useEffect(() => {
    let storedUserId = localStorage.getItem('ab_test_user_id');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('ab_test_user_id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // 테스트 목록 로드
  const loadTests = async () => {
    setLoadingTests(true);
    setError('');
    try {
      const res = await abtestService.getAbTests();
      const list: TestItem[] = res.tests || [];
      setTests(list);
      // 기존 선택 유지 or 첫번째 ACTIVE 자동 선택
      if (!selectedTestId && list.length > 0) {
        const active = list.find(t => t.status === 'active') || list[0];
        setSelectedTestId(active.test_id);
        setSelectedTest(active);
      } else if (selectedTestId) {
        const found = list.find(t => t.test_id === selectedTestId) || null;
        setSelectedTest(found);
      }
  } catch (e: unknown) {
  setError('테스트 목록을 불러오지 못했습니다.');
  console.error(e);
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => {
    loadTests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 테스트 선택 변경 시 상태 및 캐시된 변형 확인
  useEffect(() => {
    if (!selectedTestId) {
      setSelectedTest(null);
      setVariant(null);
      return;
    }
    const t = tests.find(t => t.test_id === selectedTestId) || null;
    setSelectedTest(t);
    // 캐시된 변형 (Sticky) 복원
    const cached = localStorage.getItem(`ab_variant_${selectedTestId}_${userId}`);
    if (cached) {
      try {
        setVariant(JSON.parse(cached));
        setInfo('이전에 할당된 변형을 불러왔습니다.');
      } catch {
        // ignore
      }
    } else {
      setVariant(null);
    }
  }, [selectedTestId, tests, userId]);

  const handleStartTest = async () => {
    if (!selectedTestId) return;
    setError('');
    setInfo('');
    try {
      await abtestService.testAction({ test_id: selectedTestId, action: 'start' });
      setInfo('테스트를 시작했습니다. 변형을 배정받을 수 있습니다.');
      await loadTests();
  } catch (e: unknown) {
  setError('테스트 시작에 실패했습니다.');
  console.error(e);
    }
  };

  const handleAssignVariant = async () => {
    if (!selectedTestId) {
      setError('테스트를 먼저 선택하세요.');
      return;
    }
    if (selectedTest && selectedTest.status !== 'active') {
      setError('테스트가 진행중(Active) 상태가 아닙니다.');
      return;
    }
    setFetchingVariant(true);
    setError('');
    setInfo('');
    try {
      const res = await abtestService.getUserVariant(selectedTestId, userId, sessionId);
      // 백엔드 응답 구조: { status: 'success', variant: {...} }
      const fetched: VariantData = res.variant;
      setVariant(fetched);
      localStorage.setItem(`ab_variant_${selectedTestId}_${userId}`, JSON.stringify(fetched));
      setInfo(`변형(${fetched.variant_id})이 할당되었습니다.`);
    } catch (e: unknown) {
      console.error(e);
      const respStatus = (e as { response?: { status?: number } }).response?.status;
      if (respStatus === 404) {
        setError('활성 테스트 또는 변형을 찾을 수 없습니다. (404)');
      } else {
        setError('변형을 가져오는 중 오류가 발생했습니다.');
      }
    } finally {
      setFetchingVariant(false);
    }
  };

  const handleCreateSample = async () => {
    setCreatingSample(true);
    setError('');
    setInfo('샘플 테스트 생성 중...');
    try {
      const rnd = Math.floor(Math.random()*1000);
      await abtestService.createTest({
        test_name: `데모 테스트 ${rnd}`,
        product_name: '샘플 상품',
        product_image: 'https://via.placeholder.com/400x300.png?text=Sample',
        product_description: '샘플 상품 설명입니다. 자동 생성된 테스트.',
        price: 10000,
        category: 'sample',
        tags: ['demo','auto'],
        duration_days: 14,
        target_metrics: { ctr: 0.6, conversion_rate: 0.4 }
      });
      setInfo('샘플 테스트가 생성되었습니다. 목록을 새로고침합니다.');
      await loadTests();
    } catch (e) {
      console.error(e);
      setError('샘플 테스트 생성 실패');
    } finally {
      setCreatingSample(false);
    }
  };

  const renderVariantContent = () => {
    if (!variant) return null;
    const badgeColor = (id: string) => {
      switch (id) {
        case 'A': return 'bg-blue-500';
        case 'B': return 'bg-green-500';
        case 'C': return 'bg-purple-500';
        case 'D': return 'bg-orange-500';
        default: return 'bg-gray-500';
      }
    };
    return (
      <div className="mt-6 border rounded-lg p-5 shadow-sm bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs text-white px-2 py-1 rounded ${badgeColor(variant.variant_id)}`}>Variant {variant.variant_id}</span>
          <span className="text-sm text-neutral-500">{variant.variant_type}</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{variant.title || '제목 없음'}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4 whitespace-pre-line">{variant.description || '설명이 없습니다.'}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-2 rounded border bg-neutral-50 dark:bg-neutral-800"><strong>레이아웃</strong><div>{variant.layout_type}</div></div>
            <div className="p-2 rounded border bg-neutral-50 dark:bg-neutral-800"><strong>컬러</strong><div>{variant.color_scheme}</div></div>
            <div className="p-2 rounded border bg-neutral-50 dark:bg-neutral-800"><strong>CTA</strong><div>{variant.cta_text}</div></div>
            <div className="p-2 rounded border bg-neutral-50 dark:bg-neutral-800"><strong>CTA 위치</strong><div>{variant.cta_position}</div></div>
            <div className="p-2 rounded border bg-neutral-50 dark:bg-neutral-800"><strong>폰트</strong><div>{variant.font_style}</div></div>
            <div className="p-2 rounded border col-span-2 md:col-span-3 bg-neutral-50 dark:bg-neutral-800"><strong>기능</strong><div className="mt-1 flex flex-wrap gap-1">{(variant.additional_features||[]).map(f => <span key={f} className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[10px]">{f}</span>)}</div></div>
        </div>
        <Button className="mt-5" style={{ backgroundColor: variant.cta_color || undefined }}>{variant.cta_text || '액션'}</Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>A/B 테스트 데모</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">고유 사용자 ID: <strong>{userId}</strong></p>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium" htmlFor="testSelect">테스트 선택</label>
              <select
                id="testSelect"
                className="border rounded px-2 py-1 text-sm"
                value={selectedTestId}
                disabled={loadingTests}
                onChange={e => setSelectedTestId(e.target.value)}
              >
                <option value="">-- 테스트 선택 --</option>
                {tests.map(t => (
                  <option key={t.test_id} value={t.test_id}>{t.test_name} ({statusLabels[t.status] || t.status})</option>
                ))}
              </select>
              <Button size="sm" onClick={loadTests} disabled={loadingTests}>{loadingTests ? '새로고침...' : '목록 새로고침'}</Button>
            </div>
            {selectedTest && (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700">상태: {statusLabels[selectedTest.status] || selectedTest.status}</span>
                <span className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700">변형 수: {selectedTest.variants_count}</span>
                <span className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700">모드: {selectedTest.test_mode}</span>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              {selectedTest && selectedTest.status === 'draft' && (
                <Button onClick={handleStartTest} disabled={!selectedTestId}>테스트 시작</Button>
              )}
              <Button onClick={handleAssignVariant} disabled={!selectedTestId || fetchingVariant}> {fetchingVariant ? '배정 중...' : '변형 배정 받기'} </Button>
              {variant && <Button variant="outline" onClick={() => {localStorage.removeItem(`ab_variant_${selectedTestId}_${userId}`); setVariant(null); setInfo('캐시된 변형을 초기화했습니다. 다시 배정 받으세요.');}}>변형 초기화</Button>}
            </div>
            {error && <p className="text-sm text-red-500 whitespace-pre-line">{error}</p>}
            {info && !error && <p className="text-sm text-green-600 whitespace-pre-line">{info}</p>}
          </div>
          {renderVariantContent()}
          {tests.length === 0 && !loadingTests && (
            <div className="mt-6 text-sm text-neutral-500 space-y-3">
              <p>등록된 테스트가 없습니다. 아래 버튼으로 샘플 테스트를 생성할 수 있습니다.</p>
              <Button size="sm" onClick={handleCreateSample} disabled={creatingSample}>{creatingSample?'생성 중...':'샘플 테스트 생성'}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ABTest;
