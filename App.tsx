import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Film, PlayCircle, Loader2, Key, Check } from 'lucide-react';
import { Job, JobParams } from './types';
import { generateVideoJob } from './services/geminiService';
import { JobForm } from './components/JobForm';
import { QueueList } from './components/QueueList';
import { VideoGallery } from './components/VideoGallery';
import { VideoModal } from './components/VideoModal';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewJob, setPreviewJob] = useState<Job | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Concurrency Limit
  const MAX_CONCURRENT_JOBS = 50;

  const checkApiKey = useCallback(async () => {
    try {
      const aiStudio = (window as any).aistudio;
      if (aiStudio && await aiStudio.hasSelectedApiKey()) {
        setHasApiKey(true);
      } else {
        setHasApiKey(false);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
    const interval = setInterval(checkApiKey, 2000);
    return () => clearInterval(interval);
  }, [checkApiKey]);

  const handleAddJob = (params: JobParams) => {
    const newJob: Job = {
      id: crypto.randomUUID(),
      status: 'idle',
      params,
      createdAt: Date.now(),
    };
    setJobs((prev) => [...prev, newJob]);
  };

  const handleRemoveJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleRetryJob = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'pending', error: undefined } : j))
    );
  };

  const handleSubmitQueue = () => {
    // Mark all 'idle' jobs as 'pending' to start the queue logic
    setJobs((prev) =>
      prev.map((j) => (j.status === 'idle' ? { ...j, status: 'pending' } : j))
    );
    setIsProcessing(true);
  };

  const handleSelectApiKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
        checkApiKey();
      } catch (e) {
        console.error("API Key selection failed", e);
      }
    } else {
        alert("Không tìm thấy giao diện AI Studio.");
    }
  };

  const startJobProcessing = async (jobId: string) => {
    // 1. Mark as processing immediately
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'processing', error: undefined } : j))
    );

    // 2. Retrieve job params (from current state scope)
    // Note: In the reactive effect loop, 'jobs' is fresh enough to find the pending job.
    const currentJob = jobs.find(j => j.id === jobId);
    
    // Fallback if not found in closure, though unlikely in this flow
    if (!currentJob) return;

    try {
      const blob = await generateVideoJob(currentJob.params);
      const url = URL.createObjectURL(blob);

      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, status: 'completed', videoBlobUrl: url }
            : j
        )
      );
    } catch (error: any) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, status: 'failed', error: error.message }
            : j
        )
      );
    }
  };

  // Reactive Queue Processing Logic
  // Triggers whenever jobs state changes or processing flag is enabled
  useEffect(() => {
    if (!isProcessing) return;

    const processingCount = jobs.filter((j) => j.status === 'processing').length;
    const pendingJob = jobs.find((j) => j.status === 'pending');

    // Stop if no work left
    if (processingCount === 0 && !pendingJob) {
      setIsProcessing(false);
      return;
    }

    // Start next job if capacity allows
    if (processingCount < MAX_CONCURRENT_JOBS && pendingJob) {
      startJobProcessing(pendingJob.id);
    }
  }, [jobs, isProcessing]);

  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const pendingCount = jobs.filter(j => j.status === 'pending').length;
  const processingCount = jobs.filter(j => j.status === 'processing').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-surface border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Film className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Tạo Video AI Hàng Loạt
            </h2>
          </div>
          
          <button
            onClick={handleSelectApiKey}
            className={`px-4 py-2 rounded-lg font-bold shadow-lg border-t border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-sm
              ${hasApiKey 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-900/20' 
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-orange-900/20'
              }`}
          >
            {hasApiKey ? (
              <>
                <Check size={16} className="text-white" />
                API key đã sẵn sàng
              </>
            ) : (
              <>
                <Key size={16} className="fill-white/20" />
                Lấy API Key
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 space-y-6">
            <JobForm onAddJob={handleAddJob} disabled={false} />
                <button
                  onClick={handleSubmitQueue}
                  disabled={isProcessing && pendingCount > 0}
                  className="group relative w-3/5 mx-auto py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-900/30 border-t border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {isProcessing && pendingCount > 0 ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <PlayCircle size={20} className="fill-white/20" />
                      Tạo danh sách video
                    </>
                  )}
                </button>
          </div>

          {/* Right Column: Queue & Results */}
          <div className="lg:col-span-8 space-y-6">
            <QueueList 
              jobs={jobs} 
              onRemove={handleRemoveJob} 
              onRetry={handleRetryJob} 
              onPlay={setPreviewJob}
            />
            
            <VideoGallery completedJobs={completedJobs} onPlay={setPreviewJob} />
          </div>
        </div>
      </main>

      <VideoModal job={previewJob} onClose={() => setPreviewJob(null)} />
    </div>
  );
}

export default App;