import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Textarea } from '@/components/ui/form/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/overlay/dialog';
import { Badge } from '@/components/ui/data-display/badge';
import { Avatar, AvatarFallback } from '@/components/ui/data-display/avatar';
import { 
  Plus, 
  Search, 
  MessageCircle, 
  Calendar, 
  User,
  Edit,
  Trash2,
  Send,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  replies: Reply[];
  status: 'open' | 'answered' | 'closed';
}

interface Reply {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
}

const QnA = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    // 더미 데이터 로드
    const dummyQuestions: Question[] = [
      {
        id: '1',
        title: 'AI 생성 시 이미지 품질을 높이는 방법이 있나요?',
        content: '상세페이지를 생성할 때 이미지 품질이 생각보다 낮게 나오는 것 같습니다. 더 고화질로 생성할 수 있는 옵션이 있을까요?',
        author: '김상품',
        authorId: '2',
        createdAt: '2024-01-15',
        status: 'answered',
        replies: [
          {
            id: '1',
            content: '이미지 생성 시 "고화질", "4K", "상세한" 등의 키워드를 프롬프트에 추가하시면 더 좋은 결과를 얻을 수 있습니다. 또한 참고 이미지를 업로드하시면 품질이 향상됩니다.',
            author: '관리자',
            authorId: 'admin',
            createdAt: '2024-01-15',
          }
        ]
      },
      {
        id: '2',
        title: '생성된 상세페이지를 다른 쇼핑몰에 복사할 수 있나요?',
        content: '네이버 스마트스토어와 쿠팡에서 동시에 판매하고 있는데, 생성된 HTML을 그대로 복사해서 사용해도 되는지 궁금합니다.',
        author: '이마케터',
        authorId: '3',
        createdAt: '2024-01-14',
        status: 'open',
        replies: []
      },
      {
        id: '3',
        title: '월 이용료는 얼마인가요?',
        content: '서비스 가격 정책에 대해 자세히 알고 싶습니다. 페이지 생성 횟수에 제한이 있나요?',
        author: '박사장',
        authorId: '4',
        createdAt: '2024-01-13',
        status: 'answered',
        replies: [
          {
            id: '2',
            content: '현재 베타 서비스 기간으로 무료로 이용하실 수 있습니다. 정식 출시 후 가격 정책은 별도 공지드릴 예정입니다.',
            author: '관리자',
            authorId: 'admin',
            createdAt: '2024-01-13',
          }
        ]
      }
    ];
    setQuestions(dummyQuestions);
  }, []);

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateQuestion = () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      title: newQuestion.title,
      content: newQuestion.content,
      author: user.name,
      authorId: user.id,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'open',
      replies: []
    };

    setQuestions(prev => [question, ...prev]);
    setNewQuestion({ title: '', content: '' });
    setIsCreateDialogOpen(false);
    toast.success('질문이 등록되었습니다.');
  };

  const handleAddReply = (questionId: string) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!newReply.trim()) {
      toast.error('답변 내용을 입력해주세요.');
      return;
    }

    const reply: Reply = {
      id: Date.now().toString(),
      content: newReply,
      author: user.name,
      authorId: user.id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          replies: [...q.replies, reply],
          status: 'answered' as const
        };
      }
      return q;
    }));

    setNewReply('');
    toast.success('답변이 등록되었습니다.');
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    setSelectedQuestion(null);
    toast.success('질문이 삭제되었습니다.');
  };

  const getStatusBadge = (status: Question['status']) => {
    switch (status) {
      case 'answered':
        return <Badge className="bg-success text-success-foreground">답변완료</Badge>;
      case 'open':
        return <Badge variant="outline">답변대기</Badge>;
      case 'closed':
        return <Badge variant="secondary">종료</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Q&A 게시판</h1>
            <p className="text-muted-foreground">궁금한 점을 질문하고 서로 도움을 주고받아요</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {user ? (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>질문하기</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>새 질문 작성</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">제목</label>
                      <Input
                        value={newQuestion.title}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="질문 제목을 입력하세요"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">내용</label>
                      <Textarea
                        value={newQuestion.content}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="질문 내용을 자세히 입력하세요"
                        className="mt-1 min-h-32"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleCreateQuestion} className="btn-primary">
                        질문 등록
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button className="btn-primary" asChild>
                <Link to="/login">로그인하여 질문하기</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="질문 검색..."
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredQuestions.map((question) => (
              <Card 
                key={question.id} 
                className="card-simple hover-lift cursor-pointer"
                onClick={() => setSelectedQuestion(question)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{question.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {question.content}
                      </CardDescription>
                    </div>
                    {getStatusBadge(question.status)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{question.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(question.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{question.replies.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                  <HelpCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">질문이 없습니다</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? '검색 결과가 없습니다' : '첫 번째 질문을 작성해보세요'}
                </p>
                {user && !searchTerm && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="btn-primary"
                  >
                    질문하기
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Question Detail */}
          <div className="lg:col-span-1">
            {selectedQuestion ? (
              <Card className="card-simple sticky top-4">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{selectedQuestion.title}</CardTitle>
                    {getStatusBadge(selectedQuestion.status)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{selectedQuestion.author[0]}</AvatarFallback>
                    </Avatar>
                    <span>{selectedQuestion.author}</span>
                    <span>•</span>
                    <span>{new Date(selectedQuestion.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-foreground whitespace-pre-wrap">{selectedQuestion.content}</p>
                  </div>

                  {user && user.id === selectedQuestion.authorId && (
                    <div className="flex space-x-2 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Edit className="h-3 w-3" />
                        <span>수정</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                        className="flex items-center space-x-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>삭제</span>
                      </Button>
                    </div>
                  )}

                  {/* Replies */}
                  {selectedQuestion.replies.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h4 className="font-semibold">답변 ({selectedQuestion.replies.length})</h4>
                      {selectedQuestion.replies.map((reply) => (
                        <div key={reply.id} className="bg-background-soft p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{reply.author[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{reply.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {user && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="font-semibold">답변 작성</h4>
                      <Textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="답변을 입력하세요"
                        className="min-h-20"
                      />
                      <Button 
                        onClick={() => handleAddReply(selectedQuestion.id)}
                        className="btn-secondary w-full"
                        disabled={!newReply.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        답변 등록
                      </Button>
                    </div>
                  )}

                  {!user && (
                    <div className="text-center py-4 border-t border-border">
                      <p className="text-muted-foreground mb-3">답변을 작성하려면 로그인이 필요합니다</p>
                      <Button variant="outline" asChild>
                        <Link to="/login">로그인하기</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="card-simple">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      질문을 선택하면<br />상세 내용을 볼 수 있습니다
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QnA;