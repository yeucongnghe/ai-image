import React from 'react';
import { X, Download } from 'lucide-react';
import { Job } from '../types';

interface VideoModalProps {
  job: Job | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ job, onClose }) => {
  if (!job || !job.videoBlobUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <h3 className="text-white font-medium truncate pr-4">{job.params.prompt}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="bg-black flex items-center justify-center" style={{ minHeight: '400px' }}>
            <video 
                src={job.videoBlobUrl} 
                controls 
                autoPlay 
                className="max-h-[70vh] max-w-full"
            />
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end">
             <a
                href={job.videoBlobUrl}
                download={`video-${job.id}.mp4`}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                <Download size={18} />
                Tải xuống
              </a>
        </div>
      </div>
    </div>
  );
};