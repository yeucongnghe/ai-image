import { GoogleGenAI } from "@google/genai";
import { AppSettings } from '../types';

// Initialize the API client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

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

/**
 * Removes background using Gemini (Edit capability).
 * Since explicit segmentation isn't an endpoint, we ask the model to isolate the subject.
 */
export const removeBackgroundAI = async (base64Image: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key chưa được cấu hình.");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Good for editing
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assume PNG/JPEG
              data: base64Image
            }
          },
          {
            text: "Remove the background of this image. Replace the background with a solid white color. Keep the person or main subject exactly as they are, do not change their face or clothes."
          }
        ]
      }
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("Không thể xử lý xoá phông. Vui lòng thử lại.");
  } catch (error) {
    console.error("BG Removal Error:", error);
    throw error;
  }
};

/**
 * Generates images based on prompts and reference.
 * Returns an array of base64 image strings.
 */
export const generateImageAI = async (
  base64RefImage: string | null,
  settings: AppSettings
): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key chưa được cấu hình.");

  // Construct the descriptive prompt
  const accuracyLevel = settings.accuracy;
  let accuracyInstruction = "";
  if (accuracyLevel >= 80) {
    accuracyInstruction = "CRITICAL: Preserve the facial features and body structure of the reference image with EXTREME fidelity. The output must look exactly like the person in the reference.";
  } else if (accuracyLevel >= 40) {
    accuracyInstruction = "Use the reference image as a strong guide for the character's general look and facial structure, but allow for moderate artistic variations to fit the style.";
  } else {
    accuracyInstruction = "Use the reference image only as a loose inspiration. You are free to significantly alter the face and body structure to create a creative re-interpretation.";
  }

  const finalPrompt = `
    Create a high-quality image based on this description:
    Artistic Style/Theme: ${settings.style}.
    Character/Outfit: ${settings.charPrompt}.
    Context/Action: ${settings.contextPrompt}.
    
    Reference Instruction: ${accuracyInstruction}
    
    Ensure the lighting and composition are professional.
  `;

  // Select Model based on resolution/quality
  // 'uhd' -> gemini-3-pro-image-preview
  // others -> gemini-2.5-flash-image (faster, standard)
  const isHighQuality = settings.resolution === 'uhd' || settings.resolution === 'hd';
  const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  // Config mapping
  // Note: gemini-3-pro-image-preview supports imageSize: '1K' | '2K' | '4K'
  const imageSize = settings.resolution === 'uhd' ? '4K' : (settings.resolution === 'hd' ? '2K' : undefined);

  // Aspect Ratio validation
  const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
  const aspectRatio = validRatios.includes(settings.aspectRatio) ? settings.aspectRatio : "16:9";

  const parts: any[] = [{ text: finalPrompt }];
  
  if (base64RefImage) {
    parts.unshift({
      inlineData: {
        mimeType: 'image/png',
        data: base64RefImage
      }
    });
  }

  const config: any = {
    imageConfig: {
      aspectRatio: aspectRatio,
    }
  };

  if (isHighQuality && imageSize) {
    config.imageConfig.imageSize = imageSize;
  }

  try {
    const numImages = settings.numberOfImages || 1;
    const requests = [];

    // Generate multiple requests in parallel if > 1
    for (let i = 0; i < numImages; i++) {
      requests.push(ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: config
      }));
    }

    const responses = await Promise.all(requests);
    const images: string[] = [];

    for (const response of responses) {
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          images.push(part.inlineData.data);
        }
      }
    }

    if (images.length === 0) {
       throw new Error("Không có ảnh nào được tạo ra. Vui lòng thử mô tả khác.");
    }

    return images;

  } catch (error) {
    console.error("Generation Error:", error);
    throw error;
  }
};