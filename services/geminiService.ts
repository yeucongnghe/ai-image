import { GoogleGenAI } from "@google/genai";
import { StyleOption, OutputQuality, AspectRatio } from "../types";

// Helper to validate API key existence
const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }
  return apiKey;
};

export const generateStyledImage = async (
  base64Image: string,
  mimeType: string,
  style: StyleOption,
  influence: number,
  characterDescription: string,
  sceneAction: string,
  outputQuality: OutputQuality,
  aspectRatio: AspectRatio,
  count: number = 1
): Promise<string[]> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // MAPPING:
  // "Nano Banana" -> 'gemini-2.5-flash-image' (Standard)
  // "Nano Banana 2 / Pro" -> 'gemini-3-pro-image-preview' (High Quality)
  const model = outputQuality === 'high' ? "gemini-3-pro-image-preview" : "gemini-2.5-flash-image";
  
  // Configuration specific to Nano Banana series models
  const config: any = {
    imageConfig: {
      // Use user selected aspect ratio
      // Supported values: "1:1", "3:4", "4:3", "9:16", "16:9"
      aspectRatio: aspectRatio, 
    }
  };

  // 2K/4K resolution is only supported on the Pro model
  if (outputQuality === 'high') {
    config.imageConfig.imageSize = "2K";
  }

  // Construct instruction based on influence slider
  let influenceInstruction = "";
  if (influence >= 95) {
    influenceInstruction = "CRITICAL: Strictly preserve the original facial features, expression, and head pose. The face MUST look exactly like the input. Only change clothing, background, and style.";
  } else if (influence >= 70) {
    influenceInstruction = "Maintain high fidelity to the original facial features and pose. Adapt the style around the subject.";
  } else if (influence >= 30) {
    influenceInstruction = "Use the original image as a reference for pose and general appearance, but allow flexibility in facial details to fit the artistic style.";
  } else {
    influenceInstruction = "Use the original image only as a loose composition reference. You are free to change the character's appearance significantly.";
  }

  let descriptionPrompt = "";
  if (characterDescription && characterDescription.trim().length > 0) {
    descriptionPrompt = `CHARACTER DETAILS: "${characterDescription}". Apply these details (hair, accessories, clothes) while keeping the face structure if influence is high.`;
  }

  let scenePrompt = "";
  if (sceneAction && sceneAction.trim().length > 0) {
    scenePrompt = `SCENE & ACTION: "${sceneAction}". Integrate the character naturally into this environment.`;
  }

  const fullPrompt = `
    TASK: Transform the attached image according to the following requirements.
    STYLE: ${style.name} - ${style.promptModifier}
    
    INSTRUCTIONS:
    1. ${influenceInstruction}
    2. ${descriptionPrompt}
    3. ${scenePrompt}
    4. QUALITY: ${outputQuality === 'high' ? 'Highly detailed, 4k, photorealistic' : 'Standard quality'}.
    5. AESTHETIC: Ensure the lighting and texture match the requested style perfectly.
    
    If the input image does not contain a clear person or face, and the task requires one, try to generate a character based on the description provided, but prioritize the input image structure.
  `;

  // Helper function to make a single request
  const makeRequest = async (): Promise<string> => {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: config
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        // Nano Banana models return the image in inlineData
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in response.");
  };

  // Execute requests in parallel
  try {
    const promises = Array(count).fill(null).map(() => makeRequest());
    const results = await Promise.all(promises);
    return results;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Improve error message for user
    if (error.message?.includes("safety") || error.message?.includes("blocked")) {
      throw new Error("Hình ảnh hoặc nội dung mô tả vi phạm chính sách an toàn của AI. Vui lòng thử ảnh hoặc mô tả khác.");
    }
    throw new Error(error.message || "Không thể tạo ảnh. Vui lòng thử lại sau.");
  }
};

export const removeBackground = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  // Using Nano Banana (Flash Image) for fast editing tasks
  const model = "gemini-2.5-flash-image";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Strictly remove the background. Output ONLY the subject on a pure white background (#FFFFFF). Preserve all hair details and edge quality. Do not crop the subject.",
          },
        ],
      },
      config: {
        imageConfig: {
           aspectRatio: "3:4" // Keep consistent ratio
        }
      }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in response for background removal.");
  } catch (error: any) {
    console.error("Gemini API Error (Remove BG):", error);
    throw new Error("Không thể xoá nền. Ảnh có thể quá phức tạp hoặc không có đối tượng rõ ràng.");
  }
};