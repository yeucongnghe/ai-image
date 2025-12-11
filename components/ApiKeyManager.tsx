import React, { useEffect, useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeyManagerProps {
  onReady: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onReady }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkKey = async () => {
    try {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasKey(true);
        onReady();
      } else {
        setHasKey(false);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setHasKey(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
    // Periodically check in case they selected it in another tab or it refreshed
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            // Assume success immediately to reduce friction, the interval will verify
            setHasKey(true);
            onReady();
        } catch (e) {
            console.error("Selection failed", e);
        }
    }
  };

  if (checking) return <div className="text-sm text-slate-400">Đang kiểm tra API key...</div>;

  if (hasKey) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-800">
        <Key size={12} />
        <span>API Key đã sẵn sàng</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg max-w-md mx-auto my-4">
      <div className="text-center">
        <h3 className="font-semibold text-white mb-2">Yêu cầu quyền truy cập</h3>
        <p className="text-sm text-slate-300 mb-4">
          Ứng dụng này sử dụng mô hình <strong>Veo</strong>. Bạn cần chọn một dự án Google Cloud có tính phí (Billing Enabled) để tiếp tục.
        </p>
      </div>
      
      <button
        onClick={handleSelectKey}
        className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors"
      >
        <Key size={16} />
        Chọn API Key
      </button>

      <div className="text-xs text-center text-slate-500 mt-2">
         <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center gap-1 hover:text-blue-400 transition-colors"
         >
            Xem thông tin về thanh toán <ExternalLink size={10} />
         </a>
      </div>
    </div>
  );
};