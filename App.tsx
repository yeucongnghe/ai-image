"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Settings2, Eraser, Image as ImageIcon, Users, X, Download } from 'lucide-react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import ResultViewer from './components/ResultViewer';
import { AppSettings, SUGGESTIONS, AspectRatio } from './types';
import { fileToGenerativePart, generateImageAI, removeBackgroundAI } from './services/geminiService';

const STYLES = [
  { value: 'Vintage', label: 'Cổ điển (Vintage)' },
  { value: 'Business', label: 'Doanh nhân (Business)' },
  { value: 'Evening Wear', label: 'Dạ hội (Evening Wear)' },
  { value: 'Smart Casual', label: 'Đời thường (Smart Casual)' },
  { value: 'Cyberpunk', label: 'Cyberpunk' },
  { value: 'Sketch', label: 'Phác hoạ (Sketch)' },
];

const App: React.FC = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Custom Context Menu State for Password Field
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  // App State
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refImage2, setRefImage2] = useState<string | null>(null);
  const [hasRemovedBg, setHasRemovedBg] = useState(false); // Track if BG was removed for main image
  const [hasRemovedBg2, setHasRemovedBg2] = useState(false); // Track if BG was removed for secondary image
  const [settings, setSettings] = useState<AppSettings>({
    charPrompt: '',
    contextPrompt: '',
    accuracy: 100,
    aspectRatio: '16:9',
    resolution: 'standard',
    style: 'Smart Casual',
    numberOfImages: 1,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isRemovingBg2, setIsRemovingBg2] = useState(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  // Login Handler
  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setLoginError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsAuthenticating(true);
    setLoginError('');

    try {
      /**
       * Note: To connect to Vercel Database, we would typically call a serverless function.
       * Assuming an endpoint like /api/auth exists that queries the 'users' table.
       */
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      if (response.status === 200) {
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
      } else {
        setLoginError("Tên hoặc mật khẩu không đúng");
      }
    } catch (error) {
      // Fallback/Demo verification for local testing
      if (loginForm.username === 'admin' && loginForm.password === '123456') {
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
      } else {
        setLoginError("Tên hoặc mật khẩu không đúng");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoggedIn) return;
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToGenerativePart(e.target.files[0]);
        setRefImage(base64);
      } catch (error) {
        alert("Lỗi tải ảnh: " + error);
      }
    }
  };

  const handleFileChange2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoggedIn) return;
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToGenerativePart(e.target.files[0]);
        setRefImage2(base64);
      } catch (error) {
        alert("Lỗi tải ảnh phụ: " + error);
      }
    }
  };

  const handleRemoveBackground = async () => {
    if (!refImage || !isLoggedIn) return;
    setIsRemovingBg(true);
    try {
      const newImage = await removeBackgroundAI(refImage);
      setRefImage(newImage);
      setHasRemovedBg(true); // Mark as background removed
    } catch (error) {
      alert("Lỗi xoá phông: " + (error as any).message);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleRemoveBackground2 = async () => {
    if (!refImage2 || !isLoggedIn) return;
    setIsRemovingBg2(true);
    try {
      const newImage = await removeBackgroundAI(refImage2);
      setRefImage2(newImage);
      setHasRemovedBg2(true); // Mark as background removed for secondary
    } catch (error) {
      alert("Lỗi xoá phông ảnh phụ: " + (error as any).message);
    } finally {
      setIsRemovingBg2(false);
    }
  };

  const handleDownloadRef = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async () => {
    if (!isLoggedIn || isProcessing) return;

    setIsProcessing(true);
    const toBase64 = (file: File | Blob) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
    try {
      // Kiểm tra và chỉ convert nếu biến là File/Blob hợp lệ
      const processImage = async (img: any) => {
        if (img instanceof File || img instanceof Blob) {
          return await toBase64(img);
        }
        return img; // Nếu đã là base64 hoặc string thì giữ nguyên
      };

      const payload = {
        image1: refImage ? await processImage(refImage) : null,
        image2: refImage2 ? await processImage(refImage2) : null,
        //prompt: settings.charPrompt,
        settings: {
          charPrompt: settings.charPrompt,
          contextPrompt: settings.contextPrompt,
          accuracy: settings.accuracy,
          aspectRatio: settings.aspectRatio,
          resolution: settings.resolution,
          style: settings.style,
          numberOfImages: settings.numberOfImages
        } 
      };

      // Tiếp tục gọi API...
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // ... logic xử lý kết quả
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        // Gán mảng mã thô vào State
        setResultImages(data.images);
      } else {
        alert("Lỗi: " + (data.error || "Không có ảnh trả về"));
      }
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Custom Context Menu Handlers
  const handlePasswordContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handlePasteAction = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLoginForm(prev => ({ ...prev, password: prev.password + text }));
    } catch (err) {
      console.error('Failed to read clipboard', err);
      alert("Vui lòng cho phép ứng dụng truy cập clipboard để thực hiện chức năng này.");
    }
    setContextMenu(null);
  };

  const getAccuracyLabel = (val: number) => {
    if (val >= 80) return "Như ảnh gốc (100%)";
    if (val >= 40) return "Thay đổi nhẹ (40-70%)";
    return "Sáng tạo tự do (0-30%)";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative overflow-x-hidden">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} isLoggedIn={isLoggedIn} />

      {/* Main Content */}
      {/* Requirement: Contents are clearly visible but non-interactive if not logged in */}
      <main className={`flex-grow container mx-auto px-4 py-8 max-w-7xl transition-all duration-500 ${!isLoggedIn ? 'pointer-events-none opacity-100' : ''}`}>
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN */}
          <div className="w-full lg:w-[40%] flex-none space-y-8">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="text-brand-500" />
                Ảnh Tham Chiếu
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400 pl-1">Nhân vật chính</label>
                  <div className={`relative w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden group ${refImage ? 'border-brand-500 bg-slate-900' : 'border-slate-700 hover:border-brand-400 hover:bg-slate-800 hover:shadow-lg hover:shadow-brand-500/10'}`} onClick={() => fileInputRef.current?.click()}>
                    {refImage ? (
                      <>
                        <img src={`data:image/png;base64,${refImage}`} alt="Ref" className="w-full h-full object-contain" />
                        <button onClick={(e) => { e.stopPropagation(); setRefImage(null); }} 
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/60 hover:bg-red-500 text-white/80 hover:text-white rounded-full transition-all duration-200 border border-white/10 shadow-sm z-10">
                        <X className="w-4 h-4" />
                        </button>

                        {/* Download button only after BG removal */}
                        {hasRemovedBg && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownloadRef(refImage, 'no-bg-character.png'); }}
                            className="absolute bottom-2 right-2 p-1.5 bg-brand-600/80 hover:bg-brand-500 text-white rounded-full transition-all duration-200 border border-white/10 shadow-sm z-10"
                            title="Tải ảnh đã xoá phông"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-2 transform group-hover:scale-105 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-1 group-hover:text-brand-400 transition-colors" />
                        <p className="text-slate-400 text-xs font-medium">Tải ảnh chính</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  {refImage && (
                    <div className="flex mt-2">
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveBackground(); }} disabled={isRemovingBg} className="w-full py-2 px-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-none">
                         {isRemovingBg ? <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span> : <Eraser className="w-3 h-3" />}
                         Xoá phông nền
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400 pl-1">Nhân vật phụ (Tuỳ chọn)</label>
                  <div className={`relative w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden group ${refImage2 ? 'border-brand-500 bg-slate-900' : 'border-slate-700 hover:border-brand-400 hover:bg-slate-800 hover:shadow-lg hover:shadow-brand-500/10'}`} onClick={() => fileInputRef2.current?.click()}>
                    {refImage2 ? (
                      <>
                        <img src={`data:image/png;base64,${refImage2}`} alt="Ref2" className="w-full h-full object-contain" />
                        <button onClick={(e) => { e.stopPropagation(); setRefImage2(null); }} className="absolute top-2 right-2 p-1.5 bg-slate-900/60 hover:bg-red-500 text-white/80 hover:text-white rounded-full transition-all duration-200 border border-white/10 shadow-sm z-10">
                        <X className="w-4 h-4" />
                        </button>

                        {/* Download button for secondary after BG removal */}
                        {hasRemovedBg2 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownloadRef(refImage2, 'no-bg-secondary.png'); }}
                            className="absolute bottom-2 right-2 p-1.5 bg-brand-600/80 hover:bg-brand-500 text-white rounded-full transition-all duration-200 border border-white/10 shadow-sm z-10"
                            title="Tải ảnh phụ đã xoá phông"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-2 transform group-hover:scale-105 transition-transform duration-300">
                        <Users className="w-8 h-8 text-slate-500 mx-auto mb-1 group-hover:text-brand-400 transition-colors" />
                        <p className="text-slate-400 text-xs font-medium">Tải ảnh phụ</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef2} className="hidden" accept="image/*" onChange={handleFileChange2} />
                  </div>
                  {refImage2 && (
                    <div className="flex mt-2">
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveBackground2(); }} disabled={isRemovingBg2} className="w-full py-2 px-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-none">
                         {isRemovingBg2 ? <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span> : <Eraser className="w-3 h-3" />}
                         Xoá phông nền
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings2 className="text-brand-500" />
                Thông số tạo ảnh
              </h2>
              <PromptInput label="Mô tả nhân vật & trang phục" placeholder="Ví dụ: Một cô gái mặc áo dài đỏ..." value={settings.charPrompt} onChange={(val) => setSettings(s => ({...s, charPrompt: val}))} suggestions={SUGGESTIONS.character} />
              <PromptInput label="Bối cảnh & Hành động" placeholder="Ví dụ: Đứng dưới mưa, ánh đèn neon..." value={settings.contextPrompt} onChange={(val) => setSettings(s => ({...s, contextPrompt: val}))} suggestions={SUGGESTIONS.context} />
              
              <div className="space-y-5 pt-4 border-t border-slate-800">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-300">Độ chính xác khuôn mặt, hình dáng với ảnh gốc</label>
                    <span className="text-xs font-mono text-brand-400 bg-brand-900/30 px-2 py-0.5 rounded">{settings.accuracy}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={settings.accuracy} onChange={(e) => setSettings(s => ({...s, accuracy: Number(e.target.value)}))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                  <p className="text-xs text-slate-500 mt-1 text-right italic">{getAccuracyLabel(settings.accuracy)}</p>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="w-[48%]">
                    <label className="block text-sm font-semibold text-slate-300 mb-2 truncate">Chọn phong cách</label>
                    <select value={settings.style} onChange={(e) => setSettings(s => ({...s, style: e.target.value}))} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none text-sm transition-shadow focus:ring-2 focus:ring-brand-500">
                      {STYLES.map((style) => (<option key={style.value} value={style.value}>{style.label}</option>))}
                    </select>
                  </div>
                  <div className="w-[48%]">
                    <label className="block text-sm font-semibold text-slate-300 mb-2 truncate">Chọn số ảnh tạo</label>
                    <select value={settings.numberOfImages} onChange={(e) => setSettings(s => ({...s, numberOfImages: Number(e.target.value)}))} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none text-sm transition-shadow focus:ring-2 focus:ring-brand-500">
                      <option value={1}>1 Ảnh</option><option value={2}>2 Ảnh</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="w-[48%]">
                    <label className="block text-sm font-semibold text-slate-300 mb-2 truncate">Tỉ lệ khung hình</label>
                    <select value={settings.aspectRatio} onChange={(e) => setSettings(s => ({...s, aspectRatio: e.target.value as AspectRatio}))} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none text-sm transition-shadow focus:ring-2 focus:ring-brand-500">
                      <option value="16:9">16:9</option><option value="1:1">1:1</option><option value="9:16">9:16</option><option value="3:4">3:4</option><option value="4:3">4:3</option>
                    </select>
                  </div>
                  <div className="w-[48%]">
                    <label className="block text-sm font-semibold text-slate-300 mb-2 truncate">Chất lượng hình ảnh</label>
                    <select value={settings.resolution} onChange={(e) => setSettings(s => ({...s, resolution: e.target.value as any}))} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 outline-none text-sm transition-shadow focus:ring-2 focus:ring-brand-500">
                      <option value="standard">Tiêu chuẩn</option><option value="hd">Full HD</option><option value="uhd">2K/4K</option>
                    </select>
                  </div>
                </div>
              </ div>

              <button onClick={handleGenerate} disabled={isProcessing || isRemovingBg || isRemovingBg2} className="w-full landscape:w-[35%] lg:w-[87.5%] lg:landscape:w-[87.5%] block mx-auto py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-xl shadow-fuchsia-500/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 bg-[length:200%_auto] hover:bg-right">
                {isProcessing ? 'Đang xử lý...' : 'Tạo hình ảnh ✨'}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1">
            <ResultViewer images={resultImages} isLoading={isProcessing} />
          </div>
        </div>
      </main>

      {/* LOGIN DIALOG (MODAL) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop - Transparent layer that blocks clicks but shows background clearly */}
          <div className="absolute inset-0 bg-transparent"></div>
          
          {/* Modal Container */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 ring-1 ring-white/10">
            <div className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-white text-center mb-4">Hệ Thống Đăng Nhập</h2>
              
              {/* Username Input */}
              <div className="flex items-center gap-4">
                <span className="text-slate-300 font-semibold w-32 whitespace-nowrap">User name :</span>
                <input 
                  type="text" 
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  placeholder="Tên tài khoản..."
                  //autoFocus
                />
              </div>

              {/* Password Input - Allowing typing + Custom context menu only for Paste */}
              <div className="flex items-center gap-4">
                <span className="text-slate-300 font-semibold w-32 whitespace-nowrap">Nhập password</span>
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  onContextMenu={handlePasswordContextMenu}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  placeholder="Nhập hoặc click chuột phải để dán..."
                />
              </div>

              {/* Divider - Made clearer and more visible */}
              <hr className="border-slate-500 border-t" />

              {loginError && (
                <p className="text-red-500 text-sm text-center font-medium animate-shake">{loginError}</p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-row gap-4">
                <button 
                  onClick={handleLogin}
                  disabled={isAuthenticating}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isAuthenticating ? <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></span> : "Đăng nhập"}
                </button>
                <button 
                  onClick={() => setIsLoginModalOpen(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                  Thoát
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONTEXT MENU FOR PASSWORD FIELD */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[109]" onClick={() => setContextMenu(null)} />
          <div 
            className="fixed z-[110] bg-slate-800 border border-slate-700 rounded shadow-2xl py-1 min-w-[120px] animate-in fade-in zoom-in duration-150"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button 
              onClick={handlePasteAction}
              className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-brand-500 transition-colors flex items-center gap-2"
            >
              Dán (Paste)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;