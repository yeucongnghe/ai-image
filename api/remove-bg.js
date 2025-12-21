import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Đảm bảo luôn trả về JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { base64RefImage, settings } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey) throw new Error("API_KEY chưa được cấu hình trên Vercel");
    if (!base64RefImage) throw new Error("Chưa nhận được ảnh từ client");

    // KHỞI TẠO: Đây là cách viết chuẩn nhất cho @google/genai bản mới
    const genAI = new GoogleGenAI(apiKey);
    
    // Gọi model 1.5-flash để đảm bảo có hạn mức (quota)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const accuracy = settings?.accuracy || 100;
    const prompt = `Remove the background of this image. Keep the main subject with ${accuracy}% precision. Return the result as an image.`;

    // Thực hiện tạo nội dung
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/png",
          data: base64RefImage
        }
      }
    ]);

    const response = await result.response;
    const candidates = response.candidates?.[0]?.content?.parts || [];
    const imageData = candidates.find(p => p.inlineData);

    if (!imageData) {
      throw new Error("AI không trả về dữ liệu ảnh trực tiếp.");
    }

    return res.status(200).json({ images: [imageData.inlineData.data] });

  } catch (error) {
    console.error("Lỗi xử lý:", error.message);
    return res.status(500).json({ error: error.message });
  }
}