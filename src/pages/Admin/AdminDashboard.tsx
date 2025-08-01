import React, { useState, useEffect, useCallback } from 'react';
import { getPendingQnas, reviewAndRegisterQna } from '@/apis/questionService';
import { toast } from 'sonner';
import {
  Card, CardHeader, CardContent,
} from '@/components/ui/layout/card';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/data-display/table';
import { Button } from '@/components/ui/form/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/overlay/dialog';
import { Textarea } from '@/components/ui/form/textarea';
import { Input } from '@/components/ui/form/input';
import { Loader2 } from 'lucide-react';

interface PendingQnA {
  id: string;
  question: string;
  metadata: { [key: string]: any };
}

const AdminDashboard = () => {
  const [pendingQnas, setPendingQnas] = useState<PendingQnA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQnA, setSelectedQnA] = useState<PendingQnA | null>(null);
  const [answer, setAnswer] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const fetchPendingQnas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getPendingQnas();
      if (response && response.pending_qnas) {
        setPendingQnas(response.pending_qnas);
      }
    } catch (error) {
      toast.error('검수 대기 질문 목록을 불러오는 데 실패했습니다.');
      console.error('Failed to fetch pending QnAs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingQnas();
  }, [fetchPendingQnas]);

  const handleReviewAndRegister = async (action: 'register' | 'duplicate' | 'discard') => {
    if (!selectedQnA) return;

    try {
      const payload: any = {
        pending_doc_id: selectedQnA.id,
        action: action,
        verified_by: 'admin_user_id', // 실제 관리자 ID로 대체 필요
      };

      if (action === 'register') {
        if (!answer.trim()) {
          toast.error('답변 내용을 입력해주세요.');
          return;
        }
        payload.question = selectedQnA.question;
        payload.answer = answer;
        // payload.tags = ['tag1', 'tag2']; // 필요시 태그 추가
      }

      // TODO: duplicate 액션 시 related_qna_id 추가 로직 필요

      await reviewAndRegisterQna(payload);
      toast.success(`질문이 성공적으로 ${action === 'register' ? '등록' : action === 'duplicate' ? '중복 처리' : '폐기'}되었습니다.`);
      setIsReviewDialogOpen(false);
      setAnswer('');
      setSelectedQnA(null);
      fetchPendingQnas(); // 목록 새로고침
    } catch (error) {
      toast.error(`질문 ${action === 'register' ? '등록' : action === 'duplicate' ? '중복 처리' : '폐기'}에 실패했습니다.`);
      console.error(`Failed to ${action} QnA:`, error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-semibold">검수 대기 질문 목록</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">질문 목록을 불러오는 중...</span>
            </div>
          ) : pendingQnas.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>검수 대기 중인 질문이 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>질문</TableHead>
                  <TableHead>작성자</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingQnas.map((qna) => (
                  <TableRow key={qna.id}>
                    <TableCell className="font-medium">{qna.id.substring(0, 8)}...</TableCell>
                    <TableCell>{qna.question}</TableCell>
                    <TableCell>{qna.metadata?.author || '알 수 없음'}</TableCell>
                    <TableCell>{new Date(qna.metadata?.created_at).toLocaleDateString('ko-KR')}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isReviewDialogOpen && selectedQnA?.id === qna.id} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedQnA(qna);
                              setAnswer(''); // 답변 초기화
                            }}
                          >
                            검수 및 답변
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>질문 검수 및 답변</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">질문:</h3>
                              <p className="p-2 border rounded-md bg-muted-foreground/5">{selectedQnA?.question}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">답변:</h3>
                              <Textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="답변 내용을 입력하세요."
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>취소</Button>
                              <Button variant="destructive" onClick={() => handleReviewAndRegister('discard')}>폐기</Button>
                              {/* <Button variant="secondary" onClick={() => handleReviewAndRegister('duplicate')}>중복</Button> */}
                              <Button onClick={() => handleReviewAndRegister('register')}>등록</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
