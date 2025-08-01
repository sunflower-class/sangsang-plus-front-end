import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/form/button';
import { Input } from '@/components/ui/form/input';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { Send, Bot, User, Loader2, PlusCircle } from 'lucide-react';
import { chatQuery } from '@/apis/questionService';
import { toast } from 'sonner';

interface Message {
  text: string;
  isUser: boolean;
}

interface ChatbotProps {
  onNewQuestion: (question: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onNewQuestion }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewQuestionButton, setShowNewQuestionButton] = useState(false);
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
    setInput('');
    setIsLoading(true);
    setShowNewQuestionButton(false);

    try {
      const response = await chatQuery({ question: input });
      let botMessageText = '죄송합니다. 답변을 찾을 수 없습니다.';

      if (response && response.generated_answer) {
        botMessageText = response.generated_answer;
      }
      
      if (response.needs_post_creation) {
        setShowNewQuestionButton(true);
      }

      const botMessage: Message = { text: botMessageText, isUser: false };
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
    const lastUserMessage = messages.find(m => m.isUser);
    if (lastUserMessage) {
      onNewQuestion(lastUserMessage.text);
    }
  };

  return (
    <div className="fixed bottom-20 right-8 w-96 h-[600px] bg-card border border-border rounded-lg shadow-xl flex flex-col z-50">
      <div className="p-4 border-b border-border flex items-center">
        <Bot className="w-6 h-6 mr-2" />
        <h3 className="font-bold">상상플러스 챗봇</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.isUser ? 'justify-end' : ''}`}>
              {!msg.isUser && <Bot className="w-6 h-6 text-primary" />}
              <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {msg.text}
              </div>
              {msg.isUser && <User className="w-6 h-6 text-muted-foreground" />}
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
                <Button onClick={handleNewQuestionClick} variant="outline" size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    이 질문으로 게시글 등록하기
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
    </div>
  );
};

export default Chatbot;
