import { GoogleGenAI } from "@google/genai";
import { AppSettings } from '../types';

/**
 * Converts a File object to a Base64 string.
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export const removeBackgroundAI = async (base64Image: string, settings: any) => {
  const response = await fetch('/api/remove-bg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // SỬA TẠI ĐÂY: Phải gửi cả ảnh và settings
    body: JSON.stringify({ 
      base64RefImage: base64Image, 
      settings: settings 
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Lỗi không xác định');
  }

  return await response.json();
};



export const generateImageAI = async (
  base64RefImage: string | null,
  base64RefImage2: string | null,
  settings: AppSettings
): Promise<string[]> => {
  
  // Gọi sang Backend thay vì xử lý tại đây
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64RefImage,
      base64RefImage2,
      settings
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Lỗi tạo ảnh từ hệ thống");
  }

  return result.images; // Trả về mảng string[] chứa base64
};

