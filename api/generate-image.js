import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handlerGenerateImage(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API Key chưa được cấu hình." });

  // Khởi tạo SDK chính thức
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // 1. Lấy dữ liệu khớp với Payload trong ảnh image_4a5424.jpg
    const { image1, image2, settings } = req.body;

    if (!settings) {
      return res.status(400).json({ error: "Thiếu thông tin settings trong request." });
    }

    // 2. Xử lý logic Instruction dựa trên accuracy (giữ nguyên logic của bạn)
    const accuracyLevel = settings.accuracy || 100;
    let accuracyInstruction = "";
    if (accuracyLevel >= 80) {
      accuracyInstruction = "CRITICAL: Preserve the facial features and body structure with EXTREME fidelity.";
    } else if (accuracyLevel >= 40) {
      accuracyInstruction = "Use the reference image(s) as a strong guide.";
    } else {
      accuracyInstruction = "Use the reference image(s) only as a loose inspiration.";
    }

    const finalPrompt = `Artistic Style: ${settings.style}. Character: ${settings.charPrompt}. Context: ${settings.contextPrompt}. Reference Instruction: ${accuracyInstruction}`;

    // 3. Chọn Model từ danh sách thực tế của bạn (image_58f307.jpg)
    const isHighQuality = settings.resolution === 'uhd' || settings.resolution === 'hd';
    const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const model = genAI.getGenerativeModel({ model: modelName });

    // 4. Chuẩn bị dữ liệu Input
    const parts = [{ text: finalPrompt }];
    
    // Xử lý image1 (Nhân vật chính)
    if (image1) {
      const data1 = image1.includes("base64,") ? image1.split(",")[1] : image1;
      parts.unshift({ inlineData: { mimeType: 'image/png', data: data1 } });
    }
    
    // Xử lý image2 (Nhân vật phụ)
    if (image2) {
      const data2 = image2.includes("base64,") ? image2.split(",")[1] : image2;
      parts.unshift({ inlineData: { mimeType: 'image/png', data: data2 } });
    }

    // 5. Cấu hình tạo ảnh (Dựa trên SDK hỗ trợ cho Gemini Image Models)
    const generationConfig = {
      // Sử dụng tham số phù hợp với model tạo ảnh
      candidateCount: 1,
      // mapping resolution sang imageConfig nếu model yêu cầu
      // Lưu ý: Tùy phiên bản SDK, bạn có thể cần bọc trong một trường config riêng
    };

    // Gọi API
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig
    });

    const response = await result.response;
    
    // 6. Trích xuất ảnh (Gemini Image models thường trả về inlineData trong parts)
    const images = [];
    const responseParts = response.candidates?.[0]?.content?.parts || [];
    
    for (const part of responseParts) {
      if (part.inlineData) {
        images.push(part.inlineData.data);
      }
    }

    if (images.length === 0) {
      // Fallback: Nếu model trả về văn bản thay vì ảnh (do prompt hoặc filter)
      return res.status(200).json({ 
        success: false, 
        message: "Không tìm thấy dữ liệu ảnh trong phản hồi của AI.",
        debug: response.text ? response.text() : "No text response"
      });
    }

    // Trả về kết quả đúng định dạng mà Frontend đang chờ (image_4a58fe.jpg)
    return res.status(200).json({ success: true, images });

  } catch (error) {
    console.error("Lỗi Backend Chi Tiết:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}