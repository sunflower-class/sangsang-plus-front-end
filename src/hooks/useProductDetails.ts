import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface ProductDetailsData {
  id: string;
  title: string;
  description: string;
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
  created_at: string;
  updated_at: string;
  status: 'processing' | 'completed' | 'failed';
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

      if (userIdParam || userId) {
        headers['X-User-Id'] = userIdParam || userId!;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      let productData: ProductDetailsData;
      
      if (result.success && result.data) {
        productData = result.data;
      } else if (result.id) {
        productData = result;
      } else {
        throw new Error('Invalid response format');
      }

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