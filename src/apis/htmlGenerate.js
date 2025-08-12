import axios from 'axios';
import { VITE_GENERATE_URL } from '../env/env';

const API_URL = "/api/generation/display-list";

export const generateHTML = async (productData, productImageUrl) => {
  try {
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
