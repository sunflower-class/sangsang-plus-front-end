import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Textarea } from "@/components/ui/form/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/overlay/dialog";
import { Badge } from "@/components/ui/data-display/badge";
import { Avatar, AvatarFallback } from "@/components/ui/data-display/avatar";
import {
  Plus,
  Search,
  MessageCircle,
  Calendar,
  User,
  Edit,
  Trash2,
  Send,
  HelpCircle,
  Bot,
} from "lucide-react";
import Chatbot from "@/components/chatbot/Chatbot";
import { toast } from "sonner";
import { getRagQnaList, directAndSubmitPost, getPendingQnas } from "@/apis/questionService";

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  replies: Reply[];
  status: "open" | "answered" | "closed" | "pending";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "" });
  const [newReply, setNewReply] = useState("");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  
  // user가 없으면 localStorage에서 user_id를 가져옴
  const userId = user?.id || localStorage.getItem("user_id");

  const fetchQuestions = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [ragResponse, pendingResponse] = await Promise.all([
          getRagQnaList({ limit: 100 }), // Fetch up to 100 Q&As
          getPendingQnas(), // Fetch pending Q&As
        ]);

        console.log("RAG Response:", ragResponse);
        console.log("Pending QnAs Response:", pendingResponse);

        let combinedQuestions: Question[] = [];

        if (ragResponse && ragResponse.qna_items) {
          const answeredQuestions: Question[] = ragResponse.qna_items.map(
            (item: any) => ({
              id: item.id,
              title: item.question,
              content:
                item.metadata?.original_question || "원본 질문 내용이 없습니다.", // Assuming metadata might contain original context
              author: item.metadata?.author || "관리자",
              authorId: item.metadata?.author_id || "admin",
              createdAt: item.created_at,
              status: "answered",
              replies: [
                {
                  id: `${item.id}-reply`,
                  content: item.answer,
                  author: "상상플러스 AI",
                  authorId: "ai-admin",
                  createdAt: item.last_modified || item.created_at,
                },
              ],
            })
          );
          combinedQuestions = combinedQuestions.concat(answeredQuestions);
        }

        if (pendingResponse && pendingResponse.pending_qnas) {
          const pendingQuestions: Question[] = pendingResponse.pending_qnas.map(
            (item: any) => ({
              id: item.id,
              title: item.question,
              content: item.metadata?.original_content || "내용 없음",
              author: item.metadata?.author || "사용자",
              authorId: item.metadata?.author_id || "user",
              createdAt: item.metadata?.created_at || new Date().toISOString().split("T")[0],
              status: "pending", // 검수 대기 중인 질문은 'pending' 상태로 표시
              replies: [], // No replies for pending questions
            })
          );
          combinedQuestions = combinedQuestions.concat(pendingQuestions);
        }
        
        // Sort questions by creation date, newest first
        combinedQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setQuestions(combinedQuestions);
      } catch (error: any) {
        console.error("Failed to fetch Q&A list:", error);
        
        // 에러 타입에 따라 다른 메시지 표시
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
        } else if (error.response?.status >= 500) {
          setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else if (error.response?.status === 404) {
          setError("Q&A 서비스를 찾을 수 없습니다.");
        } else {
          setError("Q&A 목록을 불러오는 데 실패했습니다.");
        }
        
        // 토스트는 더 간단한 메시지로
        toast.error("Q&A 데이터를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateQuestion = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      if (!userId) {
        toast.error("유저 정보가 없습니다. 다시 로그인 해주세요.");
        return;
      }
      
      // 제목과 내용을 합쳐서 검수 대기 목록에 추가
      await directAndSubmitPost({
        content: newQuestion.content,
        title: newQuestion.title,
        tags: ["사용자질문", "Q&A"]
      });

      setNewQuestion({ title: "", content: "" });
      setIsCreateDialogOpen(false);
      toast.success("질문이 성공적으로 등록되었습니다. 관리자 검수를 기다려주세요.");
      fetchQuestions(); // Re-fetch the questions list
    } catch (error) {
      toast.error("질문 등록에 실패했습니다.");
      console.error("Failed to create question:", error);
    }
  };

  const handleAddReply = (questionId: string) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!newReply.trim()) {
      toast.error("답변 내용을 입력해주세요.");
      return;
    }

    const reply: Reply = {
      id: Date.now().toString(),
      content: newReply,
      author: user.name,
      authorId: user.id,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            replies: [...q.replies, reply],
            status: "answered" as const,
          };
        }
        return q;
      })
    );

    setNewReply("");
    toast.success("답변이 등록되었습니다.");
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setSelectedQuestion(null);
    toast.success("질문이 삭제되었습니다.");
  };

  const getStatusBadge = (status: Question["status"]) => {
    switch (status) {
      case "answered":
        return (
          <Badge className="bg-success text-success-foreground">답변완료</Badge>
        );
      case "open":
        return <Badge variant="outline">답변대기</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">검수대기</Badge>;
      case "closed":
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Q&A 게시판
            </h1>
            <p className="text-muted-foreground">
              궁금한 점을 질문하고 서로 도움을 주고받아요
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {user ? (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
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
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="질문 제목을 입력하세요"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">내용</label>
                      <Textarea
                        value={newQuestion.content}
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        placeholder="질문 내용을 자세히 입력하세요"
                        className="mt-1 min-h-32 resize-none"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleCreateQuestion}
                        className="btn-primary"
                      >
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
            {!error && !isLoading && filteredQuestions.map((question) => (
              <Card
                key={question.id}
                className="card-simple hover-lift cursor-pointer"
                onClick={() => setSelectedQuestion(question)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {question.title}
                      </CardTitle>
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
                        <span>
                          {new Date(question.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
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

            {/* 에러 상태 표시 */}
            {error && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                  <HelpCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-red-600">서버 연결 오류</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {error}
                </p>
                <Button
                  onClick={fetchQuestions}
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "다시 시도 중..." : "다시 시도"}
                </Button>
              </div>
            )}

            {/* 질문이 없는 경우 (에러가 아닌 경우만) */}
            {!error && filteredQuestions.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                  <HelpCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">질문이 없습니다</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm
                    ? "검색 결과가 없습니다"
                    : "첫 번째 질문을 작성해보세요"}
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

            {/* 로딩 상태 표시 */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4 animate-pulse">
                  <HelpCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">로딩 중...</h3>
                <p className="text-muted-foreground">
                  Q&A 목록을 불러오고 있습니다.
                </p>
              </div>
            )}
          </div>

          {/* Question Detail */}
          <div className="lg:col-span-1">
            {selectedQuestion ? (
              <Card className="card-simple sticky top-4">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {selectedQuestion.title}
                    </CardTitle>
                    {getStatusBadge(selectedQuestion.status)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {selectedQuestion.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedQuestion.author}</span>
                    <span>•</span>
                    <span>
                      {new Date(selectedQuestion.createdAt).toLocaleDateString(
                        "ko-KR"
                      )}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <p className="text-foreground whitespace-pre-wrap">
                      {selectedQuestion.content}
                    </p>
                  </div>

                  {/* 검수 대기 상태 안내 */}
                  {selectedQuestion.status === "pending" && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <h4 className="font-semibold text-orange-800">검수 대기 중</h4>
                      </div>
                      <p className="text-sm text-orange-700">
                        관리자가 질문을 검토하고 있습니다. 검토가 완료되면 답변이 제공됩니다.
                      </p>
                    </div>
                  )}

                  {user && user.id === selectedQuestion.authorId && (
                    <div className="flex space-x-2 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>수정</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeleteQuestion(selectedQuestion.id)
                        }
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
                      <h4 className="font-semibold">
                        답변 ({selectedQuestion.replies.length})
                      </h4>
                      {selectedQuestion.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-background-soft p-4 rounded-lg"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{reply.author[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {reply.author}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {user && selectedQuestion.status !== "pending" && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="font-semibold">답변 작성</h4>
                      <Textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="답변을 입력하세요"
                        className="min-h-20 resize-none"
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

                  {!user && selectedQuestion.status !== "pending" && (
                    <div className="text-center py-4 border-t border-border">
                      <p className="text-muted-foreground mb-3">
                        답변을 작성하려면 로그인이 필요합니다
                      </p>
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
                      질문을 선택하면
                      <br />
                      상세 내용을 볼 수 있습니다
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chatbot Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 shadow-lg"
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        >
          <Bot className="w-8 h-8" />
        </Button>
      </div>

      {/* Chatbot Window */}
      {isChatbotOpen && (
        <Chatbot onClose={() => setIsChatbotOpen(false)} userId={userId} />
      )}
    </div>
  );
};

export default QnA;
