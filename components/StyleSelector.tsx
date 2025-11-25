import React from 'react';
import { StyleOption } from '../types';
import { ChevronDown } from 'lucide-react';

interface StyleSelectorProps {
  options: StyleOption[];
  selected: StyleOption;
  onSelect: (style: StyleOption) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ options, selected, onSelect }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const style = options.find(opt => opt.id === selectedId);
    if (style) {
      onSelect(style);
    }
  };

  return (
    <div>
      <div className="relative">
        <select
          value={selected.id}
          onChange={handleChange}
          className="w-full appearance-none p-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-zinc-800 pr-10 cursor-pointer shadow-sm hover:border-zinc-300 transition-colors"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-500 leading-relaxed px-1">
        {selected.description}
      </p>
    </div>
  );
};