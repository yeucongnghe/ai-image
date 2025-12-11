import React from 'react';
import { Job } from '../types';
import { Download, Play } from 'lucide-react';

interface VideoGalleryProps {
  completedJobs: Job[];
  onPlay: (job: Job) => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ completedJobs, onPlay }) => {
  const handleDownloadAll = () => {
    // Sequential download to avoid browser blocking
    completedJobs.forEach((job, index) => {
      if (job.videoBlobUrl) {
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = job.videoBlobUrl!;
          a.download = `video-ai-${job.id}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, index * 1000); // 1s delay between downloads
      }
    });
  };

  if (completedJobs.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Kết quả ({completedJobs.length})</h2>
        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download size={16} />
          Download All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {completedJobs.map((job, index) => (
          <div key={job.id} className="bg-surface border border-slate-700 rounded-lg overflow-hidden group">
            <div 
              className="relative aspect-video bg-black cursor-pointer"
              onClick={() => onPlay(job)}
            >
              <video 
                src={job.videoBlobUrl} 
                className="w-full h-full object-cover"
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="text-white drop-shadow-lg" size={32} fill="currentColor" />
              </div>
              
              {/* Job Index Badge */}
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                #{index + 1}
              </span>

              {/* Aspect Ratio Badge */}
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                {job.params.aspectRatio}
              </span>
            </div>
            
            <div className="p-3">
              <p className="text-xs text-slate-300 line-clamp-2 mb-2 h-8" title={job.params.prompt}>
                {job.params.prompt}
              </p>
              <a
                href={job.videoBlobUrl}
                download={`video-${job.id}.mp4`}
                className="flex items-center justify-center gap-2 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={12} />
                Tải xuống
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};