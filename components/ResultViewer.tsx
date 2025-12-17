import React, { useState } from 'react';
import { ZoomIn, Download, X } from 'lucide-react';

interface ResultViewerProps {
  images: string[];
  isLoading: boolean;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ images, isLoading }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleDownload = (base64: string) => {
    if (!base64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="h-[500px] w-full bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Đang khởi tạo phép màu...</p>
        <p className="text-slate-500 text-sm mt-2">Quá trình này có thể mất vài giây</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="h-[500px] w-full bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
           <span className="text-4xl">🖼️</span>
        </div>
        <p>Kết quả sẽ hiển thị tại đây</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${images.length > 1 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
      {images.map((imgBase64, index) => (
        <div key={index} className="relative group w-full h-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
          <img
            src={`data:image/png;base64,${imgBase64}`}
            alt={`AI Generated ${index + 1}`}
            className="w-full h-auto object-contain max-h-[70vh] mx-auto"
          />
          
          {/* Action Buttons */}
          <div className="absolute bottom-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <button
              onClick={() => setZoomedImage(imgBase64)}
              className="bg-slate-900/80 hover:bg-brand-600 text-white p-3 rounded-full backdrop-blur-sm border border-slate-600 hover:border-brand-500 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-brand-500/30"
              title="Zoom Full Resolution"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDownload(imgBase64)}
              className="bg-slate-900/80 hover:bg-green-600 text-white p-3 rounded-full backdrop-blur-sm border border-slate-600 hover:border-green-500 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-green-500/30"
              title="Download Image"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}

      {/* Lightbox / Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={`data:image/png;base64,${zoomedImage}`}
            alt="Full Resolution"
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ResultViewer;