import React, { useState, useRef } from 'react';
import { Upload, Trash2, Settings2, Eraser, Image as ImageIcon } from 'lucide-react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ResultViewer from './components/ResultViewer';
import { AppSettings, SUGGESTIONS, AspectRatio } from './types';
import { fileToGenerativePart, generateImageAI, removeBackgroundAI } from './services/geminiService';

const STYLES = [
  { value: 'Vintage', label: 'Cổ điển (Vintage)' },
  { value: 'Business', label: 'Doanh nhân (Business)' },
  { value: 'Evening Wear', label: 'Dạ hội (Evening Wear)' },
  { value: 'Smart Casual', label: 'Đời thường (Smart Casual)' },
  { value: 'Cyberpunk', label: 'Cyberpunk' },
  { value: 'Sketch', label: 'Phác hoạ (Sketch)' },
];

const App: React.FC = () => {
  // State
  const [refImage, setRefImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    charPrompt: '',
    contextPrompt: '',
    accuracy: 100, // Changed default to 100%
    aspectRatio: '16:9',
    resolution: 'standard',
    style: 'Smart Casual', // Default style updated to Smart Casual
    numberOfImages: 1, // Default to 1 image
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [resultImages, setResultImages] = useState<string[]>([]); // Changed to array
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToGenerativePart(e.target.files[0]);
        setRefImage(base64);
      } catch (error) {
        alert("Lỗi tải ảnh: " + error);
      }
    }
  };

  const handleRemoveBackground = async () => {
    if (!refImage) return;
    setIsRemovingBg(true);
    try {
      const newImage = await removeBackgroundAI(refImage);
      setRefImage(newImage); // Update ref image with BG removed version
    } catch (error) {
      alert("Lỗi xoá phông: " + (error as any).message);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleGenerate = async () => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If no image, we need at least a description
    if (!refImage && !settings.charPrompt) {
      alert("Vui lòng tải ảnh tham chiếu HOẶC nhập mô tả nhân vật.");
      return;
    }

    setIsProcessing(true);
    try {
      const results = await generateImageAI(refImage, settings);
      setResultImages(results);
    } catch (error) {
      alert("Lỗi tạo ảnh: " + (error as any).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper for accuracy label
  const getAccuracyLabel = (val: number) => {
    if (val >= 80) return "Như ảnh gốc (100%)";
    if (val >= 40) return "Thay đổi nhẹ (40-70%)";
    return "Sáng tạo tự do (0-30%)";
  };

  // Helper for resolution label
  const getResolutionLabel = (val: string) => {
    switch (val) {
      case 'standard': return 'Tiêu chuẩn (720p)';
      case 'hd': return 'Full HD (1080p)';
      case 'uhd': return 'Chất lượng cao (2K/4K)';
      default: return val;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Controls - 40% */}
          <div className="w-full lg:w-[40%] flex-none space-y-8">
            
            {/* 1. Upload Section */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="text-brand-500" />
                Ảnh Tham Chiếu
              </h2>
              
              <div 
                className={`relative w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden group ${refImage ? 'border-brand-500 bg-slate-900' : 'border-slate-700 hover:border-brand-400 hover:bg-slate-800 hover:shadow-lg hover:shadow-brand-500/10'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {refImage ? (
                  <img src={`data:image/png;base64,${refImage}`} alt="Ref" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-4 transform group-hover:scale-105 transition-transform duration-300">
                    <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2 group-hover:text-brand-400 transition-colors" />
                    <p className="text-slate-400 font-medium group-hover:text-slate-200">Click để tải ảnh lên</p>
                    <p className="text-slate-600 text-xs mt-1">Chân dung hoặc toàn thân</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>

              {/* Action Buttons for Upload */}
              {refImage && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setRefImage(null); }}
                      className="flex-1 py-3 px-4 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-red-500/20 hover:-translate-y-0.5"
                    >
                      <Trash2 className="w-4 h-4" /> Xoá ảnh
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveBackground(); }}
                      disabled={isRemovingBg}
                      className="flex-1 py-3 px-4 bg-slate-800 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {isRemovingBg ? (
                         <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                       ) : (
                         <Eraser className="w-4 h-4" />
                       )}
                       Xoá phông nền
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    * Xoá phông sẽ thay nền bằng màu trắng để AI dễ nhận diện chủ thể.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Settings & Prompts */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings2 className="text-brand-500" />
                Thông số tạo ảnh
              </h2>

              <PromptInput 
                label="Mô tả nhân vật & trang phục"
                placeholder="Ví dụ: Một cô gái mặc áo dài đỏ..."
                value={settings.charPrompt}
                onChange={(val) => setSettings(s => ({...s, charPrompt: val}))}
                suggestions={SUGGESTIONS.character}
              />

              <PromptInput 
                label="Bối cảnh & Hành động"
                placeholder="Ví dụ: Đứng dưới mưa, ánh đèn neon..."
                value={settings.contextPrompt}
                onChange={(val) => setSettings(s => ({...s, contextPrompt: val}))}
                suggestions={SUGGESTIONS.context}
              />

              {/* Sliders and Dropdowns */}
              <div className="space-y-5 pt-4 border-t border-slate-800">
                
                {/* Accuracy Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-300">Độ chính xác khuôn mặt, hình dáng với ảnh gốc</label>
                    <span className="text-xs font-mono text-brand-400 bg-brand-900/30 px-2 py-0.5 rounded">
                      {settings.accuracy}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={settings.accuracy} 
                    onChange={(e) => setSettings(s => ({...s, accuracy: Number(e.target.value)}))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <p className="text-xs text-slate-500 mt-1 text-right italic">
                    {getAccuracyLabel(settings.accuracy)}
                  </p>
                </div>

                {/* Style & Number of Images - Row */}
                <div className="flex flex-row gap-4">
                  {/* Style Dropdown */}
                  <div className="w-[48%]">
                    <label className="block text-sm font-semibold text-slate-300 mb-2 truncate">
                      Chọn phong cách
                    </label>
                    <select 
                      value={settings.style}
                      onChange={(e) => setSettings(s => ({...s, style: e.target.value}))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-shadow focus:shadow-lg focus:shadow-brand-500/20"
                    >
                      {STYLES.map((style) => (
                        <option key={style.value} value={style.value}>{style.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Images Dropdown */}
                  <div className="w-[48%]">
                    <label className="block text-sm font-semibold text-slate-300 mb-2 truncate">
                      Chọn số ảnh tạo
                    </label>
                    <select 
                      value={settings.numberOfImages}
                      onChange={(e) => setSettings(s => ({...s, numberOfImages: Number(e.target.value)}))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-shadow focus:shadow-lg focus:shadow-brand-500/20"
                    >
                      <option value={1}>1 Ảnh</option>
                      <option value={2}>2 Ảnh</option>
                    </select>
                  </div>
                </div>

                {/* Aspect Ratio & Resolution - Row */}
                <div className="flex flex-row gap-4">
                  {/* Aspect Ratio */}
                  <div className="w-[48%]">
                    <label className="block text-sm font-semibold text-slate-300 mb-2 truncate">
                      Tỉ lệ khung hình
                    </label>
                    <select 
                      value={settings.aspectRatio}
                      onChange={(e) => setSettings(s => ({...s, aspectRatio: e.target.value as AspectRatio}))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-shadow focus:shadow-lg focus:shadow-brand-500/20"
                    >
                      <option value="16:9">16:9</option>
                      <option value="1:1">1:1</option>
                      <option value="9:16">9:16</option>
                      <option value="3:4">3:4</option>
                      <option value="4:3">4:3</option>
                    </select>
                  </div>

                  {/* Resolution */}
                  <div className="w-[48%]">
                    <label className="block text-sm font-semibold text-slate-300 mb-2 truncate">
                      Chất lượng hình ảnh
                    </label>
                    <select 
                      value={settings.resolution}
                      onChange={(e) => setSettings(s => ({...s, resolution: e.target.value as any}))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-shadow focus:shadow-lg focus:shadow-brand-500/20"
                    >
                      <option value="standard">Tiêu chuẩn</option>
                      <option value="hd">Full HD</option>
                      <option value="uhd">2K/4K</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isProcessing || isRemovingBg}
                className="w-full py-4 bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 hover:from-brand-500 hover:via-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-brand-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 bg-[length:200%_auto] hover:bg-right"
              >
                {isProcessing ? 'Đang xử lý...' : 'Tạo hình ảnh ✨'}
              </button>

            </div>
          </div>

          {/* RIGHT COLUMN: Result - Takes remaining space */}
          <div className="flex-1">
            <ResultViewer images={resultImages} isLoading={isProcessing} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;