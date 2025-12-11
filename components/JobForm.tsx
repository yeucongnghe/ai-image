import React, { useState, useRef } from 'react';
import { Plus, Image as ImageIcon, FileText, Upload, X } from 'lucide-react';
import { JobParams, InputType, AspectRatio, VideoModel } from '../types';

interface JobFormProps {
  onAddJob: (job: JobParams) => void;
  disabled: boolean;
}

export const JobForm: React.FC<JobFormProps> = ({ onAddJob, disabled }) => {
  const [prompt, setPrompt] = useState('');
  const [inputType, setInputType] = useState<InputType>('text');
  const [model, setModel] = useState<VideoModel>('veo-3.1-fast-generate-preview');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      const mimeType = result.split(';')[0].split(':')[1];
      
      setSelectedImage({
        base64: base64Data,
        mimeType: mimeType,
        preview: result
      });
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (inputType === 'image' && !selectedImage) return;

    onAddJob({
      prompt,
      inputType,
      model,
      aspectRatio,
      imageBase64: selectedImage?.base64,
      imageMimeType: selectedImage?.mimeType
    });

    // Reset simple fields, keep model/ratio settings as they might be repetitive
    setPrompt('');
    clearImage();
  };

  return (
    <div className="bg-surface p-2 rounded-xl border border-slate-700 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
        <Plus size={20} className="text-primary" />
        Thêm Job Mới
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Model & Aspect Ratio Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xm font-medium text-slate-400 mb-1">Mô hình tạo Video</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as VideoModel)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={disabled}
            >
              <option value="veo-2.0-generate-001">Veo 2.0 (Không âm thanh)</option>
              <option value="veo-3.1-generate-preview">Veo 3.1 - Fast (Có âm thanh)</option>
            </select>
          </div>
          <div>
            <label className="block text-xm font-medium text-slate-400 mb-1">Tỉ lệ khung hình</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={disabled}
            >
              <option value="16:9">16:9 (Ngang)</option>
              <option value="9:16">9:16 (Dọc)</option>
            </select>
          </div>
        </div>

        {/* Input Type */}
        <div>
          <label className="block text-xm font-medium text-slate-400 mb-1">Chọn kiểu tạo Video</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setInputType('text')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                inputType === 'text' 
                  ? 'bg-primary/20 border-primary text-primary' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText size={16} /> Từ Văn Bản
            </button>
            <button
              type="button"
              onClick={() => setInputType('image')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                inputType === 'image' 
                  ? 'bg-primary/20 border-primary text-primary' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ImageIcon size={16} /> Từ hình ảnh
            </button>
          </div>
        </div>

        {/* Image Upload Area */}
        {inputType === 'image' && (
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            
            {!selectedImage ? (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-900 hover:border-primary transition-all"
              >
                <Upload size={24} className="text-slate-400 mb-2" />
                <p className="text-sm text-slate-400">Nhấn để tải ảnh lên</p>
              </label>
            ) : (
              <div className="relative w-full h-48 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                <img src={selectedImage.preview} alt="Preview" className="h-full object-contain" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <label className="block text-xm font-medium text-slate-400 mb-1">Mô tả lệnh tạo Video {inputType === 'image' && '(Tùy chọn)'}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={inputType === 'image' ? "Mô tả chuyển động cho hình ảnh..." : "Mô tả diện mạo, trang phục, hình dáng, hành động, bối cảnh ..."}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary focus:outline-none min-h-[80px]"
            disabled={disabled}
            required={inputType === 'text'}
          />
        </div>

        {/* Add Button */}
        <button
          type="submit"
          disabled={disabled || (inputType === 'image' && !selectedImage) || (inputType === 'text' && !prompt.trim())}
          className="w-full py-2.5 bg-primary hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Thêm vào hàng đợi
        </button>
      </form>
    </div>
  );
};