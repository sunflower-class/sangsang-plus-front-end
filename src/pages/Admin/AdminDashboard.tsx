import React, { useState, useEffect, useCallback } from 'react';
import { 
  getPendingQnas, 
  reviewAndRegisterQna, 
  getRagQnaList, 
  updateRagQna, 
  deleteRagQna,
  searchRagQna 
} from '@/apis/questionService';
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
import { Loader2, Search, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/data-display/badge';

interface PendingQnA {
  id: string;
  question: string;
  content: string;
  metadata: Record<string, unknown>;
}

interface RAGQnAItem {
  id: string;
  question: string;
  answer: string;
  metadata: Record<string, unknown>;
  created_at: string;
  last_modified?: string;
}

const AdminDashboard = () => {
  const [pendingQnas, setPendingQnas] = useState<PendingQnA[]>([]);
  const [ragQnas, setRagQnas] = useState<RAGQnAItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRagLoading, setIsRagLoading] = useState(true);
  const [selectedQnA, setSelectedQnA] = useState<PendingQnA | null>(null);
  const [selectedRagQnA, setSelectedRagQnA] = useState<RAGQnAItem | null>(null);
  const [answer, setAnswer] = useState('');
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'rag'>('pending');

  const fetchPendingQnas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getPendingQnas();
      console.log('Pending QnAs Response:', response);
      if (response && response.pending_qnas) {
        setPendingQnas(response.pending_qnas);
        console.log('Loaded pending QnAs:', response.pending_qnas.length);
      }
    } catch (error) {
      toast.error('검수 대기 질문 목록을 불러오는 데 실패했습니다.');
      console.error('Failed to fetch pending QnAs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRagQnas = useCallback(async () => {
    setIsRagLoading(true);
    try {
      const response = await getRagQnaList({ limit: 100 });
      console.log('RAG QnAs Response:', response);
      if (response && response.qna_items) {
        setRagQnas(response.qna_items);
        console.log('Loaded RAG QnAs:', response.qna_items.length);
      }
    } catch (error) {
      toast.error('RAG Q&A 목록을 불러오는 데 실패했습니다.');
      console.error('Failed to fetch RAG QnAs:', error);
    } finally {
      setIsRagLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingQnas();
    fetchRagQnas();
  }, [fetchPendingQnas, fetchRagQnas]);

  const handleReviewAndRegister = async (action: 'register' | 'duplicate' | 'discard') => {
    if (!selectedQnA) return;

    try {
      const payload: Record<string, unknown> = {
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
        payload.tags = ['관리자승인'];
      }

      await reviewAndRegisterQna(payload);
      toast.success(`질문이 성공적으로 ${action === 'register' ? '등록' : action === 'duplicate' ? '중복 처리' : '폐기'}되었습니다.`);
      setIsReviewDialogOpen(false);
      setAnswer('');
      setSelectedQnA(null);
      fetchPendingQnas();
      if (action === 'register') {
        fetchRagQnas(); // RAG 목록도 새로고침
      }
    } catch (error) {
      toast.error(`질문 ${action === 'register' ? '등록' : action === 'duplicate' ? '중복 처리' : '폐기'}에 실패했습니다.`);
      console.error(`Failed to ${action} QnA:`, error);
    }
  };

  const handleUpdateRagQna = async () => {
    if (!selectedRagQnA) return;

    try {
      await updateRagQna(selectedRagQnA.id, {
        question: editQuestion,
        answer: editAnswer,
        admin_user_id: 'admin_user_id',
        update_reason: '관리자에 의한 수정'
      });
      toast.success('Q&A가 성공적으로 수정되었습니다.');
      setIsEditDialogOpen(false);
      setSelectedRagQnA(null);
      fetchRagQnas();
    } catch (error) {
      toast.error('Q&A 수정에 실패했습니다.');
      console.error('Failed to update RAG QnA:', error);
    }
  };

  const handleDeleteRagQna = async (qnaId: string) => {
    if (!confirm('정말로 이 Q&A를 삭제하시겠습니까?')) return;

    try {
      await deleteRagQna(qnaId, {
        admin_user_id: 'admin_user_id',
        delete_reason: '관리자에 의한 삭제'
      });
      toast.success('Q&A가 성공적으로 삭제되었습니다.');
      fetchRagQnas();
    } catch (error) {
      toast.error('Q&A 삭제에 실패했습니다.');
      console.error('Failed to delete RAG QnA:', error);
    }
  };

  const handleSearchRagQna = async () => {
    if (!searchTerm.trim()) {
      fetchRagQnas();
      return;
    }

    setIsRagLoading(true);
    try {
      const response = await searchRagQna({
        query: searchTerm,
        limit: 100
      });
      if (response && response.qna_items) {
        setRagQnas(response.qna_items);
      }
    } catch (error) {
      toast.error('Q&A 검색에 실패했습니다.');
      console.error('Failed to search RAG QnAs:', error);
    } finally {
      setIsRagLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pending')}
        >
          검수 대기 질문 ({pendingQnas.length})
        </Button>
        <Button
          variant={activeTab === 'rag' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rag')}
        >
          RAG Q&A 관리 ({ragQnas.length})
        </Button>
      </div>

      {/* 검수 대기 질문 목록 */}
      {activeTab === 'pending' && (
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">검수 대기 질문 목록</h2>
            <p className="text-muted-foreground">사용자들이 제출한 질문을 검토하고 RAG 시스템에 등록하세요.</p>
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
                    <TableHead>내용</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingQnas.map((qna) => (
                    <TableRow key={qna.id}>
                      <TableCell className="font-medium">{qna.id.substring(0, 8)}...</TableCell>
                      <TableCell className="truncate">{qna.question}</TableCell>
                      <TableCell className="max-w-md truncate">{qna.content ?? "없음"}</TableCell>
                      <TableCell>{(qna.metadata?.author as string) || '알 수 없음'}</TableCell>
                      <TableCell>
                        {qna.metadata?.created_at 
                          ? new Date(qna.metadata.created_at as string).toLocaleDateString('ko-KR')
                          : '날짜 없음'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isReviewDialogOpen && selectedQnA?.id === qna.id} onOpenChange={setIsReviewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedQnA(qna);
                                setAnswer('');
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
                                <h3 className="font-semibold">내용:</h3>
                                <p className="p-2 border rounded-md bg-muted-foreground/5">{selectedQnA?.content ?? "없음"}</p>
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
      )}

      {/* RAG Q&A 관리 */}
      {activeTab === 'rag' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">RAG Q&A 관리</h2>
                <p className="text-muted-foreground">등록된 Q&A를 검색, 수정, 삭제할 수 있습니다.</p>
              </div>
              <div className="flex space-x-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Q&A 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button onClick={handleSearchRagQna}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => { setSearchTerm(''); fetchRagQnas(); }}>
                    전체
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isRagLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Q&A 목록을 불러오는 중...</span>
              </div>
            ) : ragQnas.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>등록된 Q&A가 없습니다.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>질문</TableHead>
                    <TableHead>답변 (미리보기)</TableHead>
                    <TableHead>태그</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ragQnas.map((qna) => (
                    <TableRow key={qna.id}>
                      <TableCell className="font-medium">{qna.id.substring(0, 8)}...</TableCell>
                      <TableCell className="max-w-xs truncate">{qna.question}</TableCell>
                      <TableCell className="max-w-xs truncate">{qna.answer}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(qna.metadata?.tags) 
                            ? qna.metadata.tags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            : null
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {qna.created_at 
                          ? new Date(qna.created_at).toLocaleDateString('ko-KR')
                          : '날짜 없음'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-1">
                          <Dialog open={isEditDialogOpen && selectedRagQnA?.id === qna.id} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRagQnA(qna);
                                  setEditQuestion(qna.question);
                                  setEditAnswer(qna.answer);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Q&A 수정</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold">질문:</h3>
                                  <Textarea
                                    value={editQuestion}
                                    onChange={(e) => setEditQuestion(e.target.value)}
                                    className="min-h-[80px]"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-semibold">답변:</h3>
                                  <Textarea
                                    value={editAnswer}
                                    onChange={(e) => setEditAnswer(e.target.value)}
                                    className="min-h-[120px]"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>취소</Button>
                                  <Button onClick={handleUpdateRagQna}>수정</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRagQna(qna.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
