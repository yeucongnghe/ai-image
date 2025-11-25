import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Sparkles, Image as ImgIcon, Maximize2, X } from 'lucide-react';
import { GeneratedImageResult } from '../types';

interface PreviewAreaProps {
  results: GeneratedImageResult[];
  isLoading: boolean;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ results, isLoading }) => {
  const [zoomedImage, setZoomedImage] = useState<GeneratedImageResult | null>(null);
  
  const handleDownload = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-style-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full min-h-[400px] rounded-2xl bg-[#73daf1] border-2 border-dashed border-violet-200 flex flex-col items-center justify-center relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-50/50 via-white to-fuchsia-50/50 animate-pulse" />
        <div className="z-10 flex flex-col items-center text-center">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-8 shadow-lg shadow-violet-100"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-violet-500 animate-pulse" />
                </div>
            </div>
          <h3 className="text-2xl font-bold text-violet-950 mb-3">Đang thực hiện phép màu...</h3>
          <p className="text-zinc-600 max-w-sm leading-relaxed">
            AI đang phân tích từng chi tiết, áp dụng phong cách và tối ưu hóa ánh sáng để tạo ra bức ảnh đẹp nhất cho bạn.
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="h-full w-full min-h-[400px] rounded-2xl bg-[#73daf1] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-600 p-8 text-center group">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-zinc-100 group-hover:scale-105 transition-transform duration-300">
          <ImgIcon className="w-10 h-10 text-zinc-300 group-hover:text-violet-300 transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-zinc-700 mb-2">Chưa có kết quả</h3>
        <p className="text-zinc-600 text-sm max-w-xs">
          Hãy tải ảnh lên và nhấn nút "Generate Images" bên trái để xem điều kỳ diệu.
        </p>
      </div>
    );
  }

  // Xác định bố cục lưới dựa trên số lượng ảnh
  const isMulti = results.length > 1;
  
  return (
    <div className="animate-in fade-in duration-700 h-full flex flex-col">
       <div className={`grid gap-4 w-full ${isMulti ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 h-full'}`}>
        {results.map((result) => (
          <div 
            key={result.id} 
            className={`group relative bg-[#73daf1] rounded-xl overflow-hidden shadow-lg border border-zinc-200 flex items-center justify-center
              ${isMulti ? 'aspect-[4/5] min-h-[280px]' : 'min-h-[400px] h-full'}
            `}
          >
            <img 
              src={result.imageUrl} 
              alt={result.style} 
              className="w-full h-full object-contain"
            />
            
            {/* Style Badge */}
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10 z-10 shadow-lg">
              {result.style}
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Bottom Gradient for readability */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                {/* Action Buttons - Bottom Right */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <button 
                        onClick={() => setZoomedImage(result)}
                        className="p-2.5 bg-white/10 hover:bg-white text-white hover:text-zinc-900 backdrop-blur-md rounded-full transition-all duration-200 shadow-lg border border-white/20 group/btn"
                        title="Phóng to"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>

                    <button 
                        onClick={() => handleDownload(result.imageUrl, result.id)}
                        className="p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full transition-all duration-200 shadow-lg shadow-indigo-900/30 border border-white/10"
                        title="Tải ảnh về"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl shrink-0 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-800">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">Hoàn thành! Đã tạo {results.length} ảnh.</span>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
            Sẵn sàng tải xuống
        </span>
      </div>

      {/* Lightbox Modal - Using Portal to escape parent transforms/z-index */}
      {zoomedImage && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          {/* Close Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setZoomedImage(null);
            }}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-[10000]"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="relative max-w-7xl max-h-screen w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={zoomedImage.imageUrl} 
              alt="Full size preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl shadow-black/50"
            />
            <div className="mt-6 flex gap-4">
              <button 
                  onClick={() => handleDownload(zoomedImage.imageUrl, zoomedImage.id)}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-violet-900/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                  <Download className="w-5 h-5" />
                  Tải ảnh gốc
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};