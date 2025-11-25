import React, { useState, useCallback } from 'react';
import { UploadArea } from './components/UploadArea';
import { PreviewArea } from './components/PreviewArea';
import { StyleSelector } from './components/StyleSelector';
import { Header } from './components/Header';
import { generateStyledImage, removeBackground } from './services/geminiService';
import { StyleOption, GeneratedImageResult, OutputQuality, AspectRatio } from './types';
import { STYLES } from './constants';
import { Sparkles, AlertCircle, Scissors, Sliders, FileText, Clapperboard, Monitor, Layers, Crop } from 'lucide-react';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Set default style to 'casual' (Đời thường)
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLES.find(s => s.id === 'casual') || STYLES[0]);
  const [influence, setInfluence] = useState<number>(100);
  const [characterDescription, setCharacterDescription] = useState<string>("");
  const [sceneAction, setSceneAction] = useState<string>("");
  const [outputQuality, setOutputQuality] = useState<OutputQuality>('standard');
  const [imageCount, setImageCount] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setGeneratedImages([]); // Reset results
    setError(null);
  }, []);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImages([]);
    setError(null);
  }, []);

  const handleStyleSelect = useCallback((style: StyleOption) => {
    setSelectedStyle(style);
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Content = reader.result.split(',')[1];
          resolve(base64Content);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsRemovingBg(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(selectedFile);
      const mimeType = selectedFile.type;
      
      const newImageDataUrl = await removeBackground(base64Data, mimeType);
      
      setPreviewUrl(newImageDataUrl);
      const newFile = dataURLtoFile(newImageDataUrl, "processed_bg_removed.png");
      setSelectedFile(newFile);
      setGeneratedImages([]);
    } catch (err: any) {
      console.error("Error removing background:", err);
      setError(err.message || "Không thể xoá nền ảnh. Vui lòng thử lại.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError("Vui lòng tải ảnh lên trước khi tạo.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]); // Clear previous for fresh start

    try {
      const base64Data = await fileToBase64(selectedFile);
      const mimeType = selectedFile.type;

      const results = await generateStyledImage(
        base64Data, 
        mimeType, 
        selectedStyle, 
        influence,
        characterDescription,
        sceneAction,
        outputQuality,
        aspectRatio,
        imageCount
      );
      
      const newImages: GeneratedImageResult[] = results.map((url, index) => ({
        id: `gen-${Date.now()}-${index}`,
        imageUrl: url,
        style: selectedStyle.name
      }));

      setGeneratedImages(newImages);
    } catch (err: any) {
      console.error("Error generating image:", err);
      setError(err.message || "Đã xảy ra lỗi trong quá trình tạo ảnh. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#73daf1] selection:bg-violet-200">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: All Inputs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-2xl p-6 shadow-xl shadow-zinc-200/50 border border-zinc-100/80 transition-colors duration-500 bg-[#73daf1]">
              <h2 className="text-xl font-bold text-zinc-800 mb-5 flex items-center gap-2">
                <span className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-md shadow-violet-200">1</span>
                Thiết lập đầu vào
              </h2>
              
              <UploadArea 
                onFileSelect={handleFileSelect} 
                selectedFile={selectedFile} 
                previewUrl={previewUrl}
                onClear={handleClearFile}
              />
              
              {selectedFile && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6 mt-6">
                  {/* Action Buttons - Background Removal */}
                  <button
                    onClick={handleRemoveBackground}
                    disabled={isRemovingBg || isGenerating}
                    className={`w-1/2 mx-auto py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-violet-200
                      ${isRemovingBg || isGenerating
                        ? 'bg-zinc-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-indigo-500 hover:shadow-violet-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]'
                      }`}
                  >
                    {isRemovingBg ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Scissors className="w-4 h-4" />
                        Xoá phông nền
                      </>
                    )}
                  </button>

                  {/* Sliders */}
                  <div className="bg-[#73daf1] p-5 rounded-xl border border-zinc-100">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-violet-500" />
                        Ảnh hưởng từ tham chiếu
                      </label>
                      <span className="text-sm font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-md border border-violet-100">{influence}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={influence}
                      onChange={(e) => setInfluence(parseInt(e.target.value))}
                      disabled={isGenerating}
                      className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-violet-600 hover:accent-violet-500"
                    />
                    <div className="flex justify-between text-xs text-zinc-400 mt-2 font-medium">
                      <span>Sáng tạo (0%)</span>
                      <span>Giữ nguyên (100%)</span>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-violet-500" />
                        Mô tả nhân vật
                      </label>
                      <textarea
                        value={characterDescription}
                        onChange={(e) => setCharacterDescription(e.target.value)}
                        placeholder="Ví dụ: tóc đỏ, mặc áo giáp bạc, mắt xanh..."
                        className="w-full p-3.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all bg-white hover:border-zinc-300"
                        rows={2}
                        disabled={isGenerating}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                        <Clapperboard className="w-4 h-4 text-violet-500" />
                        Bối cảnh & Hành động
                      </label>
                      <textarea
                        value={sceneAction}
                        onChange={(e) => setSceneAction(e.target.value)}
                        placeholder="Ví dụ: đứng trong thư viện cổ, đang đọc sách..."
                        className="w-full p-3.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all bg-white hover:border-zinc-300"
                        rows={2}
                        disabled={isGenerating}
                      />
                    </div>
                  </div>

                  {/* Style & Ratio Grid - Combined */}
                   <div className="grid grid-cols-2 gap-4">
                      {/* Left: Style Selector */}
                      <div>
                        <label className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            Chọn phong cách
                          </label>
                        <StyleSelector 
                            options={STYLES} 
                            selected={selectedStyle} 
                            onSelect={handleStyleSelect} 
                        />
                      </div>

                      {/* Right: Aspect Ratio */}
                      <div>
                        <label className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                            <Crop className="w-4 h-4 text-violet-500" />
                            Tỷ lệ ảnh
                          </label>
                        <select 
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                            disabled={isGenerating}
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none cursor-pointer hover:border-zinc-300 transition-colors text-zinc-700"
                        >
                            <option value="16:9">16:9 (Ngang)</option>
                            <option value="1:1">1:1 (Vuông)</option>
                            <option value="3:4">3:4 (Dọc)</option>
                            <option value="4:3">4:3 (Ngang)</option>
                            <option value="9:16">9:16 (Dọc)</option>
                        </select>
                         <p className="mt-2 text-xs text-zinc-500 leading-relaxed px-1">
                            Chọn kích thước phù hợp.
                        </p>
                      </div>
                   </div>

                  {/* Quality & Count Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-violet-500" />
                        Chất lượng
                      </label>
                      <select 
                        value={outputQuality}
                        onChange={(e) => setOutputQuality(e.target.value as OutputQuality)}
                        disabled={isGenerating}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none hover:border-zinc-300 transition-colors text-zinc-700"
                      >
                        <option value="standard">Standard (720p)</option>
                        <option value="high" disabled>High (2K/4K) - Sắp ra mắt</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-violet-500" />
                        Số lượng ảnh
                      </label>
                       <select 
                        value={imageCount}
                        onChange={(e) => setImageCount(parseInt(e.target.value))}
                        disabled={isGenerating}
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none hover:border-zinc-300 transition-colors text-zinc-700"
                      >
                        <option value={1}>1 ảnh</option>
                        <option value={2}>2 ảnh</option>
                        <option value={3}>3 ảnh</option>
                        <option value={4}>4 ảnh</option>
                      </select>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100 text-sm animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedFile || isGenerating || isRemovingBg}
                    className={`w-1/2 mx-auto py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg transition-all duration-300 shadow-lg shadow-violet-200
                      ${!selectedFile || isGenerating || isRemovingBg
                        ? 'bg-zinc-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-indigo-500 hover:shadow-violet-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]'
                      }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang tạo ảnh ({imageCount})...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Tạo ảnh
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results Grid */}
          <div className="lg:col-span-7 h-full min-h-[500px]">
             <div className="bg-[#73daf1] rounded-2xl p-6 shadow-xl shadow-zinc-200/50 border border-zinc-100/80 h-full flex flex-col">
              <h2 className="text-xl font-bold text-zinc-800 mb-5 flex items-center gap-2">
                <span className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-md shadow-emerald-200">2</span>
                Kết quả tạo ra
              </h2>
              <div className="flex-1">
                <PreviewArea 
                  results={generatedImages} 
                  isLoading={isGenerating} 
                />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;