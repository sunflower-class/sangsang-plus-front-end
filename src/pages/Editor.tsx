import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [blockHtml, setBlockHtml] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState('');

  // 더미 HTML 컨텐츠
  const dummyHtmlContent = `
    <div class="max-w-4xl mx-auto bg-white">
      <!-- Hero Section -->
      <section id="hero" class="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-6 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
        <div class="relative z-10">
          <h1 class="text-4xl font-bold mb-4">프리미엄 무선 블루투스 헤드폰</h1>
          <p class="text-xl mb-6">최고의 음질과 편안함을 동시에 경험하세요</p>
          <div class="flex items-center space-x-4">
            <span class="text-3xl font-bold">₩299,000</span>
            <span class="text-lg line-through opacity-70">₩399,000</span>
            <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm">25% 할인</span>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop" 
             alt="헤드폰" class="absolute right-8 top-8 w-64 h-64 object-cover rounded-lg shadow-lg" />
      </section>

      <!-- Features Section -->
      <section id="features" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all p-4 rounded-lg">
        <div class="text-center p-6 bg-gray-50 rounded-lg">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2">프리미엄 음질</h3>
          <p class="text-gray-600">하이파이 드라이버로 선명하고 깊은 사운드를 경험하세요</p>
        </div>
        
        <div class="text-center p-6 bg-gray-50 rounded-lg">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2">편안한 착용감</h3>
          <p class="text-gray-600">장시간 착용해도 편안한 메모리폼 이어패드</p>
        </div>
        
        <div class="text-center p-6 bg-gray-50 rounded-lg">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2">노이즈 캔슬링</h3>
          <p class="text-gray-600">주변 소음을 차단하여 몰입감 있는 청취 경험</p>
        </div>
      </section>

      <!-- Specifications -->
      <section id="specs" class="bg-gray-50 p-8 rounded-lg mb-8 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
        <h2 class="text-2xl font-bold mb-6 text-center">제품 사양</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold mb-3 text-gray-800">기술 사양</h3>
            <ul class="space-y-2 text-gray-600">
              <li>• 드라이버: 40mm 다이나믹</li>
              <li>• 주파수 응답: 20Hz - 20kHz</li>
              <li>• 임피던스: 32Ω</li>
              <li>• 배터리: 최대 30시간 재생</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-3 text-gray-800">연결성</h3>
            <ul class="space-y-2 text-gray-600">
              <li>• 블루투스 5.2</li>
              <li>• 3.5mm 오디오 잭</li>
              <li>• USB-C 충전</li>
              <li>• 범위: 최대 10m</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section id="cta" class="text-center p-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all">
        <h2 class="text-3xl font-bold mb-4">지금 주문하고 특별 혜택을 받으세요!</h2>
        <p class="text-lg mb-6">무료배송 + 1년 품질보증 + 30일 무료 체험</p>
        <button class="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
          지금 구매하기
        </button>
      </section>
    </div>
  `;

  useEffect(() => {
    setHtmlContent(dummyHtmlContent);
  }, [pageId]);

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
                                  disabled={isRegenerating}
                                >
                                  {isRegenerating ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      생성 중...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="mr-2 h-4 w-4" />
                                      이미지 생성
                                    </>
                                  )}
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
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Code className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">블록을 선택하세요</h3>
                    <p className="text-muted-foreground text-sm">
                      좌측 미리보기에서 수정할 블록을 클릭하면<br />
                      여기에서 편집할 수 있습니다
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;