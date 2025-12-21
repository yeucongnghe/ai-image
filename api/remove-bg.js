// Sử dụng require thay vì import để đảm bảo tương thích Node.js trên Vercel
const { GoogleGenAI } = require("@google/genai");

module.exports = async (req, res) => {
  // Thiết lập Header để luôn trả về JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { base64RefImage } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey) throw new Error("API_KEY is not defined in Vercel environment");
    if (!base64RefImage) throw new Error("No image data provided");

    const genAI = new GoogleGenAI(apiKey);
    
    // Sử dụng Gemini 1.5 Flash vì tài khoản của bạn đang bị limit 0 với bản 2.0
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      "Remove the background from this image and return the processed image data.",
      {
        inlineData: {
          mimeType: "image/png",
          data: base64RefImage
        }
      }
    ]);

    const response = await result.response;
    const imageData = response.candidates[0].content.parts.find(p => p.inlineData);

    if (!imageData) throw new Error("AI did not return image data");

    return res.status(200).json({ images: [imageData.inlineData.data] });

  } catch (error) {
    console.error("Server Error:", error.message);
    // Trả về JSON lỗi thay vì để Vercel trả về trang HTML lỗi
    return res.status(500).json({ error: error.message });
  }
};