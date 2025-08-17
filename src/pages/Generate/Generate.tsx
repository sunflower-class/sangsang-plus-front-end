import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Badge } from '@/components/ui/data-display/badge';
import { Progress } from '@/components/ui/feedback/progress';
import { 
  Sparkles, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle,
  Brain,
  Code,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { generateHTML } from '../../apis/htmlGenerate.js';
import { generateService, type ProcessingMode, type GenerateRequest } from '@/services/generateService';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { useAuth } from '@/contexts/AuthContext';
import ProcessingModeSelector from '@/components/generate/ProcessingModeSelector';

const Generate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchProductDetails } = useNotifications();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('auto');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    productName: '',
    features: [] as string[],
    targetCustomer: '',
    tone: '',
    images: [] as File[],
  });

  const [newFeature, setNewFeature] = useState('');

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleGenerate = async () => {
    if (!formData.productName || !formData.targetCustomer || !formData.tone) {
      toast.error('필수 정보를 모두 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(2);
    setGenerationStatus('AI가 상품 정보를 분석하고 있습니다...');
    setGenerationProgress(20);

    try {
      // 생성 요청 데이터 준비
      const productImageUrl = formData.images.length > 0 ? URL.createObjectURL(formData.images[0]) : undefined;
      
      const request: GenerateRequest = {
        product_data: formData.productName,
        product_image_url: productImageUrl,
        features: formData.features,
        target_customer: formData.targetCustomer,
        tone: formData.tone,
        user_id: user?.id,
      };

      // 새로운 generateService 사용
      const response = await generateService.generateHTML(request, {
        mode: processingMode,
        onProgress: (progress, status) => {
          setGenerationProgress(progress);
          setGenerationStatus(status);
        },
        onComplete: (htmlList) => {
          handleGenerationComplete(htmlList);
        },
        onError: (error) => {
          handleGenerationError(error);
        },
        maxWaitTime: 300000, // 5분
      });

      // 202 Accepted인 경우 (비동기 처리)
      if (response.data?.task_id) {
        setCurrentTaskId(response.data.task_id);
        
        if (processingMode === 'async') {
          // 비동기 모드: 즉시 대시보드로 이동
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
        // wait 모드나 auto 모드는 onComplete 콜백에서 처리
      }

    } catch (error) {
      handleGenerationError(error as Error);
    }
  };

  const handleGenerationComplete = (htmlList: string[]) => {
    setGenerationStatus('HTML 생성이 완료되었습니다.');
    setGenerationProgress(100);
    
    if (htmlList && htmlList.length > 0) {
      const processedHtml = htmlList.map((htmlBlock, index) => {
        return `<section id="block-${index}">${htmlBlock}</section>`;
      }).join('\n');

      // 완료 단계로 이동 후 에디터로 리다이렉트
      setCurrentStep(3);
      setTimeout(() => {
        navigate('/editor/new-page', { state: { generatedHtml: processedHtml } });
        toast.success('상세페이지가 성공적으로 생성되었습니다!');
      }, 1500);
    } else {
      handleGenerationError(new Error('생성된 HTML이 없거나 형식이 올바르지 않습니다.'));
    }
  };

  const handleGenerationError = (error: Error) => {
    console.error('Error generating HTML:', error);
    toast.error(error.message || 'HTML 생성 중 오류가 발생했습니다.');
    setIsGenerating(false);
    setCurrentStep(1);
    setGenerationProgress(0);
    setGenerationStatus('');
  };

  // 컴포넌트 언마운트 시 폴링 정리
  React.useEffect(() => {
    return () => {
      if (currentTaskId) {
        generateService.stopPolling(currentTaskId);
      }
    };
  }, [currentTaskId]);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted text-muted-foreground'
            }`}>
              {currentStep > step ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="font-medium">{step}</span>
              )}
            </div>
            {step < 3 && (
              <div className={`w-16 h-0.5 ${
                currentStep > step ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStepLabels = () => (
    <div className="flex justify-center mb-12">
      <div className="flex space-x-20 text-sm">
        <span className={currentStep >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}>
          정보 입력
        </span>
        <span className={currentStep >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}>
          AI 생성중
        </span>
        <span className={currentStep >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}>
          결과 확인
        </span>
      </div>
    </div>
  );

  const renderForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>상품 정보 입력</span>
        </CardTitle>
        <CardDescription>
          상품의 기본 정보를 입력하면 AI가 매력적인 상세페이지를 생성합니다
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="productName">상품명 *</Label>
          <Input
            id="productName"
            value={formData.productName}
            onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
            placeholder="예: 프리미엄 무선 블루투스 헤드폰"
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <Label>핵심 특징</Label>
          <div className="flex space-x-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="예: 노이즈 캔슬링"
              onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              className="input-field"
            />
            <Button onClick={handleAddFeature} variant="outline">
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{feature}</span>
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleRemoveFeature(feature)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetCustomer">타겟 고객층 *</Label>
          <Textarea
            id="targetCustomer"
            value={formData.targetCustomer}
            onChange={(e) => setFormData(prev => ({ ...prev, targetCustomer: e.target.value }))}
            placeholder="예: 20-30대 직장인, 음악을 자주 듣는 사람, 품질을 중시하는 소비자"
            className="input-field"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>원하는 톤앤매너 *</Label>
          <Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="톤앤매너를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">전문적인</SelectItem>
              <SelectItem value="friendly">친근한</SelectItem>
              <SelectItem value="humorous">유머있는</SelectItem>
              <SelectItem value="luxurious">고급스러운</SelectItem>
              <SelectItem value="trendy">트렌디한</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>참고 이미지</Label>
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                클릭하여 이미지를 업로드하거나 파일을 드래그하세요
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WEBP (최대 10MB)
              </p>
            </label>
          </div>
          
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {formData.images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <ProcessingModeSelector 
          value={processingMode}
          onChange={setProcessingMode}
          className="mb-6"
        />

        <Button 
          onClick={handleGenerate}
          className="w-full btn-primary h-12 text-lg"
          disabled={!formData.productName || !formData.targetCustomer || !formData.tone}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          AI 상세페이지 생성하기
        </Button>
      </CardContent>
    </Card>
  );

  const renderGenerating = () => {
    const getModeMessage = () => {
      switch (processingMode) {
        case 'wait':
          return {
            title: 'AI가 상세페이지를 생성하고 있습니다',
            subtitle: '완료될 때까지 잠시만 기다려주세요',
            showProgress: true
          };
        case 'async':
          return {
            title: '상세페이지 생성 요청이 접수되었습니다',
            subtitle: '백그라운드에서 처리되며, 완료되면 알림으로 안내해드립니다',
            showProgress: false
          };
        case 'auto':
          return {
            title: 'AI가 상세페이지를 생성하고 있습니다',
            subtitle: currentTaskId ? '백그라운드에서 처리 중입니다' : '잠시만 기다려주세요',
            showProgress: !currentTaskId
          };
        default:
          return {
            title: 'AI가 상세페이지를 생성하고 있습니다',
            subtitle: generationStatus,
            showProgress: true
          };
      }
    };

    const modeMessage = getModeMessage();

    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-6">
            {processingMode === 'async' && currentTaskId ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{modeMessage.title}</h3>
          <p className="text-muted-foreground mb-6">{modeMessage.subtitle}</p>
          
          {modeMessage.showProgress && (
            <>
              <Progress value={generationProgress} className="mb-4" />
              <p className="text-sm text-muted-foreground">{generationProgress}% 완료</p>
            </>
          )}

          {processingMode === 'async' && currentTaskId && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>작업 ID:</strong> {currentTaskId}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                대시보드에서 진행상황을 확인할 수 있습니다
              </p>
            </div>
          )}
        
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              generationProgress >= 40 ? 'bg-accent' : 'bg-muted'
            }`}>
              <Brain className="h-6 w-6" />
            </div>
            <p className="text-xs text-muted-foreground">텍스트 분석</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              generationProgress >= 70 ? 'bg-accent' : 'bg-muted'
            }`}>
              <Code className="h-6 w-6" />
            </div>
            <p className="text-xs text-muted-foreground">HTML 생성</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              generationProgress >= 90 ? 'bg-accent' : 'bg-muted'
            }`}>
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="text-xs text-muted-foreground">이미지 처리</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  };

  const renderComplete = () => (
    <Card className="max-w-lg mx-auto">
      <CardContent className="p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-success rounded-full mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-success-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">생성 완료!</h3>
        <p className="text-muted-foreground mb-6">
          AI가 매력적인 상세페이지를 성공적으로 생성했습니다
        </p>
        
        <div className="animate-pulse">
          <p className="text-sm text-muted-foreground">에디터로 이동 중...</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">AI 상세페이지 생성</h1>
            <p className="text-muted-foreground">상품 정보를 입력하고 AI가 만든 결과를 확인하세요</p>
          </div>

          {renderStepIndicator()}
          {renderStepLabels()}

          {currentStep === 1 && renderForm()}
          {currentStep === 2 && renderGenerating()}
          {currentStep === 3 && renderComplete()}
        </div>
      </div>
    </div>
  );
};

export default Generate;