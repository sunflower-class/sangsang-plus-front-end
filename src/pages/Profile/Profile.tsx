import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/layout/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/data-display/avatar';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Shield,
  Bell,
  Monitor,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import userService from '@/apis/userService';

const Profile = () => {
  const { user, refreshUser } = useAuth(); // refreshUser 함수를 가져와서 사용자 정보 업데이트 후 AuthContext를 갱신합니다.
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) {
        toast.error('사용자 ID를 찾을 수 없습니다.');
        return;
      }
      // 이름
      await userService.updateUserName(user.id, profileData.name);
      // AuthContext의 user 정보 갱신
      await refreshUser();
      toast.success('프로필이 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      toast.error('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 유효성 검사: 8자 이상, 숫자, 소문자, 대문자, 특수문자를 각각 하나 이상 포함 (백엔드 스키마와 일치)
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&+=])(?=\S+$).{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error('비밀번호는 8자 이상이어야 하며, 숫자, 소문자, 대문자, 특수문자를 각각 하나 이상 포함해야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      if (!user?.id) {
        toast.error('사용자 ID를 찾을 수 없습니다.');
        return;
      }
      // 비밀번호 변경 API 호출
      await userService.updateUserPassword(user.id, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('비밀번호가 변경되었습니다.');
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      toast.error('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                {user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{user?.name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>프로필</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>보안</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>알림</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>환경설정</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>프로필 정보</CardTitle>
                  <CardDescription>
                    계정의 기본 정보를 수정할 수 있습니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="pl-10"
                            placeholder="이름을 입력하세요"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">이메일</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            className="pl-10"
                            readOnly // 이메일 수정 불가능
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        저장
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>비밀번호 변경</CardTitle>
                  <CardDescription>
                    계정 보안을 위해 정기적으로 비밀번호를 변경하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">현재 비밀번호</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="pl-10"
                          placeholder="현재 비밀번호를 입력하세요"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">새 비밀번호</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="pl-10"
                          placeholder="새 비밀번호를 입력하세요"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pl-10"
                          placeholder="새 비밀번호를 다시 입력하세요"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Shield className="mr-2 h-4 w-4" />
                        비밀번호 변경
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>알림 설정</CardTitle>
                  <CardDescription>
                    받고 싶은 알림을 선택하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">페이지 생성 완료</h4>
                        <p className="text-sm text-muted-foreground">AI 상세페이지 생성이 완료되면 알림을 받습니다</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Q&A 답변</h4>
                        <p className="text-sm text-muted-foreground">내 질문에 답변이 달리면 알림을 받습니다</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">마케팅 정보</h4>
                        <p className="text-sm text-muted-foreground">새로운 기능이나 이벤트 소식을 받습니다</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="btn-primary">
                      <Save className="mr-2 h-4 w-4" />
                      설정 저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>환경설정</CardTitle>
                  <CardDescription>
                    사용자 인터페이스 및 기본 설정을 변경할 수 있습니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">언어</h4>
                        <p className="text-sm text-muted-foreground">인터페이스 언어를 선택하세요</p>
                      </div>
                      <select className="px-3 py-2 border border-input rounded-lg">
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">기본 톤앤매너</h4>
                        <p className="text-sm text-muted-foreground">새 페이지 생성 시 기본으로 선택될 톤앤매너</p>
                      </div>
                      <select className="px-3 py-2 border border-input rounded-lg">
                        <option value="professional">전문적인</option>
                        <option value="friendly">친근한</option>
                        <option value="humorous">유머있는</option>
                        <option value="luxurious">고급스러운</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="btn-primary">
                      <Save className="mr-2 h-4 w-4" />
                      설정 저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;