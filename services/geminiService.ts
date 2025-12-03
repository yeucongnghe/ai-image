import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GlobalSettings, GeneratedSceneResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sceneSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sceneNumber: { type: Type.INTEGER },
          actionEn: { 
            type: Type.STRING, 
            description: "Description of the scene action, environment, and specific character movement in English. Do NOT repeat the character physical description here, just refer to them by name." 
          },
          actionVi: { 
            type: Type.STRING, 
            description: "Mô tả hành động, bối cảnh bằng tiếng Việt. Không lặp lại mô tả ngoại hình nhân vật, chỉ gọi tên." 
          },
          camera: { type: Type.STRING, description: "Camera angle, movement (e.g., Close-up, Dolly In)" },
          lighting: { type: Type.STRING, description: "Lighting setup (e.g., Cinematic, Moody blue)" }
        },
        required: ["sceneNumber", "actionEn", "actionVi", "camera", "lighting"]
      }
    }
  },
  required: ["scenes"]
};

export const generateSceneBreakdown = async (settings: GlobalSettings): Promise<GeneratedSceneResponse> => {
  const model = "gemini-2.5-flash"; // Good balance of speed and reasoning for text structuring

  const prompt = `
    Bạn là một đạo diễn phim chuyên nghiệp và chuyên gia tạo prompt cho AI Video VEO 3.
    Nhiệm vụ: Phân tích ý tưởng và bối cảnh được cung cấp để tạo ra danh sách ${settings.sceneCount} cảnh quay.

    ĐẦU VÀO:
    - Bối cảnh chung: ${settings.context || "Không có"}
    - Ý tưởng Video: ${settings.videoIdea}
    - Thể loại: ${settings.genre}
    - Tỉ lệ khung hình: ${settings.aspectRatio}
    - Ngôn ngữ đầu ra yêu cầu: Tiếng Anh và Tiếng Việt.

    YÊU CẦU KỸ THUẬT:
    1. Mỗi cảnh tối ưu cho video 8 giây.
    2. KHÔNG bao gồm đối thoại (dialogue) trừ khi cực kỳ cần thiết.
    3. Không chứa text/chữ trên màn hình.
    4. Phần "actionEn" và "actionVi" chỉ mô tả hành động cụ thể của cảnh đó. KHÔNG copy lại phần mô tả ngoại hình nhân vật vào đây (chúng tôi sẽ tự động ghép vào sau).
    5. Camera và Lighting phải phù hợp với thể loại ${settings.genre}.

    Hãy trả về định dạng JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: sceneSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GeneratedSceneResponse;
  } catch (error) {
    console.error("Error generating scenes:", error);
    throw error;
  }
};

export const regenerateSingleScene = async (
  sceneNumber: number, 
  settings: GlobalSettings, 
  currentAction: string
): Promise<{ actionEn: string; actionVi: string; camera: string; lighting: string }> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Viết lại prompt cho Cảnh số ${sceneNumber} của video VEO 3.
    
    Bối cảnh: ${settings.context}
    Ý tưởng gốc: ${settings.videoIdea}
    Hành động hiện tại: "${currentAction}"
    
    Yêu cầu: 
    - Viết lại một biến thể khác sáng tạo hơn hoặc chi tiết hơn cho hành động này.
    - Trả về JSON gồm: actionEn, actionVi, camera, lighting.
    - Chỉ mô tả hành động, không lặp lại mô tả nhân vật.
  `;

  const singleSceneSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      actionEn: { type: Type.STRING },
      actionVi: { type: Type.STRING },
      camera: { type: Type.STRING },
      lighting: { type: Type.STRING }
    }
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: singleSceneSchema
    }
  });

  return JSON.parse(response.text!) as any;
};
