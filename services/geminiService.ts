import { GoogleGenAI } from "@google/genai";
import { JobParams } from "../types";

// Helper to wait
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Handles the video generation process for a single job.
 * This includes submitting the request, polling for completion, and fetching the final blob.
 */
export const generateVideoJob = async (params: JobParams): Promise<Blob> => {
  // 1. Initialize API with the injected key
  // IMPORTANT: We create a new instance per call to ensure we capture the selected key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let operation;

  // 2. Configure request based on input type
  const config = {
    numberOfVideos: 1,
    resolution: '720p', // Standard for previews
    aspectRatio: params.aspectRatio,
  };

  try {
    if (params.inputType === 'image' && params.imageBase64 && params.imageMimeType) {
      // Image-to-Video
      operation = await ai.models.generateVideos({
        model: params.model,
        prompt: params.prompt, // Prompt is optional for I2V but recommended
        image: {
          imageBytes: params.imageBase64,
          mimeType: params.imageMimeType,
        },
        config: config,
      });
    } else {
      // Text-to-Video
      operation = await ai.models.generateVideos({
        model: params.model,
        prompt: params.prompt,
        config: config,
      });
    }

    // 3. Poll for completion
    // Video generation takes time, so we must loop
    while (!operation.done) {
      await wait(10000); // Wait 10 seconds between polls
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    // 4. Check for success in the operation response
    const generatedVideo = operation.response?.generatedVideos?.[0];
    const downloadUri = generatedVideo?.video?.uri;

    if (!downloadUri) {
        throw new Error("Không tìm thấy URI video trong phản hồi.");
    }

    // 5. Fetch the actual video content
    // We must append the API key manually to the download URL
    const videoResponse = await fetch(`${downloadUri}&key=${process.env.API_KEY}`);
    
    if (!videoResponse.ok) {
      throw new Error(`Lỗi tải xuống video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return videoBlob;

  } catch (error: any) {
    console.error("Gemini Video Generation Error:", error);
    // Extract a readable error message
    let message = error.message || "Đã xảy ra lỗi không xác định.";
    if (message.includes("403")) message = "Lỗi quyền truy cập (403). Vui lòng kiểm tra API Key.";
    if (message.includes("429")) message = "Quá giới hạn request (Quota Exceeded).";
    if (message.includes("503")) message = "Dịch vụ đang quá tải (503).";
    
    throw new Error(message);
  }
};