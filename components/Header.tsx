import React from 'react';
import { Wand2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-20 flex items-center justify-center">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 p-2.5 md:p-3 rounded-2xl shadow-lg shadow-violet-200 transform hover:rotate-6 transition-transform duration-300">
            <Wand2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight leading-none mb-1 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 via-fuchsia-600 to-indigo-600 drop-shadow-sm">
                App AI Xoá nền - Chỉnh sửa - Tạo phong cách ảnh
              </span>
            </h1>
            <p className="text-xs md:text-sm font-semibold text-zinc-500 flex items-center justify-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              App được xây dựng bởi <span className="text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">Bùi Tuấn Hằng</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};