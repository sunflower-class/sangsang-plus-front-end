import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { Textarea } from '@/components/ui/form/textarea';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { Send, Bot, User, Loader2, PlusCircle, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { chatQuery, summarizeAndSubmitPost, addFeedback } from '@/apis/questionService';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/overlay/dialog';

interface Message {
  text: string;
  isUser: boolean;
  id?: number;
  conversationId?: string;
  documentIds?: string[];
  showFeedback?: boolean;
  feedbackGiven?: 'positive' | 'negative' | null;
}

interface ChatbotProps {
  onClose: () => void;
  userId: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewQuestionButton, setShowNewQuestionButton] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [lastBotResponse, setLastBotResponse] = useState<object | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(input); // 마지막 사용자 메시지 저장
    setInput('');
    setIsLoading(true);
    setShowNewQuestionButton(false);

    try {
      const response = await chatQuery({ question: input });
      let botMessageText = '죄송합니다. 답변을 찾을 수 없습니다.';

      if (response && response.generated_answer) {
        botMessageText = response.generated_answer;
      }
      
      setLastBotResponse(response); // 응답 저장
      
      if (response.needs_post_creation) {
        setShowNewQuestionButton(true);
      }

      const botMessage: Message = { 
        text: botMessageText, 
        isUser: false,
        id: response.conversation_message_id,
        conversationId: response.conversation_id,
        documentIds: response.document_ids,
        showFeedback: true,
        feedbackGiven: null
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chatbot API error:', error);
      const errorMessage: Message = { text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.', isUser: false };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('챗봇 응답을 가져오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuestionClick = () => {
    // AI가 생성한 제목과 내용으로 초기화
    const botResponse = lastBotResponse as { post_draft?: { title?: string; content?: string } };
    if (lastBotResponse && botResponse.post_draft) {
      setDraftTitle(botResponse.post_draft.title || lastUserMessage);
      setDraftContent(botResponse.post_draft.content || '챗봇이 답변하지 못한 질문입니다.');
    } else {
      setDraftTitle(lastUserMessage);
      setDraftContent('챗봇이 답변하지 못한 질문입니다.');
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmission = async () => {
    if (!draftTitle.trim() || !draftContent.trim()) return;

    setIsSubmittingQuestion(true);
    try {
      // 사용자가 편집한 제목과 내용을 하나의 텍스트로 결합
      const combinedText = `제목: ${draftTitle}\n\n내용: ${draftContent}`;
      
      // summarizeAndSubmitPost API 호출
      const response = await summarizeAndSubmitPost({
        text_content: combinedText,
        tags: ['챗봇_추천', 'AI생성']
      });

      if (response && response.status === 'success') {
        toast.success(`질문이 성공적으로 등록되었습니다. ${response.generated_questions?.length || 1}개의 질문이 검수 대기 목록에 추가되었습니다.`);
        setShowNewQuestionButton(false);
        setShowConfirmDialog(false);
        // 초기화
        setDraftTitle('');
        setDraftContent('');
      } else {
        toast.error('질문 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to submit question:', error);
      toast.error('질문 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleFeedback = async (messageIndex: number, feedbackType: 'positive' | 'negative') => {
    const message = messages[messageIndex];
    if (!message.id || !message.conversationId) return;

    const feedback_type = feedbackType === 'positive' ? 'helpful' : 'not_helpful'

    try {
      const response = await addFeedback({
        conversation_id: message.conversationId,
        message_id: message.id,
        feedback_type,
        user_id: userId,
        additional_comment: feedbackType === 'positive' ? '도움이 되었습니다' : '답변이 부정확합니다',
        document_ids: message.documentIds,
      });

      // 메시지 상태 업데이트
      setMessages(prev => prev.map((msg, idx) => 
        idx === messageIndex 
          ? { ...msg, feedbackGiven: feedbackType, showFeedback: false }
          : msg
      ));

      if (response && response.status === 'success') {
        const resultText = feedbackType === 'positive' ? '긍정적인 피드백이 등록되었습니다.' : '부정적인 피드백이 등록되었습니다.'
        toast.success(resultText);
      } else {
        toast.error('피드백 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('피드백 등록에 실패했습니다.');
    }
  };

  return (
    <div className="fixed bottom-20 right-8 w-96 h-[600px] bg-card border border-border rounded-lg shadow-xl flex flex-col z-50">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="w-6 h-6 mr-2" />
          <h3 className="font-bold">상상플러스 챗봇</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col gap-2 ${msg.isUser ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-start gap-3 ${msg.isUser ? 'justify-end' : ''}`}>
                {!msg.isUser && <Bot className="w-6 h-6 text-primary" />}
                <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.text}
                </div>
                {msg.isUser && <User className="w-6 h-6 text-muted-foreground" />}
              </div>
              
              {/* 피드백 버튼 (봇 메시지에만 표시) */}
              {!msg.isUser && msg.showFeedback && !msg.feedbackGiven && (
                <div className="flex gap-2 ml-9">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(index, 'positive')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    도움됨
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeedback(index, 'negative')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    부정확함
                  </Button>
                </div>
              )}

              {/* 피드백 완료 표시 */}
              {!msg.isUser && msg.feedbackGiven && (
                <div className="ml-9 text-xs text-muted-foreground">
                  피드백: {msg.feedbackGiven === 'positive' ? '👍 도움됨' : '👎 부정확함'}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Bot className="w-6 h-6 text-primary" />
              <div className="px-4 py-2 rounded-lg bg-muted flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>답변을 생성 중입니다...</span>
              </div>
            </div>
          )}
          {showNewQuestionButton && (
            <div className="text-center py-2">
                <Button 
                  onClick={handleNewQuestionClick} 
                  variant="outline" 
                  size="sm"
                  disabled={isSubmittingQuestion}
                >
                  {isSubmittingQuestion ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      질문 등록 중...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      이 질문으로 검수 요청하기
                    </>
                  )}
                </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="궁금한 점을 물어보세요..."
            disabled={isLoading}
            className="pr-12"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 질문 등록 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI 생성 질문 등록</DialogTitle>
            <DialogDescription>
              AI가 생성한 제목과 내용을 확인하고 수정한 후 등록하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">원본 질문:</label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{lastUserMessage}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">AI 생성 제목:</label>
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="질문 제목을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">AI 생성 내용:</label>
              <Textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="질문 내용을 입력하세요"
                className="min-h-[120px]"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSubmittingQuestion}
              >
                취소
              </Button>
              <Button 
                onClick={handleConfirmSubmission}
                disabled={isSubmittingQuestion || !draftTitle.trim() || !draftContent.trim()}
              >
                {isSubmittingQuestion ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  '등록하기'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chatbot;
