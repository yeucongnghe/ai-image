import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  onClear: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, selectedFile, previewUrl, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const validateAndSelectFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validTypes.includes(file.type)) {
      onFileSelect(file);
    } else {
      alert('Vui lòng chỉ tải lên định dạng JPG hoặc PNG.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (selectedFile && previewUrl) {
    return (
      <div className="relative group overflow-hidden rounded-xl border border-zinc-200 bg-[#73daf1] h-40 flex items-center justify-center shadow-inner">
         <button 
            onClick={(e) => {
                e.stopPropagation();
                onClear();
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-50 text-zinc-500 hover:text-red-500 rounded-full shadow-sm border border-zinc-200 transition-colors z-20"
            title="Xóa ảnh"
          >
            <X className="w-4 h-4" />
          </button>

        <img 
          src={previewUrl} 
          alt="Original upload" 
          className="w-full h-full object-contain p-2"
        />
      </div>
    );
  }

  return (
    <div
      onClick={triggerFileInput}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-violet-500 bg-violet-50 scale-[1.01] shadow-md' 
          : 'border-zinc-300 bg-zinc-50/50 hover:bg-violet-50/30 hover:border-violet-300 hover:shadow-sm'
        }
      `}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        accept="image/png, image/jpeg, image/webp" 
        onChange={handleFileInput}
      />
      
      <div className={`p-3 rounded-full shadow-sm mb-3 transition-colors ${isDragging ? 'bg-violet-100 text-violet-600' : 'bg-white text-zinc-400 group-hover:text-violet-500'}`}>
        <UploadCloud className={`w-6 h-6`} />
      </div>
      
      <p className="text-zinc-700 font-bold mb-1 text-sm">Tải ảnh hoặc kéo thả</p>
      <p className="text-zinc-400 text-xs">JPG, PNG (Max 5MB)</p>
    </div>
  );
};