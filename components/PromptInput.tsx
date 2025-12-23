import React from 'react';
import { Wand2 } from 'lucide-react';

interface PromptInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({ label, value, onChange, suggestions, placeholder }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-brand-500" />
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all duration-300 focus:shadow-lg focus:shadow-brand-500/10 h-24 resize-none"
        placeholder={placeholder}
      />
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(suggestion)}
              className="text-xs bg-slate-700/50 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 px-3 py-1.5 rounded-full transition-all duration-300 border border-slate-600 hover:border-brand-500/50 hover:shadow-md hover:-translate-y-0.5"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptInput;