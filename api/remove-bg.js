const { GoogleGenAI } = require("@google/genai"); // Dùng require cho ổn định trong Node.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const apiKey = process.env.API_KEY;
  // Khởi tạo genAI
  const genAI = new GoogleGenAI(apiKey);

  try {
    // Sửa lỗi: Gọi trực tiếp từ instance genAI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { base64RefImage, settings } = req.body;

    // Cấu hình nội dung gửi đi
    const prompt = "Remove the background of this image and return only the object.";
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
    // Trích xuất ảnh trả về
    const imageData = response.candidates[0].content.parts.find(p => p.inlineData);
    
    if (!imageData) throw new Error("AI không trả về ảnh.");

    res.status(200).json({ images: [imageData.inlineData.data] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}