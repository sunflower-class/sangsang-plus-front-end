import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/layout/card';
import { Switch } from '@/components/ui/form/switch';
import { Label } from '@/components/ui/form/label';
import { Badge } from '@/components/ui/data-display/badge';
import { AuthContext } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';

const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'; // 테스트용 클라이언트 키

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlight?: boolean;
}

const pricingPlans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: '개인 및 소규모 팀을 위한 플랜',
    monthlyPrice: 15000,
    yearlyPrice: 150000,
    features: [
      '상세페이지 10개 생성',
      '기본 템플릿 제공',
      '리뷰 분석 100건/월',
      '이메일 지원'
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: '성장하는 비즈니스를 위한 최고의 선택',
    monthlyPrice: 45000,
    yearlyPrice: 450000,
    features: [
      '상세페이지 무제한 생성',
      '모든 템플릿 제공',
      '리뷰 분석 1,000건/월',
      'A/B 테스트 기능',
      '실시간 채팅 지원'
    ],
    highlight: true,
  },
];

const Payments = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handlePayment = async (plan: Plan) => {
    if (!authContext?.user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const amount = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const orderName = `${plan.name} ${billingCycle === 'monthly' ? '월간' : '연간'} 구독`;

    try {
      const tossPayments = await loadTossPayments(clientKey);
      await tossPayments.requestPayment('카드', {
        amount,
        orderId: `order_${new Date().getTime()}`,
        orderName,
        customerName: authContext.user.name || '테스트 사용자',
        successUrl: `${window.location.origin}/payments?success=true`,
        failUrl: `${window.location.origin}/payments?success=false`,
      });
    } catch (error) {
      console.error('결제 요청 실패:', error);
      alert('결제 요청에 실패했습니다.');
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const paymentKey = queryParams.get('paymentKey');
    const orderId = queryParams.get('orderId');
    const amount = queryParams.get('amount');

    if (success === 'true' && paymentKey && authContext?.setPaymentInfo) {
      console.log('결제 성공! Payment Key:', paymentKey);
      authContext.setPaymentInfo({ paymentKey, orderId, amount });
      alert('결제에 성공했습니다! 마이페이지에서 확인해보세요.');
      navigate('/profile'); 
    } else if (success === 'false') {
      console.error('결제 실패');
      alert('결제에 실패했습니다.');
    }
  }, [location, authContext, navigate]);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">요금제 선택</h1>
        <p className="text-lg text-muted-foreground mt-2">당신의 비즈니스에 맞는 플랜을 선택하세요.</p>
      </div>

      <div className="flex justify-center items-center space-x-4 mb-10">
        <Label htmlFor="billing-cycle">월간</Label>
        <Switch 
          id="billing-cycle"
          checked={billingCycle === 'yearly'}
          onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <Label htmlFor="billing-cycle">연간 (2개월 할인)</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col ${plan.highlight ? 'border-primary border-2 shadow-lg' : ''}`}>
            {plan.highlight && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">추천</Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">
                  ₩{billingCycle === 'monthly' ? plan.monthlyPrice.toLocaleString() : plan.yearlyPrice.toLocaleString()}
                </span>
                <span className="text-muted-foreground">/{billingCycle === 'monthly' ? '월' : '년'}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handlePayment(plan)} className="w-full" variant={plan.highlight ? 'default' : 'outline'}>
                플랜 선택
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Payments;
