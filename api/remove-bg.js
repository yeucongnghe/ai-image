import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { base64RefImage, settings } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey) throw new Error("API_KEY is missing");
    if (!base64RefImage) throw new Error("No image data");

    // Khởi tạo trực tiếp (đã kiểm tra tương thích ESM)
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Sử dụng settings đã có (như bạn đã sửa thành công ở Client)
    const accuracy = settings?.accuracy || 100;
    
    const result = await model.generateContent([
      `Remove background. Precision: ${accuracy}%`,
      { inlineData: { mimeType: "image/png", data: base64RefImage } }
    ]);

    const response = await result.response;
    const imageData = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imageData) throw new Error("AI did not return image data");

    return res.status(200).json({ images: [imageData.inlineData.data] });

  } catch (error) {
    console.error("Backend Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}