// Sử dụng require thay vì import nếu bạn gặp vấn đề về module trong Node.js
const { GoogleGenAI } = require("@google/genai");

export default async function handler(req, res) {
  // Chỉ chấp nhận POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Missing API_KEY in Environment Variables");

    // Khởi tạo đúng cách
    const genAI = new GoogleGenAI(apiKey);
    
    // Sử dụng Gemini 1.5 Flash để tránh lỗi Quota (Limit 0) 
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { base64RefImage } = req.body;
    if (!base64RefImage) throw new Error("No image data provided");

    // Logic xử lý ảnh
    const prompt = "Remove the background from this image. Return the result as an image.";
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
      throw new Error("AI did not return image data. Check if the prompt is valid for this model.");
    }

    // Trả về JSON chuẩn để Client không bị lỗi "Unexpected token A"
    return res.status(200).json({ 
      images: [imageData.inlineData.data] 
    });

  } catch (error) {
    console.error("Backend Error:", error.message);
    // Luôn trả về JSON ngay cả khi có lỗi
    return res.status(500).json({ error: error.message });
  }
}