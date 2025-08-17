import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Label } from '@/components/ui/form/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/form/radio-group';
import { Badge } from '@/components/ui/data-display/badge';
import { 
  Clock, 
  Bell, 
  Zap,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import { type ProcessingMode } from '@/services/generateService';

interface ProcessingModeSelectorProps {
  value: ProcessingMode;
  onChange: (mode: ProcessingMode) => void;
  className?: string;
}

const ProcessingModeSelector: React.FC<ProcessingModeSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const modes = [
    {
      id: 'wait' as ProcessingMode,
      title: '완료까지 대기',
      description: '생성이 완료될 때까지 페이지에서 대기합니다',
      icon: Clock,
      badge: '추천',
      badgeVariant: 'default' as const,
      features: [
        '실시간 진행상황 확인',
        '완료 즉시 결과 확인',
        '최대 5분 대기'
      ],
      pros: ['즉시 결과 확인', '진행상황 실시간 표시'],
      cons: ['대기 시간 필요', '페이지 이탈 불가'],
      bestFor: '빠른 결과 확인을 원할 때'
    },
    {
      id: 'async' as ProcessingMode,
      title: '백그라운드 처리',
      description: '요청 후 다른 작업을 하다가 알림으로 완료 통지를 받습니다',
      icon: Bell,
      badge: '편리함',
      badgeVariant: 'secondary' as const,
      features: [
        '즉시 다른 작업 가능',
        '알림으로 완료 통지',
        '백그라운드 자동 처리'
      ],
      pros: ['자유로운 페이지 이동', '멀티태스킹 가능'],
      cons: ['완료 시점 예측 어려움', '알림 놓칠 수 있음'],
      bestFor: '다른 작업을 병행하고 싶을 때'
    },
    {
      id: 'auto' as ProcessingMode,
      title: '자동 선택',
      description: '예상 처리 시간에 따라 자동으로 최적의 방식을 선택합니다',
      icon: Zap,
      badge: '똑똑함',
      badgeVariant: 'outline' as const,
      features: [
        '지능형 모드 선택',
        '처리 시간 기반 결정',
        '최적화된 사용자 경험'
      ],
      pros: ['항상 최적의 방식', '고민할 필요 없음'],
      cons: ['예측이 틀릴 수 있음'],
      bestFor: '매번 선택하기 번거로울 때'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-primary" />
          <span>처리 방식 선택</span>
        </CardTitle>
        <CardDescription>
          상세페이지 생성 요청 후 어떻게 처리할지 선택하세요
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          {modes.map((mode) => {
            const IconComponent = mode.icon;
            const isSelected = value === mode.id;
            
            return (
              <div key={mode.id} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={mode.id} id={mode.id} />
                  <Label
                    htmlFor={mode.id}
                    className="flex items-center space-x-3 cursor-pointer flex-1"
                  >
                    <div className={`p-2 rounded-full ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{mode.title}</span>
                        <Badge variant={mode.badgeVariant} className="text-xs">
                          {mode.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {mode.description}
                      </p>
                    </div>
                  </Label>
                </div>
                
                {isSelected && (
                  <div className="ml-9 space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                        주요 기능
                      </h4>
                      <ul className="text-xs space-y-1">
                        {mode.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-muted-foreground">
                            <span className="w-1 h-1 bg-current rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <h5 className="font-medium text-green-600 mb-1 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          장점
                        </h5>
                        <ul className="space-y-1">
                          {mode.pros.map((pro, index) => (
                            <li key={index} className="text-muted-foreground">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-yellow-600 mb-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          단점
                        </h5>
                        <ul className="space-y-1">
                          {mode.cons.map((con, index) => (
                            <li key={index} className="text-muted-foreground">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-primary">
                        💡 {mode.bestFor}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ProcessingModeSelector;