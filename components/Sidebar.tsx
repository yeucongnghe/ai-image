import React from 'react';
import { GlobalSettings, AspectRatio } from '../types';
import { Film, User, Type, Grid3X3 } from 'lucide-react';

interface SidebarProps {
  settings: GlobalSettings;
  setSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onGenerate, isGenerating }) => {
  
  const handleChange = (field: keyof GlobalSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const STYLE_OPTIONS = [
    "Cinematic (Điện ảnh)",
    "Anime (Hoạt hình Nhật Bản)",
    "Cyberpunk (Viễn tưởng Cyberpunk)",
    "3D Animation (Hoạt hình 3D kiểu Pixar/Disney)",
    "Watercolor (Tranh màu nước)",
    "Film Noir (Phim đen trắng nghệ thuật)",
    "Documentary (Phim tài liệu)",
    "Fantasy (Thần thoại / Kỳ ảo)",
    "Sci-Fi (Khoa học viễn tưởng)",
    "Horror (Kinh dị)",
    "Vintage/Retro (Cổ điển / Hoài cổ)",
    "Oil Painting (Tranh sơn dầu)",
    "Photorealistic (Chân thực như ảnh)",
    "Abstract (Trừu tượng)",
    "Low Poly (Đồ họa 3D khối)"
  ];

  return (
    <div className="w-1/3 h-full bg-gray-900 border-r border-gray-800 flex flex-col shadow-xl z-20">
      
      {/* Title removed, now handled in App.tsx */}

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        
        {/* Narrative Section - Moved to Top */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-semibold uppercase text-xs tracking-wider">
            <Type className="w-4 h-4" /> Kịch bản
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Bối cảnh (Context)</label>
            <textarea 
              value={settings.context}
              onChange={(e) => handleChange('context', e.target.value)}
              placeholder="Mô tả thế giới, địa điểm chung..."
              className="w-full h-20 bg-gray-800 text-gray-200 border border-gray-700 rounded p-2 text-sm focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Ý tưởng Video (Video Idea)</label>
            <textarea 
              value={settings.videoIdea}
              onChange={(e) => handleChange('videoIdea', e.target.value)}
              placeholder="Tóm tắt nội dung chính của video..."
              className="w-full h-24 bg-gray-800 text-gray-200 border border-gray-700 rounded p-2 text-sm focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>
        </section>

        <hr className="border-gray-800" />

        {/* Characters Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-400 font-semibold uppercase text-xs tracking-wider">
            <User className="w-4 h-4" /> Mô tả nhân vật (Master)
          </div>
          <p className="text-gray-500 text-xs italic">
            Nội dung này sẽ tự động được thêm vào đầu mỗi prompt cảnh để đảm bảo tính nhất quán (Consistency).
          </p>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Tiếng Việt (VI)</label>
            <textarea 
              value={settings.characterDescVi}
              onChange={(e) => handleChange('characterDescVi', e.target.value)}
              placeholder="Mô tả chi tiết ngoại hình nhân vật bằng Tiếng Việt..."
              className="w-full h-32 bg-gray-800 text-gray-200 border border-gray-700 rounded p-2 text-sm focus:border-green-500 focus:outline-none custom-scrollbar"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Tiếng Anh (EN)</label>
            <textarea 
              value={settings.characterDescEn}
              onChange={(e) => handleChange('characterDescEn', e.target.value)}
              placeholder="Detailed character physical description in English..."
              className="w-full h-32 bg-gray-800 text-gray-200 border border-gray-700 rounded p-2 text-sm focus:border-green-500 focus:outline-none custom-scrollbar"
            />
          </div>
        </section>

        <hr className="border-gray-800" />

        {/* Basic Settings Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-semibold uppercase text-xs tracking-wider">
            <Film className="w-4 h-4" /> Thiết lập chung
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-gray-400 text-xs mb-1">Tỉ lệ khung hình</label>
              <select 
                value={settings.aspectRatio}
                onChange={(e) => handleChange('aspectRatio', e.target.value)}
                className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value={AspectRatio.RATIO_16_9}>16:9 (Ngang)</option>
                <option value={AspectRatio.RATIO_9_16}>9:16 (Dọc)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Số lượng cảnh</label>
              <input 
                type="number" 
                min={1} 
                max={20}
                value={settings.sceneCount}
                onChange={(e) => handleChange('sceneCount', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-1">Thể loại / Style</label>
            <select 
              value={settings.genre}
              onChange={(e) => handleChange('genre', e.target.value)}
              className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded p-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {STYLE_OPTIONS.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
        </section>

      </div>

      <div className="p-5 border-t border-gray-800 bg-gray-900">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !settings.videoIdea}
          className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5
            ${isGenerating || !settings.videoIdea
              ? 'bg-gray-800 cursor-not-allowed text-gray-600 border border-gray-700' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-500/50 hover:shadow-blue-500/25'}`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Đang phân tích...
            </>
          ) : (
            <>
              <Grid3X3 className="w-5 h-5" />
              Tạo danh sách cảnh
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;