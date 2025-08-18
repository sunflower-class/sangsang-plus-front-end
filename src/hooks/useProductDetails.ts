import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface ProductDetailsData {
  id: string;
  product_id?: number;
  user_id?: string;
  user_session?: string | null;
  original_product_info?: string;
  generated_html?: {
    html_blocks: string[];
    image_count: number;
    generation_completed: boolean;
  };
  used_templates?: any[];
  used_categories?: any[];
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  product_images?: any[];
  // 기존 필드들 (호환성 유지)
  title?: string;
  description?: string;
  images?: string[];
  specifications?: Record<string, any>;
  features?: string[];
  benefits?: string[];
  target_audience?: string;
  price_range?: {
    min: number;
    max: number;
    currency: string;
  };
  availability?: string;
  html_list?: string[]; // 기존 필드명 (호환성 유지)
}

export interface UseProductDetailsOptions {
  autoFetch?: boolean;
  onSuccess?: (data: ProductDetailsData) => void;
  onError?: (error: Error) => void;
}

export const useProductDetails = (
  dataUrl?: string,
  userId?: string,
  options: UseProductDetailsOptions = {}
) => {
  const [data, setData] = useState<ProductDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProductDetails = async (url: string, userIdParam?: string) => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // JWT 토큰 추가 (토큰에 사용자 정보 포함됨)
      const token = localStorage.getItem('jwt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔍 Product Details API 응답:', JSON.stringify(result, null, 2));
      
      let productData: ProductDetailsData;
      
      if (result.success && result.data) {
        console.log('✅ result.success && result.data 경로');
        productData = result.data;
      } else if (result.id) {
        console.log('✅ result.id 경로');
        productData = result;
      } else {
        console.error('❌ Invalid response format. result:', result);
        throw new Error('Invalid response format');
      }

      console.log('📦 최종 productData:', productData);
      console.log('📝 HTML List:', productData.html_list);

      setData(productData);
      options.onSuccess?.(productData);

      if (productData.status === 'completed') {
        toast.success('상품 상세정보 조회 완료', {
          description: `${productData.title} 정보를 성공적으로 불러왔습니다.`
        });
      } else if (productData.status === 'processing') {
        toast.info('상품 상세정보 생성 중', {
          description: '잠시만 기다려주세요. 생성이 완료되면 알림을 보내드립니다.'
        });
      } else if (productData.status === 'failed') {
        toast.error('상품 상세정보 생성 실패', {
          description: '다시 시도해주세요.'
        });
      }

      return productData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      
      toast.error('상품 상세정보 조회 실패', {
        description: error.message
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    if (dataUrl) {
      return fetchProductDetails(dataUrl, userId);
    }
  };

  const fetchByUrl = (url: string, userIdParam?: string) => {
    return fetchProductDetails(url, userIdParam);
  };

  useEffect(() => {
    if (options.autoFetch && dataUrl) {
      fetchProductDetails(dataUrl, userId);
    }
  }, [dataUrl, userId, options.autoFetch]);

  return {
    data,
    loading,
    error,
    refetch,
    fetchByUrl,
  };
};

export default useProductDetails;