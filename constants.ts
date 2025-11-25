import { StyleOption } from './types';

export const STYLES: StyleOption[] = [
  {
    id: 'vintage',
    name: 'Cổ điển (Vintage)',
    description: 'Phong cách ảnh xưa thập niên 50, màu sepia, nhiễu hạt, hoài niệm.',
    promptModifier: 'Transform the image into a vintage, old-school photograph. Apply sepia tones, film grain, scratches, and slight vignetting. The aesthetic should resemble photography from the 1950s or earlier. Soft focus, historical feeling. Maintain the subject\'s facial features strictly.'
  },
  {
    id: 'business',
    name: 'Doanh nhân (Business)',
    description: 'Phong cách chuyên nghiệp, vest, công sở, phù hợp làm ảnh profile.',
    promptModifier: 'Change the clothing to a high-quality professional business suit. The background should be a modern office or neutral studio setting. Maintain the person\'s facial features and pose exactly. Photorealistic, 8k resolution.'
  },
  {
    id: 'evening',
    name: 'Dạ hội (Evening Wear)',
    description: 'Sang trọng, lộng lẫy, phù hợp cho các sự kiện tiệc tùng.',
    promptModifier: 'Change the clothing to an elegant evening gown or tuxedo suitable for a red carpet event. The background should be a luxury evening setting with bokeh lights. Maintain the person\'s facial features and pose exactly. Glamorous, high fashion photography.'
  },
  {
    id: 'casual',
    name: 'Đời thường (Smart Casual)',
    description: 'Thoải mái, năng động nhưng vẫn lịch sự.',
    promptModifier: 'Change the clothing to smart casual street wear, fashionable and trendy. The background should be a blurred city street or cafe. Maintain the person\'s facial features and pose exactly. Lifestyle photography style.'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Phong cách tương lai với ánh đèn neon và công nghệ cao.',
    promptModifier: 'Transform the image into a cyberpunk style. Add neon lights, futuristic clothing accessories, and a high-tech city background. Maintain the person\'s facial features. Cinematic lighting, detailed.'
  },
  {
    id: 'sketch',
    name: 'Phác họa (Sketch)',
    description: 'Tranh vẽ chì nghệ thuật.',
    promptModifier: 'Transform this image into a high-quality pencil sketch art. Detailed shading, artistic strokes, white background. Keep the likeness of the person.'
  }
];