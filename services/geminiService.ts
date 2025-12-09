import { GoogleGenAI } from "@google/genai";
import { VideoRequest, InputType } from "../types";

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return false;
};

export const openApiKeySelector = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    alert("Không tìm thấy môi trường AI Studio. Vui lòng đảm bảo bạn đang chạy ứng dụng trong đúng môi trường.");
  }
};

export const generateVideo = async (request: VideoRequest): Promise<string> => {
  // Always create a new instance to get the latest key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'veo-3.1-fast-generate-preview'; // Using the fast preview model as generally recommended for batch apps

  let operation;

  try {
    if (request.inputType === InputType.IMAGE && request.image) {
      const imageBase64 = await fileToBase64(request.image);
      const mimeType = request.image.type || 'image/png';

      operation = await ai.models.generateVideos({
        model: model,
        prompt: request.prompt || undefined, // Prompt is optional for image-to-video, but we pass it if it exists
        image: {
          imageBytes: imageBase64,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p', // Current limitation/standard for Veo preview
          aspectRatio: request.aspectRatio,
        }
      });
    } else {
      // Text to Video
      if (!request.prompt) throw new Error("Cần có mô tả để tạo video từ văn bản");

      operation = await ai.models.generateVideos({
        model: model,
        prompt: request.prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: request.aspectRatio,
        }
      });
    }

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        throw new Error(operation.error.message || "Lỗi tạo video không xác định");
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("API không trả về đường dẫn video");
    }

    // Fetch the actual video content using the URI + Key
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Không tải được video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error: any) {
    console.error("Video Generation Error:", error);
    // If it's a "Requested entity was not found" error (common with key issues), we might need to prompt re-selection
    // But for this specific function, we just propagate the error.
    throw new Error(error.message || "Tạo video thất bại");
  }
};