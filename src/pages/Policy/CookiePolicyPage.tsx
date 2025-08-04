import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Cookie, Calendar, Settings, Shield } from 'lucide-react';

const CookiePolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Cookie className="h-8 w-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-foreground">
            쿠키 정책
          </h1>
        </div>
        <p className="text-muted-foreground">
          상상더하기는 더 나은 서비스 제공을 위해 쿠키를 사용합니다.
        </p>
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">시행일: 2025년 8월 4일</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <strong>상상더하기</strong>(이하 "회사")는 귀하에게 더 나은 서비스를 제공하기 위해 쿠키를 사용합니다. 본 쿠키 정책은 회사가 쿠키를 사용하는 방법과 귀하가 쿠키 설정을 관리할 수 있는 방법에 대해 설명합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제1조</Badge>
              쿠키란 무엇인가요?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              쿠키는 귀하가 웹사이트를 방문할 때 귀하의 컴퓨터 또는 모바일 장치에 저장되는 작은 텍스트 파일입니다. 쿠키는 웹사이트가 귀하의 장치를 기억하고 귀하의 기본 설정 및 과거 활동에 대한 정보를 저장하는 데 도움이 됩니다.
            </p>
            <div>
              <h4 className="font-medium mb-2">쿠키의 역할</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 웹사이트 기능 및 성능 향상</li>
                <li>• 사용자 경험 개인화</li>
                <li>• 웹사이트 이용 통계 분석</li>
                <li>• 보안 및 사기 방지</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">제2조</Badge>
              회사가 사용하는 쿠키의 종류
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">필수 쿠키</h4>
                  <p className="text-sm text-green-700">웹사이트의 기본 기능을 제공하기 위해 반드시 필요한 쿠키입니다.</p>
                  <ul className="text-xs text-green-600 mt-2 space-y-1">
                    <li>• 로그인 상태 유지</li>
                    <li>• 보안 설정</li>
                    <li>• 사용자 선택 기억</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">기능 쿠키</h4>
                  <p className="text-sm text-green-700">웹사이트의 향상된 기능을 제공하기 위한 쿠키입니다.</p>
                  <ul className="text-xs text-green-600 mt-2 space-y-1">
                    <li>• 언어 설정</li>
                    <li>• 화면 크기 조정</li>
                    <li>• AI 생성 템플릿 선호도</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">분석 쿠키</h4>
                  <p className="text-sm text-green-700">웹사이트 사용 패턴을 분석하여 서비스를 개선하는 데 사용됩니다.</p>
                  <ul className="text-xs text-green-600 mt-2 space-y-1">
                    <li>• 페이지 조회수</li>
                    <li>• 사용자 행동 분석</li>
                    <li>• 서비스 성능 측정</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">마케팅 쿠키</h4>
                  <p className="text-sm text-green-700">개인화된 광고 및 마케팅 메시지를 제공하는 데 사용됩니다.</p>
                  <ul className="text-xs text-green-600 mt-2 space-y-1">
                    <li>• 맞춤형 광고</li>
                    <li>• 소셜 미디어 연동</li>
                    <li>• 서비스 추천</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">제3조</Badge>
              AI 서비스 관련 쿠키
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <p>
                상상더하기의 AI 기반 상품 상세페이지 생성 서비스를 위해 다음과 같은 특별한 쿠키를 사용합니다:
              </p>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-3">AI 서비스 쿠키:</h4>
                <div className="space-y-2 text-sm text-purple-700">
                  <div className="flex items-start space-x-2">
                    <span className="font-medium">생성 기록 쿠키:</span>
                    <span>사용자의 이전 생성 기록 및 선호도를 저장하여 더 나은 AI 결과를 제공</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium">템플릿 선호도 쿠키:</span>
                    <span>선호하는 디자인 스타일 및 레이아웃을 기억하여 맞춤형 템플릿 추천</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium">성능 최적화 쿠키:</span>
                    <span>AI 처리 속도 및 품질을 향상시키기 위한 기술적 정보 저장</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">제4조</Badge>
              <Settings className="h-4 w-4" />
              쿠키 설정 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <p>
                귀하는 언제든지 쿠키 설정을 관리하고 제어할 수 있습니다:
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-orange-800 mb-2">브라우저 설정을 통한 관리</h5>
                  <p className="text-sm text-orange-700">
                    대부분의 웹 브라우저는 쿠키를 관리하는 설정을 제공합니다. 브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다.
                  </p>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-orange-800 mb-2">웹사이트 쿠키 설정</h5>
                  <p className="text-sm text-orange-700">
                    상상더하기 웹사이트 하단의 "쿠키 설정" 버튼을 통해 세부 쿠키 설정을 조정할 수 있습니다.
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">중요 안내</h4>
                    <p className="text-sm text-yellow-700">
                      필수 쿠키를 비활성화하면 웹사이트의 일부 기능이 제대로 작동하지 않을 수 있습니다. 
                      특히 AI 상세페이지 생성 서비스의 경우 개인화된 결과 제공이 제한될 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">제5조</Badge>
              문의사항
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-3">쿠키 정책 관련 문의</h4>
              <div className="space-y-2 text-sm text-red-700">
                <p><strong>이메일:</strong> cookie@sangsangplus.com</p>
                <p><strong>전화번호:</strong> 02-1234-5678</p>
                <p><strong>담당부서:</strong> 개인정보보호팀</p>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-muted-foreground">
              쿠키 정책에 대한 질문이나 우려사항이 있으시면 언제든지 위 연락처로 문의해 주시기 바랍니다.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="border-t">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-muted/50 px-4 py-2 rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  본 쿠키 정책은 2025년 8월 4일부터 시행됩니다.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
