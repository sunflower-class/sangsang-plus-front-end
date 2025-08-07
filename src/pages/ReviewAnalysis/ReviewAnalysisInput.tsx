import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Star,
  Plus,
  X,
  TrendingUp,
  Package
} from 'lucide-react';
import { addBatchManualReviews, uploadFileReviews } from '@/apis/reviewAnalysisService';

interface ReviewInput {
  id: string;
  text: string;
  rating?: number;
}

const ReviewAnalysisInput: React.FC = () => {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [reviews, setReviews] = useState<ReviewInput[]>([
    { id: '1', text: '', rating: 0 }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addReviewInput = () => {
    const newReview: ReviewInput = {
      id: Date.now().toString(),
      text: '',
      rating: 0
    };
    setReviews([...reviews, newReview]);
  };

  const removeReviewInput = (id: string) => {
    if (reviews.length > 1) {
      setReviews(reviews.filter(review => review.id !== id));
    }
  };

  const updateReview = (id: string, field: keyof ReviewInput, value: string | number) => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, [field]: value } : review
    ));
  };

  const handleAnalyze = async () => {
    const validReviews = reviews.filter(review => review.text.trim().length > 10);
    
    if (validReviews.length === 0) {
      alert('분석할 리뷰 내용을 입력해주세요. (최소 10자 이상)');
      return;
    }

    if (!productName.trim()) {
      alert('제품명을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // API 요청 데이터 구성 (별점 정보를 텍스트에 포함)
      const requestData = {
        product_name: productName.trim(),
        reviews: validReviews.map(review => {
          // 별점이 있는 경우 리뷰 텍스트에 포함
          const ratingText = review.rating && review.rating > 0 ? `[별점: ${review.rating}점] ` : '';
          const combinedText = ratingText + review.text;
          
          return {
            review_text: combinedText,
            product_name: productName.trim(),
            rating: review.rating || undefined
          };
        })
      };

      console.log('리뷰 분석 API 호출 시작:', requestData);
      
      // 새로운 API 호출
      const analysisResult = await addBatchManualReviews(requestData);
      
      console.log('리뷰 분석 결과:', analysisResult);
      
      // 분석 결과와 원본 리뷰 데이터를 localStorage에 저장
      const dataToStore = {
        analysisResult,
        originalReviews: validReviews.map(review => review.text), // 원본 리뷰 텍스트 저장
        productName: productName.trim()
      };
      localStorage.setItem('reviewAnalysisData', JSON.stringify(dataToStore));
      
      setAnalysisComplete(true);
      
      // 2초 후 결과 페이지로 이동
      setTimeout(() => {
        navigate('/review-analysis-result');
      }, 2000);
      
    } catch (error) {
      console.error('리뷰 분석 실패:', error);
      alert('리뷰 분석 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
    } else if (file) {
      alert('지원되는 파일 형식이 아닙니다. .xlsx, .xls, .csv 파일만 업로드 가능합니다.');
      event.target.value = ''; // 파일 선택 초기화
    }
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) return;
    await processFileUpload(selectedFile);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const processFileUpload = async (file: File) => {
    if (!productName.trim()) {
      alert('파일 업로드 전에 제품명을 먼저 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('파일 업로드 시작:', file.name);
      
      // 새로운 파일 업로드 API 호출
      const analysisResult = await uploadFileReviews(file, productName.trim());
      
      console.log('파일 업로드 분석 결과:', analysisResult);
      
      // 분석 결과를 localStorage에 저장
      const dataToStore = {
        analysisResult,
        productName: productName.trim(),
        uploadedFileName: file.name
      };
      localStorage.setItem('reviewAnalysisData', JSON.stringify(dataToStore));
      
      setAnalysisComplete(true);
      
      // 2초 후 결과 페이지로 이동
      setTimeout(() => {
        navigate('/review-analysis-result');
      }, 2000);
      
    } catch (error) {
      console.error('파일 업로드 분석 실패:', error);
      alert('파일 분석 중 오류가 발생했습니다. 파일 형식과 내용을 확인하고 다시 시도해주세요.');
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );
    
    if (excelFile) {
      setSelectedFile(excelFile);
    } else {
      alert('지원되는 파일 형식이 아닙니다. .xlsx, .xls, .csv 파일만 업로드 가능합니다.');
    }
  };

  const getValidReviewCount = () => {
    return reviews.filter(review => review.text.trim().length > 10).length;
  };

  if (analysisComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">분석 완료!</h1>
            <p className="text-muted-foreground">
              리뷰 분석이 완료되었습니다. 결과 페이지로 이동합니다...
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            리뷰 분석 도구
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          고객 리뷰를 입력하시면 감정 분석, 키워드 추출, 인사이트 도출 등 종합적인 분석을 제공합니다.
        </p>
        
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <span>감정 분석</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart3 className="h-4 w-4 text-green-500" />
            <span>키워드 추출</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>평점 예측</span>
          </div>
        </div>
      </div>

      {/* Product Name Input */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            분석할 제품 정보
          </CardTitle>
          <CardDescription>
            분석할 제품의 이름을 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium mb-2 block">
              제품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="예: 블루투스 스피커, 스마트폰, 노트북 등"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {productName.trim() && (
              <div className="mt-2">
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  제품명 입력 완료
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>직접 입력</span>
            </CardTitle>
            <CardDescription>
              리뷰 내용을 직접 입력하여 분석해보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={review.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">리뷰 {index + 1}</h3>
                    {reviews.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReviewInput(review.id)}
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">평점 (선택)</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updateReview(review.id, 'rating', star)}
                            className="p-1"
                          >
                            <Star 
                              className={`h-5 w-5 ${
                                star <= (review.rating || 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      리뷰 내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="리뷰 내용을 입력하세요... (최소 10자 이상)"
                      value={review.text}
                      onChange={(e) => updateReview(review.id, 'text', e.target.value)}
                      className="w-full p-3 border rounded-md resize-none text-sm"
                      rows={4}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {review.text.length}/500자
                      {review.text.length >= 10 && (
                        <Badge variant="outline" className="ml-2 text-green-600 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          분석 가능
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addReviewInput}
                className="w-full flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>리뷰 추가</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>파일 업로드</span>
            </CardTitle>
            <CardDescription>
              엑셀 파일 (.xlsx, .xls, .csv) (최대 10MB)로 여러 리뷰를 한번에 업로드하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!selectedFile ? (
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-300 hover:border-primary'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2 mb-4">
                    <h3 className="font-medium">
                      {isDragOver ? '파일을 여기에 놓으세요' : '파일을 선택하거나 드래그하세요'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      엑셀 파일 (.xlsx, .xls, .csv) 형식으로 리뷰를 업로드할 수 있습니다.
                    </p>
                  </div>
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      className="relative overflow-hidden"
                      asChild
                    >
                      <label className="cursor-pointer">
                        <FileText className="h-4 w-4 mr-2" />
                        파일 선택
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-800">{selectedFile.name}</h3>
                        <p className="text-sm text-green-600">
                          파일 크기: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeSelectedFile}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleFileSubmit}
                      disabled={isAnalyzing || !productName.trim()}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          분석 중...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          파일 분석 시작하기
                        </>
                      )}
                    </Button>
                    
                    {!productName.trim() && (
                      <div className="text-center text-sm text-orange-600">
                        파일 분석을 위해 제품명을 먼저 입력해주세요.
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-800 mb-1">파일 형식 안내</h4>
                    <ul className="text-blue-700 space-y-1">
                      <li>지원 형식: .xlsx, .xls, .csv</li>
                      <li>최대 파일 크기: 10MB</li>
                      <li>필수 컬럼: review_text (리뷰 내용)</li>
                      <li>선택 컬럼: product_name (제품명), rating (평점 1-5)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Button */}
      <div className="max-w-2xl mx-auto">
        <Button 
          onClick={handleAnalyze}
          disabled={isAnalyzing || getValidReviewCount() === 0 || !productName.trim()}
          className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              분석 중입니다...
            </>
          ) : (
            <>
              <TrendingUp className="h-5 w-5 mr-2" />
              리뷰 분석 시작하기
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
        
        {getValidReviewCount() === 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                분석을 시작하려면 최소 1개 이상의 리뷰를 입력해주세요. (10자 이상)
              </span>
            </div>
          </div>
        )}
        
        {!productName.trim() && getValidReviewCount() > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                제품명을 입력해주세요.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewAnalysisInput;
