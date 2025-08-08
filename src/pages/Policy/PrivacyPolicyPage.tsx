import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Shield, Calendar } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-foreground">
            개인정보 처리 방침
          </h1>
        </div>
        <p className="text-muted-foreground">
          상상더하기는 개인정보보호법에 따라 이용자의 개인정보를 안전하게 보호합니다.
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
              <strong>상상더하기</strong>(이하 "회사")는 개인정보보호법에 따라 이용자의 개인정보 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제1조</Badge>
              개인정보의 처리 목적
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">1. 홈페이지 회원 가입 및 관리</h4>
                <p className="text-sm text-muted-foreground">회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 등</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. AI 기반 서비스 제공</h4>
                <p className="text-sm text-muted-foreground">상품 상세페이지 생성, 맞춤형 디자인 템플릿 제공, 콘텐츠 최적화, 본인인증, 이용요금 결제·정산 등</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. 서비스 개선 및 분석</h4>
                <p className="text-sm text-muted-foreground">신규 기능 개발, AI 모델 학습 및 개선, 서비스 사용 패턴 분석, 고객 만족도 조사, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계 등</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">제2조</Badge>
              개인정보의 처리 및 보유 기간
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-3">각각의 개인정보 처리 및 보유 기간:</h4>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <h5 className="font-medium text-orange-700 mb-2">홈페이지 회원 가입 및 관리</h5>
                    <p className="text-sm mb-2">홈페이지 탈퇴 시까지. 다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지:</p>
                    <ul className="text-xs space-y-1 ml-4">
                      <li>• 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지</li>
                      <li>• 홈페이지 이용에 따른 채권·채무관계 잔존 시에는 해당 채권·채무관계 정산 시까지</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <h5 className="font-medium text-orange-700 mb-2">AI 서비스 제공</h5>
                    <p className="text-sm mb-2">서비스 제공완료 및 요금결제·정산 완료 시까지. 다만, 전자상거래법에 따른 기록:</p>
                    <ul className="text-xs space-y-1 ml-4">
                      <li>• 표시·광고에 관한 기록: 6개월</li>
                      <li>• 계약 또는 청약철회, 대금결제, 재화 등의 공급기록: 5년</li>
                      <li>• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">제3조</Badge>
              개인정보의 제3자 제공
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">제4조</Badge>
              개인정보 처리의 위탁
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <p>
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-3">위탁업체 및 위탁업무 내용:</h4>
                <div className="bg-white p-3 rounded border border-red-200">
                  <h5 className="font-medium text-red-700 mb-2">클라우드 서비스 제공업체</h5>
                  <p className="text-sm">AI 서비스 운영을 위한 클라우드 인프라 제공, 데이터 보관 및 백업</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                회사는 위탁계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">제5조</Badge>
              정보주체의 권리·의무 및 행사방법
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <p>
                이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
              </p>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h5 className="font-medium text-indigo-800 mb-2">개인정보 열람·처리정지 요구권</h5>
                  <p className="text-xs text-indigo-700">언제든지 개인정보 처리현황 열람 및 처리정지를 요구할 수 있습니다.</p>
                </div>
                
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h5 className="font-medium text-indigo-800 mb-2">개인정보 정정·삭제 요구권</h5>
                  <p className="text-xs text-indigo-700">오류 등이 있을 경우 정정 또는 삭제를 요구할 수 있습니다.</p>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h4 className="font-medium text-indigo-800 mb-2">권리 행사 방법</h4>
                <p className="text-sm text-indigo-700 mb-2">
                  위의 권리 행사는 개인정보 보호법 시행규칙 별지 제8호에 따라 작성·제출하시기 바랍니다.
                </p>
                <p className="text-xs text-indigo-600">
                  ※ 개인정보 보호법 제35조에 따른 개인정보의 열람 청구를 하는 경우 다른 사람의 개인정보 또는 법인의 정당한 이익을 해할 우려가 있는 경우에는 법령에 따라 열람이 제한될 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">제6조</Badge>
              개인정보 보호책임자
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-3">개인정보 보호책임자</h4>
              <div className="space-y-2 text-sm text-yellow-700">
                <p><strong>성명:</strong> 이민욱</p>
                <p><strong>직책:</strong> 개인정보보호책임자</p>
                <p><strong>이메일:</strong> sangsangplus@gmail.com</p>
                <p><strong>전화번호:</strong> 02-1234-5678</p>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-muted-foreground">
              정보주체께서는 상상더하기의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다. 회사는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.
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
                  본 개인정보 처리방침은 2025년 8월 4일부터 시행됩니다.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
