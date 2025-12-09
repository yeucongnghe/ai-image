import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // We'll implement a simple ID generator to avoid external dep
import { VideoRequest, RequestStatus, InputType } from './types';
import { VideoRequestRow } from './components/VideoRequestRow';
import { checkApiKey, openApiKeySelector, generateVideo } from './services/geminiService';
import { Plus, Play, Info, Key, Check } from 'lucide-react';

// Simple UUID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

const MAX_REQUESTS = 50;
const DEFAULT_REQUESTS = 1;
const CONCURRENCY_LIMIT = 2;

const App: React.FC = () => {
  const [requests, setRequests] = useState<VideoRequest[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const processingRef = useRef<Set<string>>(new Set());

  // Initialize Default Requests
  useEffect(() => {
    const initialRequests: VideoRequest[] = Array.from({ length: DEFAULT_REQUESTS }).map(() => ({
      id: generateId(),
      inputType: InputType.TEXT,
      prompt: '',
      image: null,
      aspectRatio: '16:9',
      status: RequestStatus.IDLE
    }));
    setRequests(initialRequests);
    
    const verifyKey = async () => {
        const key = await checkApiKey();
        setHasApiKey(key);
    };
    verifyKey();
  }, []);

  const handleSelectApiKey = async () => {
    await openApiKeySelector();
    // In a real scenario, we might want to poll or wait, but usually a re-render or explicit check is needed.
    // We'll optimistically check after a short delay or assume user will click again if it failed.
    setTimeout(async () => {
        const key = await checkApiKey();
        setHasApiKey(key);
    }, 1000);
  };

  const addRequest = () => {
    if (requests.length >= MAX_REQUESTS) {
        alert(`Chỉ cho phép tối đa ${MAX_REQUESTS} yêu cầu.`);
        return;
    }
    setRequests(prev => [...prev, {
      id: generateId(),
      inputType: InputType.TEXT,
      prompt: '',
      image: null,
      aspectRatio: '16:9',
      status: RequestStatus.IDLE
    }]);
  };

  const updateRequest = (id: string, updates: Partial<VideoRequest>) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, ...updates } : req));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const retryRequest = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: RequestStatus.PENDING, error: undefined } : req));
    // Check queue immediately
    setIsRunning(true);
  };

  const startProcessing = () => {
    // Validate that we have at least one request with data
    const hasValidRequest = requests.some(r => 
        (r.inputType === InputType.TEXT && r.prompt.trim().length > 0) ||
        (r.inputType === InputType.IMAGE && r.image !== null)
    );

    if (!hasValidRequest) {
        alert("Vui lòng nhập mô tả hoặc chọn ảnh cho ít nhất một yêu cầu trước khi bắt đầu.");
        return;
    }

    // Set all IDLE requests to PENDING
    setRequests(prev => prev.map(req => 
        req.status === RequestStatus.IDLE ? { ...req, status: RequestStatus.PENDING } : req
    ));
    setIsRunning(true);
  };

  // Queue Processing Logic
  useEffect(() => {
    if (!isRunning || !hasApiKey) return;

    const processQueue = async () => {
        const activeCount = requests.filter(r => r.status === RequestStatus.GENERATING).length;
        
        if (activeCount >= CONCURRENCY_LIMIT) return;

        // Find next pending request
        const nextRequest = requests.find(r => r.status === RequestStatus.PENDING);
        
        if (!nextRequest) {
            // Check if all are done
            const allDone = requests.every(r => 
                r.status === RequestStatus.COMPLETED || 
                r.status === RequestStatus.FAILED || 
                r.status === RequestStatus.IDLE
            );
            if (allDone) setIsRunning(false);
            return;
        }

        // Avoid double processing the same ID if effect runs twice rapidly
        if (processingRef.current.has(nextRequest.id)) return;

        // Mark as Generating
        processingRef.current.add(nextRequest.id);
        setRequests(prev => prev.map(r => r.id === nextRequest.id ? { ...r, status: RequestStatus.GENERATING } : r));

        try {
            const videoUrl = await generateVideo(nextRequest);
            setRequests(prev => prev.map(r => 
                r.id === nextRequest.id ? { ...r, status: RequestStatus.COMPLETED, videoUrl } : r
            ));
        } catch (error: any) {
            // If API key is missing/invalid, stop the whole queue
            if (error.message.includes("Requested entity was not found")) {
                setIsRunning(false);
                setHasApiKey(false); // Force re-selection
                alert("Phiên Khóa API đã hết hạn hoặc không hợp lệ. Vui lòng chọn lại Khóa API.");
            }

            setRequests(prev => prev.map(r => 
                r.id === nextRequest.id ? { ...r, status: RequestStatus.FAILED, error: error.message } : r
            ));
        } finally {
            processingRef.current.delete(nextRequest.id);
        }
    };

    processQueue();
    // Run this effect whenever requests change (status updates) or isRunning changes
  }, [requests, isRunning, hasApiKey]);


  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-indigo-500/20 shadow-lg">
                    <Play className="text-white fill-current" size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Tạo Video Hàng Loạt Veo</h1>
                    <p className="text-xs text-slate-400">Sử dụng Gemini 2.0</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 {!hasApiKey ? (
                    <button 
                        onClick={handleSelectApiKey}
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-amber-900/20"
                    >
                        <Key size={16} /> Chọn Khóa API
                    </button>
                 ) : (
                    <div className="flex items-center gap-2 text-green-400 bg-green-950/30 px-3 py-1.5 rounded-full border border-green-900/50 text-xs font-medium">
                        <Check size={12} /> Khóa API Sẵn Sàng
                    </div>
                 )}

                <button
                    onClick={startProcessing}
                    disabled={isRunning || !hasApiKey}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-lg
                    ${isRunning 
                        ? 'bg-slate-700 cursor-not-allowed opacity-70' 
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 active:transform active:scale-95'
                    }
                    ${!hasApiKey ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {isRunning ? (
                        <>Đang xử lý...</>
                    ) : (
                        <><Play size={16} fill="currentColor" /> Tạo Video</>
                    )}
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* List */}
        <div className="space-y-2">
            {requests.map((req, index) => (
                <VideoRequestRow
                    key={req.id}
                    index={index}
                    request={req}
                    onUpdate={updateRequest}
                    onDelete={deleteRequest}
                    onRetry={retryRequest}
                />
            ))}
        </div>

        {/* Add Button */}
        <button
            onClick={addRequest}
            disabled={requests.length >= MAX_REQUESTS || isRunning}
            className="w-full mt-4 py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-950/10 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Plus size={20} /> Thêm Yêu Cầu
        </button>

        <div className="mt-4 text-center text-xs text-slate-600">
            {requests.length} / {MAX_REQUESTS} yêu cầu
        </div>

      </main>
    </div>
  );
};

export default App;