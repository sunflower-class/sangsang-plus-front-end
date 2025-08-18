import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/form/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/layout/tabs';
import { Label } from '@/components/ui/form/label';
import { 
  Save, 
  Eye, 
  Image as ImageIcon, 
  PenSquare,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/form/textarea';
import { useProductDetails } from '@/hooks/useProductDetails';
import { useAuth } from '@/contexts/AuthContext';

const Editor = () => {
  const { pageId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [rawBlockHtml, setRawBlockHtml] = useState('');
  const [blockImages, setBlockImages] = useState<string[]>([]);
  const [base64ImageMap, setBase64ImageMap] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('html');

  // pageId가 있으면 해당 상품의 데이터를 가져오기
  const productDataUrl = pageId ? `${import.meta.env.VITE_API_URL}/api/generation/product-details/${pageId}` : undefined;
  const { data: productData, loading: productLoading, error: productError } = useProductDetails(
    productDataUrl, 
    user?.id, 
    { autoFetch: !!pageId }
  );

  useEffect(() => {
    // state로 전달된 HTML이 있으면 우선 사용 (기존 로직 유지)
    if (location.state?.generatedHtml) {
      setHtmlContent(location.state.generatedHtml);
    }
    // pageId로 가져온 데이터가 있으면 HTML 설정
    else if (productData?.html_list && productData.html_list.length > 0) {
      const processedHtml = productData.html_list.map((htmlBlock: string, index: number) => {
        return `<section id="block-${index}">${htmlBlock}</section>`;
      }).join('\n');
      setHtmlContent(processedHtml);
    }
  }, [pageId, location.state, productData]);

  const processedRawHtml = useMemo(() => {
    const newMap: Record<string, string> = {};
    let imageCounter = 0;
    if (!rawBlockHtml) return '';
    const processed = rawBlockHtml.replace(/src="(data:image\/[^;]+;base64,[^"]+)"/g, (match, p1) => {
      const placeholder = `[image-data-${++imageCounter}]`;
      newMap[placeholder] = p1;
      return `src="${placeholder}"`;
    });
    setBase64ImageMap(newMap);
    return processed;
  }, [rawBlockHtml]);

  const handleSave = () => {
    toast.success('변경사항이 저장되었습니다.');
  };

  const handleApplyChanges = (mode: 'raw') => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const targetBlock = doc.getElementById(selectedBlock || '');
    
    if (targetBlock) {
      if (mode === 'raw') {
        let finalHtml = rawBlockHtml;
        Object.entries(base64ImageMap).forEach(([placeholder, originalSrc]) => {
          finalHtml = finalHtml.replace(`src="${placeholder}"`, `src="${originalSrc}"`);
        });
        const tempDiv = doc.createElement('div');
        tempDiv.innerHTML = finalHtml;
        const newBlock = tempDiv.firstElementChild;
        if (newBlock) {
          targetBlock.replaceWith(newBlock);
          setHtmlContent(doc.body.innerHTML);
        }
      }
      toast.success('블록이 업데이트되었습니다.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newSrc = event.target?.result as string;
        const newHtmlContent = htmlContent.replace(selectedImage, newSrc);
        setHtmlContent(newHtmlContent);
        toast.success('이미지가 변경되었습니다.');
        const newBlockImages = blockImages.map(img => img === selectedImage ? newSrc : img);
        setBlockImages(newBlockImages);
        setSelectedImage(newSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  // 로딩 중이거나 에러가 있는 경우 처리
  if (productLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">상품 데이터 로딩 중...</h2>
          <p className="text-muted-foreground">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (productError && pageId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">데이터를 불러올 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">{productError.message}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
      
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">상세페이지 에디터</h1>
            <p className="text-muted-foreground">
              {pageId ? `상품 ID: ${pageId} - ` : ''}수정하고 싶은 블록을 클릭하세요.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />저장</Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-81px)]">
        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 p-4">
          <div className="h-full bg-white rounded-lg shadow-lg overflow-auto">
            <iframe
              id="preview-iframe"
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              title="Preview"
              onLoad={() => {
                const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                if (!iframe || !iframe.contentDocument) return;
                
                const style = iframe.contentDocument.createElement('style');
                style.innerHTML = `
                  html, body { height: 100%; font-family: sans-serif; }
                  section:hover {
                    outline: 2px dashed #3B82F6;
                    outline-offset: 2px;
                    cursor: pointer;
                  }
                  section.selected-block {
                    outline: 2px solid #10B981;
                    outline-offset: 2px;
                  }
                `;
                iframe.contentDocument.head.appendChild(style);

                const sections = iframe.contentDocument.querySelectorAll('section');
                sections.forEach(section => {
                  section.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = e.currentTarget as HTMLElement;
                    iframe.contentDocument?.querySelector('.selected-block')?.classList.remove('selected-block');
                    target.classList.add('selected-block');
                    
                    if (target.id) {
                      setSelectedBlock(target.id);
                      setRawBlockHtml(target.outerHTML);
                      const images = Array.from(target.querySelectorAll('img')).map(img => img.src);
                      setBlockImages(images);
                      setSelectedImage(null);
                    }
                  });
                });
              }}
            />
          </div>
        </div>

        {/* Edit Panel */}
        <div className="w-96 bg-background border-l border-border">
          {selectedBlock ? (
            <Card className="h-full flex flex-col rounded-none border-0">
              <CardHeader className="p-4 border-b">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <PenSquare className="h-5 w-5" />
                  <span>블록 편집</span>
                </CardTitle>
                <CardDescription className="text-xs">선택된 블록: {selectedBlock}</CardDescription>
              </CardHeader>
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mt-4 ">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="images">이미지</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 p-4 overflow-y-auto">
                    {activeTab === 'html' && (
                      <div className="flex flex-col h-full space-y-4">
                        <div className="flex-1 min-h-0">
                          <div className="flex flex-col h-full">
                            <Label htmlFor="block-html-raw" className="text-sm font-medium mb-2">HTML 코드</Label>
                            <CardDescription className="text-xs mb-2">
                              이미지 데이터는 가독성을 위해 축약됩니다.
                            </CardDescription>
                            <div className="flex-1 min-h-0">
                              <Textarea
                                id="block-html-raw"
                                value={processedRawHtml}
                                onChange={(e) => setRawBlockHtml(e.target.value)}
                                className="h-full font-mono text-xs bg-gray-800 text-gray-200 resize-none border rounded-md"
                                placeholder="선택된 블록의 HTML 코드가 여기에 표시됩니다"
                              />
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => handleApplyChanges('raw')} className="w-full">
                          HTML 변경사항 적용
                        </Button>
                      </div>
                    )}
                    
                    {activeTab === 'images' && (
                      <div className="space-y-3">
                        {blockImages.length > 0 ? (
                          blockImages.map((src, index) => (
                            <div 
                              key={index} 
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                selectedImage === src 
                                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedImage(src)}
                            >
                              <img
                                src={src}
                                alt={`Block image ${index + 1}`}
                                className="w-full h-auto max-h-48 object-contain rounded-md bg-gray-100"
                              />
                              {selectedImage === src && (
                                <div className="mt-3">
                                  <Button onClick={triggerFileSelect} size="sm" className="w-full">
                                    이미지 변경
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                            <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">이미지가 없습니다</p>
                            <p className="text-sm">선택된 블록에 이미지가 없습니다.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Tabs>
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <PenSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">블록을 선택하세요</p>
                <p className="text-sm">미리보기에서 블록을 선택하여 편집을 시작하세요.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
