import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Separator } from '@/components/ui/layout/separator';
import { Sparkles, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useSignup } from '@/hooks/useSignup';

const Signup = () => {
  const { 
    isLoading, 
    formData, 
    agreements, 
    errors,
    handleSubmit, 
    handleChange, 
    handleAgreementChange, 
    handleAllAgreementChange 
  } = useSignup();

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4"> 
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
            <CardDescription>
              AI 기반 이커머스 상세페이지 생성 서비스를 시작하세요
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.form && <p className="text-sm text-red-500 text-center">{errors.form}</p>}
            
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" name="name" type="text" placeholder="이름을 입력하세요" value={formData.name} onChange={handleChange} className={`pl-10 ${errors.name ? 'border-red-500' : ''}`} />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} className={`pl-10 ${errors.email ? 'border-red-500' : ''}`} />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" name="password" type="password" placeholder="비밀번호를 입력하세요" value={formData.password} onChange={handleChange} className={`pl-10 ${errors.password ? 'border-red-500' : ''}`} />
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="비밀번호를 다시 입력하세요" value={formData.confirmPassword} onChange={handleChange} className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`} />
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className={`p-4 border rounded-lg space-y-3 ${errors.terms ? 'border-red-500' : ''}`}>
                <h4 className="font-semibold text-sm">[필수] 개인정보 수집 및 이용 동의</h4>
                <div className="text-xs text-muted-foreground h-20 overflow-y-auto p-2 border rounded-md">
                  <strong>수집 목적:</strong> 회원 식별 및 본인 확인, 서비스 제공 및 계약 이행, 부정 이용 방지, 문의사항 응대 및 고지사항 전달<br />
                  <strong>수집 항목:</strong> 이름, 이메일 주소, 비밀번호<br />
                  <strong>보유 및 이용 기간:</strong> 회원 탈퇴 시까지<br />
                  <em className="text-destructive">※ 위 필수 항목에 대한 동의를 거부하실 경우, 회원가입 및 서비스 이용이 불가능합니다.</em>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" name="terms" checked={agreements.terms} onCheckedChange={(checked) => handleAgreementChange({ target: { name: 'terms', checked: !!checked } })} />
                  <Label htmlFor="terms" className="text-sm font-normal">개인정보 수집 및 이용에 동의합니다.</Label>
                </div>
              </div>
              {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}

              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold text-sm">[선택] 마케팅 정보 수신 동의</h4>
                <div className="text-xs text-muted-foreground">
                  서비스의 새로운 기능, 유용한 정보, 이벤트 및 광고성 정보를 이메일로 받아보시겠습니까?
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="marketing" name="marketing" checked={agreements.marketing} onCheckedChange={(checked) => handleAgreementChange({ target: { name: 'marketing', checked: !!checked } })} />
                  <Label htmlFor="marketing" className="text-sm font-normal">마케팅 정보 수신에 동의합니다.</Label>
                </div>
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                <Checkbox id="all-agreements" onCheckedChange={(checked) => handleAllAgreementChange({ target: { checked: !!checked } })} />
                <Label htmlFor="all-agreements" className="font-semibold">전체 약관에 모두 동의합니다.</Label>
              </div>
            </div>
            
            <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              동의하고 회원가입
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                로그인
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;