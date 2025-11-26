import React from 'react';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-700 py-6 px-4 shadow-lg">
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
        
        {/* Subtitle moved below title */}
        <div className="text-base font-medium text-slate-300 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
          Được xây dựng bởi <span className="text-yellow-400 font-bold text-lg ml-1">Bùi Tuấn Hằng</span>
        </div>
      </div>
    </header>
  );
};

export default Header;