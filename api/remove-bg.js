import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Lấy Key từ môi trường Vercel (không lộ ra ngoài)
  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Chưa cấu hình API Key trên Vercel" });

  const ai = new GoogleGenAI({ apiKey });

  try {
    const { base64Image } = req.body;

    const response = await ai.models.generateContent({
      //model: 'gemini-2.0-flash-exp', // Giữ model bạn đã test thành công
      model: 'gemini-1.5-flash', // Giữ model bạn đã test thành công
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image
            }
          },
          {
            text: "Remove the background of this image. Replace the background with a solid white color. Keep the person or main subject exactly as they are, do not change their face or clothes."
          }
        ]
      }
    });

    // Giữ nguyên logic extract ảnh chuẩn của bạn
    let resultData = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        resultData = part.inlineData.data;
        break;
      }
    }

    if (!resultData) throw new Error("Không thể trích xuất ảnh từ kết quả AI.");

    res.status(200).json({ data: resultData });

  } catch (error) {
    console.error("BG Removal Error:", error);
    res.status(500).json({ error: error.message });
  }
}
