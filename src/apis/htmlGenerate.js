import axios from 'axios';
import { VITE_GENERATE_URL } from '../env/env';

const API_URL = VITE_GENERATE_URL;

export const generateHTML = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    console.log('생성된 HTML:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating HTML:', error);
    throw error;
  }
};
