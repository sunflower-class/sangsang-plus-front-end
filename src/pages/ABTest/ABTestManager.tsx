import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import abtestService from '@/apis/abtestService';
import { CreateTestRequest, TestListResponse, VariantAssignmentResponse } from '@/types/abtest';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';

// 간단한 토스트 대체 (필요시 sonner로 교체)
const Toast: React.FC<{ message: string; type?: 'success'|'error' }>=({message,type='success'})=> (
  <div className={`px-3 py-2 rounded text-sm ${type==='success'?'bg-green-500 text-white':'bg-red-500 text-white'}`}>{message}</div>
);

type CreateFormState = CreateTestRequest;

const defaultForm: CreateFormState = {
  test_name: '',
  product_name: '',
  product_image: '',
  product_description: '',
  price: 0,
  category: '',
  tags: [],
  duration_days: 14,
  target_metrics: { ctr: 0.6, conversion_rate: 0.4 }
};

const ABTestManager: React.FC = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState<CreateFormState>(defaultForm);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);
  const [assignResult, setAssignResult] = useState<VariantAssignmentResponse|null>(null);
  const [assignUserId] = useState(()=>{
    let uid = localStorage.getItem('ab_test_user_id');
    if(!uid){ uid = uuidv4(); localStorage.setItem('ab_test_user_id', uid);} 
    return uid;
  });

  const { data: listData, isLoading: listLoading, error: listError } = useQuery<TestListResponse, Error>({
    queryKey: ['abtests','list'],
    queryFn: abtestService.getAbTests,
  });

  const createMutation = useMutation({
    mutationFn: () => abtestService.createTestWithBrief({
      test_name: form.test_name,
      product_name: form.product_name,
      product_image: form.product_image,
      product_description: form.product_description,
      price: form.price,
      category: form.category,
      tags: form.tags,
      duration_days: form.duration_days,
      experiment_brief: {
        objective: '구매 전환율 최대화',
        primary_metrics: ['CVR'],
        secondary_metrics: ['CTR','ATC'],
        guardrails: { LCP: 3.5 },
        target_categories: [form.category],
        target_channels: ['web'],
        target_devices: ['desktop'],
        exclude_conditions: [],
        variant_count: 2,
        distribution_mode: 'equal',
        mde: 0.1,
        min_sample_size: 100,
        decision_mode: 'hybrid',
        manual_decision_period_days: 7,
        long_term_monitoring_days: 30
      },
      test_mode: 'manual'
    }),
    onSuccess: () => {
      setToast({msg:'테스트가 생성되었습니다.', type:'success'});
      setForm(defaultForm);
      qc.invalidateQueries({ queryKey: ['abtests','list'] });
    },
  onError: (e: unknown) => setToast({msg:`생성 실패: ${(e as Error).message||'오류'}`, type:'error'})
  });

  const actionMutation = useMutation({
    mutationFn: (vars: {test_id:string; action:'start'|'pause'|'complete'}) => abtestService.testAction(vars),
    onSuccess: () => {
      setToast({msg:'액션이 성공했습니다.', type:'success'});
      qc.invalidateQueries({ queryKey: ['abtests','list'] });
    },
  onError: (e: unknown) => setToast({msg:`액션 실패: ${(e as Error).message||'오류'}`, type:'error'})
  });

  const assignMutation = useMutation({
    mutationFn: (test_id: string) => abtestService.getUserVariant(test_id, assignUserId),
    onSuccess: (res) => {
      setAssignResult(res);
      setToast({msg:`변형 배정: ${res.variant.variant_id}`, type:'success'});
    },
  onError: (e: unknown) => setToast({msg:`배정 실패: ${(e as Error).message||'오류'}`, type:'error'})
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name==='price'? Number(value): value }));
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>A/B 테스트 생성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input name="test_name" placeholder="테스트명" value={form.test_name} onChange={handleChange} className="border p-2 rounded" />
            <input name="product_name" placeholder="상품명" value={form.product_name} onChange={handleChange} className="border p-2 rounded" />
            <input name="product_image" placeholder="이미지 URL" value={form.product_image} onChange={handleChange} className="border p-2 rounded md:col-span-2" />
            <textarea name="product_description" placeholder="상품 설명" value={form.product_description} onChange={handleChange} className="border p-2 rounded md:col-span-2" rows={3} />
            <input name="price" type="number" placeholder="가격" value={form.price} onChange={handleChange} className="border p-2 rounded" />
            <input name="category" placeholder="카테고리" value={form.category} onChange={handleChange} className="border p-2 rounded" />
          </div>
          <Button disabled={createMutation.isPending} onClick={()=>createMutation.mutate()}> {createMutation.isPending?'생성 중...':'테스트 생성'} </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>테스트 목록</CardTitle></CardHeader>
        <CardContent>
          {listLoading && <p>불러오는 중...</p>}
          {listError && <p className="text-red-500">목록 조회 실패</p>}
          <div className="flex gap-2 mb-4">
            <Button variant="outline" onClick={()=>qc.invalidateQueries({ queryKey:['abtests','list']})}>새로고침</Button>
          </div>
          <div className="space-y-3">
            {listData?.tests?.length===0 && <p>생성된 테스트가 없습니다.</p>}
            {listData?.tests?.map(t => (
              <div key={t.test_id} className="border rounded p-4 flex flex-col gap-2 bg-background">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div>
                    <h3 className="font-semibold">{t.test_name}</h3>
                    <p className="text-xs text-neutral-500">상품: {t.product_name} | 상태: {t.status}</p>
                  </div>
                  <div className="flex gap-2">
                    {t.status==='draft' && <Button size="sm" onClick={()=>actionMutation.mutate({test_id:t.test_id, action:'start'})}>시작</Button>}
                    {t.status==='active' && <Button size="sm" variant="outline" onClick={()=>assignMutation.mutate(t.test_id)}>변형 배정</Button>}
                  </div>
                </div>
                {assignResult && assignResult.variant && assignResult.status==='success' && assignResult.variant && assignResult.variant.variant_id && (
                  <div className="text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                    현재 배정된 변형: <strong>{assignResult.variant.variant_id}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {toast && (
        <div className="fixed bottom-4 right-4"><Toast message={toast.msg} type={toast.type} /></div>
      )}
    </div>
  );
};

export default ABTestManager;
