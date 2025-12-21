import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Chỉ cho phép phương thức POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API Key chưa được cấu hình trên Vercel." });
  }

  // Khởi tạo SDK
  const genAI = new GoogleGenAI(apiKey);

  try {
    const { base64RefImage, base64RefImage2, settings } = req.body;

    // SỬA LỖI V1BETA: Sử dụng getGenerativeModel thay vì ai.models.get
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Xây dựng Prompt từ settings (Giữ nguyên logic của bạn)
    const accuracyLevel = settings.accuracy || 50;
    let accuracyInstruction = "";
    if (accuracyLevel >= 80) {
      accuracyInstruction = "CRITICAL: Preserve the facial features and body structure with EXTREME fidelity.";
    } else if (accuracyLevel >= 40) {
      accuracyInstruction = "Use the reference image(s) as a strong guide for facial structure.";
    } else {
      accuracyInstruction = "Use the reference image(s) only as a loose inspiration.";
    }

    const finalPrompt = `
      Task: ${settings.task || "Generate/Process Image"}
      Style: ${settings.style}.
      Character: ${settings.charPrompt}.
      Context: ${settings.contextPrompt}.
      Instruction: ${accuracyInstruction}
    `;

    // 2. Chuẩn bị dữ liệu đầu vào (Parts)
    const parts = [{ text: finalPrompt }];

    if (base64RefImage) {
      parts.push({
        inlineData: { mimeType: 'image/png', data: base64RefImage }
      });
    }
    if (base64RefImage2) {
      parts.push({
        inlineData: { mimeType: 'image/png', data: base64RefImage2 }
      });
    }

    // 3. Gọi AI tạo nội dung
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    const response = await result.response;
    const text = response.text(); // Đôi khi model trả về text mô tả

    // 4. Trích xuất ảnh Base64 từ kết quả
    const images = [];
    const candidates = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidates) {
      if (part.inlineData) {
        images.push(part.inlineData.data);
      }
    }

    if (images.length === 0) {
      // Nếu là hàm remove background, model thường trả về ảnh trực tiếp.
      // Nếu không thấy ảnh, trả về lỗi để debug
      return res.status(200).json({ 
        message: "AI đã xử lý nhưng không trả về dữ liệu ảnh trực tiếp.",
        text: text 
      });
    }

    return res.status(200).json({ images });

  } catch (error) {
    console.error("Lỗi Backend:", error);
    return res.status(500).json({ error: error.message });
  }
}
