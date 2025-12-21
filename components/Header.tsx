import React from 'react';
import { Sparkles, User } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, isLoggedIn }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-700 py-6 px-4 shadow-lg relative">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-4">
        {/* Logo & Title */}
        <div className="flex flex-row items-center justify-center gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-orange-500/20 shadow-lg shrink-0">
             <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-left">
            App AI Tạo – Chỉnh sửa – Xoá phông nền ảnh
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="text-base font-medium text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
          Được xây dựng bởi <span className="text-yellow-400 font-bold text-lg ml-1">Bùi Tuấn Hằng</span>
        </div>
      </div>

      {/* Login Icon in the top right corner */}
      <button 
        onClick={onLoginClick}
        className={`absolute top-6 right-6 p-2 rounded-full transition-all duration-300 ${isLoggedIn ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'}`}
        title={isLoggedIn ? "Đã đăng nhập" : "Đăng nhập"}
      >
        <User className="w-6 h-6" />
      </button>
    </header>
  );
};

export default Header;