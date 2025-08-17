import axios from 'axios';
import { VITE_GENERATE_URL } from '../env/env';

const API_URL = `${VITE_GENERATE_URL}/display-list`;

export const generateHTML = async (productData, productImageUrl, userId = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // X-User-Id 헤더 추가 (필수)
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    
    const response = await axios.post(API_URL, {
      product_data: productData,
      product_image_url: productImageUrl,
    }, { headers });
    
    console.log('생성된 HTML:', response.data.data.html_list);
    return response.data.data.html_list;
  } catch (error) {
    console.error('Error generating HTML:', error);
    throw error;
  }
};
