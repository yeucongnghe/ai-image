import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Luôn đặt Header trả về JSON ngay đầu file
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { image1, image2, settings } = req.body;
    
    // Kiểm tra API Key
    if (!process.env.API_KEY) {
      return res.status(500).json({ success: false, error: "Thiếu API_KEY trong Environment Variables" });
    }

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

    // Chọn đúng model từ danh sách của bạn
    const isHighQuality = settings?.resolution === 'uhd' || settings?.resolution === 'hd';
    const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const model = genAI.getGenerativeModel({ model: modelName });

    // Chuẩn bị dữ liệu
    const parts = [];
    if (image1) {
      const data1 = image1.includes("base64,") ? image1.split(",")[1] : image1;
      parts.push({ inlineData: { mimeType: 'image/png', data: data1 } });
    }
    if (image2) {
      const data2 = image2.includes("base64,") ? image2.split(",")[1] : image2;
      parts.push({ inlineData: { mimeType: 'image/png', data: data2 } });
    }
    
    const promptText = `Generate image. Style: ${settings?.style}. Prompt: ${settings?.charPrompt}, ${settings?.contextPrompt}`;
    parts.push({ text: promptText });

    // Gọi API với cơ chế Timeout ảo để tránh crash Vercel
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    const response = await result.response;
    
    // Trích xuất dữ liệu ảnh
    const images = [];
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          images.push(part.inlineData.data);
        }
      }
    }

    if (images.length === 0) {
      return res.status(200).json({ success: false, error: "AI không trả về ảnh. Có thể do nội dung nhạy cảm." });
    }

    return res.status(200).json({ success: true, images });

  } catch (error) {
    console.error("LOG LỖI BACKEND:", error.message);
    // Trả về JSON lỗi thay vì để Vercel trả về HTML lỗi
    return res.status(500).json({ success: false, error: "Lỗi Server: " + error.message });
  }
}