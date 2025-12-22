import { GoogleGenAI } from "@google/genai";

export default async function handlerGenerateImage(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // 1. Lấy API Key an toàn từ biến môi trường
  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API Key chưa được cấu hình trên Vercel." });

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { image1, image2, settings } = req.body;

    // --- GIỮ NGUYÊN LOGIC CHUẨN CỦA BẠN TỪ ĐÂY ---
    const accuracyLevel = settings.accuracy;
    let accuracyInstruction = "";
    if (accuracyLevel >= 80) {
      accuracyInstruction = "CRITICAL: Preserve the facial features and body structure of the reference image(s) with EXTREME fidelity...";
    } else if (accuracyLevel >= 40) {
      accuracyInstruction = "Use the reference image(s) as a strong guide...";
    } else {
      accuracyInstruction = "Use the reference image(s) only as a loose inspiration...";
    }

    const finalPrompt = `
    Create a high-quality image based on this description: 
    Artistic Style/Theme: ${settings.style}. 
    Character/Outfit: ${settings.charPrompt}. 
    Context/Action: ${settings.contextPrompt}. 
    Reference Instruction: ${accuracyInstruction} 
    Ensure the lighting and composition are professional.`;

    const isHighQuality = settings.resolution === 'uhd' || settings.resolution === 'hd';
    const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const imageSize = settings.resolution === 'uhd' ? '4K' : (settings.resolution === 'hd' ? '2K' : undefined);
    
    const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const aspectRatio = validRatios.includes(settings.aspectRatio) ? settings.aspectRatio : "16:9";

    const parts = [{ text: finalPrompt }];
    if (base64RefImage2) parts.unshift({ inlineData: { mimeType: 'image/png', data: base64RefImage2 } });
    if (base64RefImage) parts.unshift({ inlineData: { mimeType: 'image/png', data: base64RefImage } });

    const config = { imageConfig: { aspectRatio: aspectRatio } };
    if (isHighQuality && imageSize) config.imageConfig.imageSize = imageSize;

    const numImages = settings.numberOfImages || 1;
    const requests = [];
    for (let i = 0; i < numImages; i++) {
      requests.push(ai.models.generateContent({ 
        model: modelName, 
        contents: { parts }, 
        config: config 
      }));
    }

    const responses = await Promise.all(requests);
    const images = [];
    for (const response of responses) {
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          images.push(part.inlineData.data);
        }
      }
    }
    // --- KẾT THÚC LOGIC CHUẨN ---

    if (images.length === 0) throw new Error("Không có ảnh nào được tạo ra.");

    return res.status(200).json({ images });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: error.message });
  }
}