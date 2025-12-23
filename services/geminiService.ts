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

export const removeBackgroundAI = async (base64Image: string): Promise<string> => {
  try {
    // Thay vì tự xử lý bằng API Key tại đây, ta gọi lên Backend
    const response = await fetch('/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({base64Image}),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Lỗi xử lý xoá nền");
    }

    // Trả về chuỗi base64 kết quả
    return result.data;

  } catch (error) {
    console.error("Client Error:", error);
    throw error;
  }
};
