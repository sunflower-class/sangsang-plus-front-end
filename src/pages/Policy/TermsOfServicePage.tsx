import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
import { FileText, Calendar } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-foreground">
            이용약관
          </h1>
        </div>
        <p className="text-muted-foreground">
          상상더하기 서비스 이용에 관한 약관입니다.
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
              <strong>상상더하기</strong>(이하 "회사")가 제공하는 AI 기반 상품 상세페이지 생성 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제1조</Badge>
              목적
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              본 약관은 상상더하기(이하 "회사")가 제공하는 AI 기반 상품 상세페이지 생성 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제2조</Badge>
              정의
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p><strong>1. "서비스"</strong>: 회사가 제공하는 AI 기반 상품 상세페이지 자동 생성 및 관리 플랫폼</p>
              <p><strong>2. "이용자"</strong>: 본 약관에 따라 회사가 제공하는 서비스를 받는 자</p>
              <p><strong>3. "계정"</strong>: 서비스 이용을 위해 이용자가 설정한 고유한 문자와 숫자의 조합</p>
              <p><strong>4. "콘텐츠"</strong>: 서비스를 통해 생성되는 상품 상세페이지, 이미지, 텍스트 등 모든 정보</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제3조</Badge>
              약관의 효력 및 변경
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p><strong>① 약관의 공시</strong></p>
              <p className="text-sm text-muted-foreground ml-4">
                본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.
              </p>
              
              <p><strong>② 약관의 변경</strong></p>
              <p className="text-sm text-muted-foreground ml-4">
                회사는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 화면에 공지한 후 7일이 경과한 시점부터 효력이 발생합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제4조</Badge>
              서비스의 제공 및 변경
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p><strong>① 제공 서비스</strong></p>
              <div className="text-sm text-muted-foreground ml-4 space-y-1">
                <p>• AI 기반 상품 상세페이지 자동 생성</p>
                <p>• 생성된 페이지의 편집 및 관리</p>
                <p>• 템플릿 및 디자인 도구 제공</p>
                <p>• 콘텐츠 최적화 및 분석 도구</p>
              </div>
              
              <p><strong>② 서비스 변경</strong></p>
              <p className="text-sm text-muted-foreground ml-4">
                회사는 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제5조</Badge>
              서비스 이용계약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p><strong>① 계약의 성립</strong></p>
              <p className="text-sm text-muted-foreground ml-4">
                서비스 이용계약은 이용자가 약관에 동의하고 회사가 이를 승낙함으로써 성립됩니다.
              </p>
              
              <p><strong>② 계정 생성</strong></p>
              <p className="text-sm text-muted-foreground ml-4">
                이용자는 회사가 정한 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제6조</Badge>
              이용자의 의무
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p><strong>① 계정 관리</strong></p>
              <p className="text-sm text-muted-foreground ml-4">
                이용자는 계정 정보를 선량한 관리자의 주의로 관리해야 하며, 제3자에게 이용하게 해서는 안 됩니다.
              </p>
              
              <p><strong>② 금지사항</strong></p>
              <div className="text-sm text-muted-foreground ml-4 space-y-1">
                <p>• 타인의 개인정보 도용</p>
                <p>• 서비스의 안정적 운영을 방해하는 행위</p>
                <p>• 법령이나 본 약관이 금지하는 행위</p>
                <p>• 공공질서 및 미풍양속에 위반되는 내용의 정보 등을 타인에게 유포하는 행위</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제7조</Badge>
              회사의 의무
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p><strong>① 서비스 제공</strong></p>
              <p className="text-sm text-muted-foreground ml-4">
                회사는 법령과 본 약관이 금지하거나 공서양속에 반하지 않는 범위에서 지속적이고 안정적으로 서비스를 제공하기 위하여 설비에 필요한 기술적 노력을 다합니다.
              </p>
              
              <p><strong>② 개인정보 보호</strong></p>
              <p className="text-sm text-muted-foreground ml-4">
                회사는 개인정보보호법 등 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">제8조</Badge>
              손해배상
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              회사와 이용자는 서비스 이용과 관련하여 고의 또는 과실로 상대방에게 손해를 끼친 경우에는 이를 배상할 책임이 있습니다. 다만, 천재지변 등 불가항력으로 인한 경우에는 그러하지 아니합니다.
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
                  본 이용약관은 2025년 8월 4일부터 시행됩니다.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
