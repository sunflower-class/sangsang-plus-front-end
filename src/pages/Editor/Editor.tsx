import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/layout/tabs';
import { Textarea } from '@/components/ui/form/textarea';
import { Label } from '@/components/ui/form/label';
import { Input } from '@/components/ui/form/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/overlay/dialog';
import { 
  Save, 
  Eye, 
  Code, 
  Image as ImageIcon, 
  RefreshCw, 
  Upload,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const Editor = () => {
  const { pageId } = useParams();
  const location = useLocation();
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [blockHtml, setBlockHtml] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState('');

  // 더미 HTML 컨텐츠
 

  useEffect(() => {
    if (location.state?.generatedHtml) {
      setHtmlContent(location.state.generatedHtml);
    }
  }, [pageId, location.state]);

  useEffect(() => {
    // 클릭 이벤트 리스너 추가
    const handleBlockClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const block = target.closest('section');
      if (block && block.id) {
        setSelectedBlock(block.id);
        setBlockHtml(block.outerHTML);
      }
    };

    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentDocument) {
      const sections = iframe.contentDocument.querySelectorAll('section');
      sections.forEach(section => {
        section.addEventListener('click', handleBlockClick);
      });
    }

    return () => {
      if (iframe && iframe.contentDocument) {
        const sections = iframe.contentDocument.querySelectorAll('section');
        sections.forEach(section => {
          section.removeEventListener('click', handleBlockClick);
        });
      }
    };
  }, [htmlContent]);

  const handleSave = () => {
    toast.success('변경사항이 저장되었습니다.');
  };

  const handleApplyChanges = () => {
    // 실제 구현에서는 선택된 블록의 HTML을 업데이트
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const targetBlock = doc.getElementById(selectedBlock || '');
    
    if (targetBlock && blockHtml) {
      const newDoc = parser.parseFromString(blockHtml, 'text/html');
      const newBlock = newDoc.querySelector('section');
      if (newBlock) {
        targetBlock.outerHTML = newBlock.outerHTML;
        setHtmlContent(doc.body.innerHTML);
        toast.success('블록이 업데이트되었습니다.');
      }
    }
  };

  const handleRegenerateImage = async () => {
    if (!regeneratePrompt.trim()) {
      toast.error('이미지 재생성 프롬프트를 입력해주세요.');
      return;
    }

    setIsRegenerating(true);
    
    // 이미지 재생성 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsRegenerating(false);
    setRegeneratePrompt('');
    toast.success('이미지가 재생성되었습니다.');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">상세페이지 에디터</h1>
              <p className="text-muted-foreground">블록을 클릭하여 수정하세요</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>미리보기</span>
              </Button>
              <Button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>저장</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Preview Area (70%) */}
        <div className="flex-1 bg-background-soft p-4">
          <div className="h-full bg-white rounded-lg shadow-custom overflow-auto">
            <iframe
              id="preview-iframe"
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <script src="https://cdn.tailwindcss.com"></script>
                  <style>
                    section:hover {
                      ring: 2px solid #3B82F6 !important;
                      ring-opacity: 0.5 !important;
                    }
                  </style>
                </head>
                <body class="p-4">
                  ${htmlContent}
                </body>
                </html>
              `}
              className="w-full h-full border-0"
              title="Preview"
            />
          </div>
        </div>

        {/* Edit Panel (30%) */}
        <div className="w-96 bg-background border-l border-border p-4">
          {selectedBlock ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>블록 편집</span>
                </CardTitle>
                <CardDescription>
                  선택된 블록: {selectedBlock}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-auto">
                <Tabs defaultValue="html" className="h-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="html">HTML 편집</TabsTrigger>
                    <TabsTrigger value="images">이미지 편집</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="html" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="block-html">HTML 코드</Label>
                      <Textarea
                        id="block-html"
                        value={blockHtml}
                        onChange={(e) => setBlockHtml(e.target.value)}
                        className="min-h-64 font-mono text-sm"
                        placeholder="선택된 블록의 HTML 코드가 여기에 표시됩니다"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleApplyChanges}
                      className="w-full btn-secondary"
                    >
                      변경사항 적용
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="images" className="mt-4 space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 border border-border rounded-lg">
                        <img
                          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop"
                          alt="현재 이미지"
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                                <RefreshCw className="h-3 w-3" />
                                <span>재생성</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>이미지 재생성</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="regenerate-prompt">
                                    새로운 스타일이나 키워드를 입력하세요
                                  </Label>
                                  <Textarea
                                    id="regenerate-prompt"
                                    value={regeneratePrompt}
                                    onChange={(e) => setRegeneratePrompt(e.target.value)}
                                    placeholder="예: 더 밝은 배경, 모던한 스타일, 미니멀한 디자인"
                                    className="mt-2"
                                  />
                                </div>
                                <Button 
                                  onClick={handleRegenerateImage}
                                  className="w-full btn-primary"
                                >
                                  {isRegenerating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                  )}
                                  AI로 이미지 생성
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" className="flex items-center space-x-1">
                            <Upload className="h-3 w-3" />
                            <span>업로드</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p>미리보기에서 블록을 선택하여</p>
                <p>편집을 시작하세요.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
