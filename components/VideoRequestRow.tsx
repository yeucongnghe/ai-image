import React from 'react';
import { VideoRequest, InputType, RequestStatus, ASPECT_RATIOS } from '../types';
import { Trash2, RefreshCw, Download, AlertCircle, CheckCircle, Clock, Video, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Props {
  request: VideoRequest;
  index: number;
  onUpdate: (id: string, updates: Partial<VideoRequest>) => void;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
}

export const VideoRequestRow: React.FC<Props> = ({ request, index, onUpdate, onDelete, onRetry }) => {
  const isLocked = request.status === RequestStatus.GENERATING || request.status === RequestStatus.PENDING;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpdate(request.id, { image: e.target.files[0] });
    }
  };

  return (
    <div className={`p-4 rounded-xl border mb-3 transition-colors ${
      request.status === RequestStatus.COMPLETED ? 'bg-green-950/20 border-green-800/50' :
      request.status === RequestStatus.FAILED ? 'bg-red-950/20 border-red-800/50' :
      isLocked ? 'bg-indigo-950/20 border-indigo-800/50' :
      'bg-slate-800/50 border-slate-700'
    }`}>
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        
        {/* Row Number */}
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full text-slate-300 font-bold text-sm">
          {index + 1}
        </div>

        {/* Input Type Selection */}
        <div className="flex-shrink-0 flex flex-col gap-2 min-w-[120px]">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id={`text-${request.id}`}
              name={`type-${request.id}`}
              checked={request.inputType === InputType.TEXT}
              onChange={() => onUpdate(request.id, { inputType: InputType.TEXT, image: null })}
              disabled={isLocked}
              className="accent-indigo-500 cursor-pointer"
            />
            <label htmlFor={`text-${request.id}`} className="text-sm cursor-pointer flex items-center gap-1 text-slate-300">
              <Video size={14} /> Văn bản
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id={`image-${request.id}`}
              name={`type-${request.id}`}
              checked={request.inputType === InputType.IMAGE}
              onChange={() => onUpdate(request.id, { inputType: InputType.IMAGE })}
              disabled={isLocked}
              className="accent-indigo-500 cursor-pointer"
            />
            <label htmlFor={`image-${request.id}`} className="text-sm cursor-pointer flex items-center gap-1 text-slate-300">
              <ImageIcon size={14} /> Hình ảnh
            </label>
          </div>
        </div>

        {/* Content Inputs */}
        <div className="flex-grow w-full space-y-2">
            {request.inputType === InputType.TEXT ? (
                <textarea
                    placeholder="Mô tả video bạn muốn tạo..."
                    value={request.prompt}
                    onChange={(e) => onUpdate(request.id, { prompt: e.target.value })}
                    disabled={isLocked}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-20"
                />
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <label className={`
                            flex-shrink-0
                            py-2 px-4 rounded-full
                            text-sm font-semibold
                            bg-indigo-600 text-white
                            hover:bg-indigo-700
                            cursor-pointer
                            transition-colors
                            ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                        `}>
                            Chọn File
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isLocked}
                                className="hidden"
                            />
                        </label>
                        <span className="text-sm text-slate-400 truncate">
                            {request.image ? request.image.name : 'Chưa chọn file'}
                        </span>
                    </div>

                    {request.image && (
                        <div className="text-xs text-indigo-400 flex items-center gap-1">
                           <CheckCircle size={10} /> Đã chọn ảnh: {request.image.name}
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="Mô tả tùy chọn để hướng dẫn chuyển động của ảnh..."
                        value={request.prompt}
                        onChange={(e) => onUpdate(request.id, { prompt: e.target.value })}
                        disabled={isLocked}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                </div>
            )}
        </div>

        {/* Settings */}
        <div className="flex-shrink-0 min-w-[100px]">
            <label className="block text-xs text-slate-400 mb-1">Tỉ lệ khung hình</label>
            <select
                value={request.aspectRatio}
                onChange={(e) => onUpdate(request.id, { aspectRatio: e.target.value as any })}
                disabled={isLocked}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
                {ASPECT_RATIOS.map(ratio => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                ))}
            </select>
        </div>

        {/* Status & Actions */}
        <div className="flex-shrink-0 w-full md:w-[180px] flex flex-col gap-2">
            {/* Status Display */}
            <div className="h-8 flex items-center justify-end">
                {request.status === RequestStatus.IDLE && (
                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1"><Clock size={14}/> Sẵn sàng</span>
                )}
                {request.status === RequestStatus.PENDING && (
                    <span className="text-amber-500 text-xs font-medium flex items-center gap-1"><Clock size={14}/> Trong hàng đợi</span>
                )}
                {request.status === RequestStatus.GENERATING && (
                    <span className="text-indigo-400 text-xs font-medium flex items-center gap-1 animate-pulse"><Loader2 size={14} className="animate-spin"/> Đang tạo...</span>
                )}
                {request.status === RequestStatus.COMPLETED && (
                    <span className="text-green-400 text-xs font-medium flex items-center gap-1"><CheckCircle size={14}/> Hoàn tất</span>
                )}
                {request.status === RequestStatus.FAILED && (
                    <span className="text-red-400 text-xs font-medium flex items-center gap-1" title={request.error}><AlertCircle size={14}/> Thất bại</span>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
                {request.status === RequestStatus.COMPLETED && request.videoUrl && (
                    <a
                        href={request.videoUrl}
                        download={`veo-video-${request.id}.mp4`}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                    >
                        <Download size={14} /> Tải xuống
                    </a>
                )}

                {request.status === RequestStatus.FAILED && (
                    <button
                        onClick={() => onRetry(request.id)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                    >
                        <RefreshCw size={14} /> Thử lại
                    </button>
                )}

                {!isLocked && (
                    <button
                        onClick={() => onDelete(request.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Xóa yêu cầu"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
      </div>
      
      {/* Error Message Display */}
      {request.status === RequestStatus.FAILED && request.error && (
        <div className="mt-2 text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-900/50">
            Lỗi: {request.error}
        </div>
      )}
    </div>
  );
};
