const { GoogleGenAI } = require("@google/genai");

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { base64RefImage, settings } = req.body; // Lấy dữ liệu từ Client

    // PHẦN SỬA LỖI: Kiểm tra nếu settings bị thiếu
    const safeSettings = settings || {}; 
    const accuracyLevel = safeSettings.accuracy || 50; // Nếu thiếu accuracy, mặc định là 50

    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY is missing on server");
    if (!base64RefImage) throw new Error("No image data provided");

    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Sử dụng accuracyLevel an toàn trong prompt
    const prompt = `Remove the background. Precision level: ${accuracyLevel}%. Return processed image data.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/png", data: base64RefImage } }
    ]);

    const response = await result.response;
    const imageData = response.candidates[0].content.parts.find(p => p.inlineData);

    if (!imageData) throw new Error("AI did not return image data");
    return res.status(200).json({ images: [imageData.inlineData.data] });

  } catch (error) {
    console.error("Backend Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};