import axios from 'axios';
import { VITE_GENERATE_URL } from '../env/env';

const API_URL = `${VITE_GENERATE_URL}/display-list`;

export const generateHTML = async (productData, productImageUrl) => {
  try {
    // JWT 토큰은 axios 인터셉터에서 자동으로 추가됨
    // Spring Gateway에서 JWT를 파싱해서 X-User-Id를 다운스트림으로 전달
    const response = await axios.post(API_URL, {
      product_data: productData,
      product_image_url: productImageUrl,
    });
    
    console.log('생성된 HTML:', response.data.data.html_list);
    return response.data.data.html_list;
  } catch (error) {
    console.error('Error generating HTML:', error);
    throw error;
  }
};
