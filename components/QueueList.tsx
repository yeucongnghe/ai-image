import React from 'react';
import { Job, JobStatus } from '../types';
import { Trash2, RotateCcw, CheckCircle, AlertCircle, Clock, Loader2, Play } from 'lucide-react';

interface QueueListProps {
  jobs: Job[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onPlay: (job: Job) => void;
}

const StatusIcon = ({ status }: { status: JobStatus }) => {
  switch (status) {
    case 'idle': return <div className="w-5 h-5 rounded-full border-2 border-slate-500" />;
    case 'pending': return <Clock className="text-accent" size={20} />;
    case 'processing': return <Loader2 className="text-primary animate-spin" size={20} />;
    case 'completed': return <CheckCircle className="text-green-500" size={20} />;
    case 'failed': return <AlertCircle className="text-red-500" size={20} />;
  }
};

const StatusText = ({ status }: { status: JobStatus }) => {
  switch (status) {
    case 'idle': return <span className="text-slate-500">Chờ</span>;
    case 'pending': return <span className="text-accent">Đang đợi</span>;
    case 'processing': return <span className="text-primary">Đang tạo...</span>;
    case 'completed': return <span className="text-green-500">Hoàn tất</span>;
    case 'failed': return <span className="text-red-500">Lỗi</span>;
  }
};

export const QueueList: React.FC<QueueListProps> = ({ jobs, onRemove, onRetry, onPlay }) => {
  if (jobs.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-slate-700 p-8 text-center">
        <p className="text-slate-500">Hàng đợi đang trống. Hãy thêm job mới.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/30">
        <h3 className="font-semibold text-white">Danh sách hàng đợi Video ({jobs.length})</h3>
        <span className="text-xm text-slate-400">Tối đa 4 job chạy cùng lúc</span>
      </div>
      
      <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
        {jobs.map((job, index) => (
          <div key={job.id} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <span className="text-slate-500 font-mono text-xs w-6">#{index + 1}</span>
              
              <div className="relative w-12 h-12 bg-slate-900 rounded-md border border-slate-700 flex-shrink-0 overflow-hidden">
                {job.params.inputType === 'image' && job.params.imageBase64 ? (
                  <img src={`data:${job.params.imageMimeType};base64,${job.params.imageBase64}`} className="w-full h-full object-cover" alt="Input" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">Text</div>
                )}
                
                {job.status === 'completed' && (
                  <button 
                    onClick={() => onPlay(job)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate pr-4" title={job.params.prompt}>
                  {job.params.prompt || "Không có mô tả"}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <StatusIcon status={job.status} />
                    <StatusText status={job.status} />
                  </div>
                  <span className="text-xs text-slate-500 border-l border-slate-700 pl-3">
                    {job.params.model.includes('fast') ? 'Fast' : 'HQ'} • {job.params.aspectRatio}
                  </span>
                  {job.error && (
                    <span className="text-xs text-red-400 truncate max-w-[200px]" title={job.error}>
                      — {job.error}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(job.status === 'failed' || job.status === 'completed') && (
                <button
                  onClick={() => onRetry(job.id)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title={job.status === 'failed' ? "Thử lại" : "Tạo lại"}
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                onClick={() => onRemove(job.id)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Xóa"
                disabled={job.status === 'processing'}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};