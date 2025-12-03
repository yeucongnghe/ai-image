import React, { useState } from 'react';
import { SceneData, AspectRatio } from '../types';
import { Copy, RefreshCw, Trash2, Edit2, Save, X, Check } from 'lucide-react';

interface SceneCardProps {
  scene: SceneData;
  masterCharacterEn: string;
  masterCharacterVi: string;
  aspectRatio: AspectRatio;
  onUpdate: (id: string, updates: Partial<SceneData>) => void;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => void;
  isRegenerating: boolean;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  masterCharacterEn,
  masterCharacterVi,
  aspectRatio,
  onUpdate,
  onDelete,
  onRegenerate,
  isRegenerating
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editEn, setEditEn] = useState(scene.sceneSpecificEn);
  const [editVi, setEditVi] = useState(scene.sceneSpecificVi);
  const [editCamera, setEditCamera] = useState(scene.camera);
  const [editLighting, setEditLighting] = useState(scene.lighting);
  const [copiedVi, setCopiedVi] = useState(false);
  const [copiedEn, setCopiedEn] = useState(false);

  // Construct full prompts
  const fullPromptEn = `${masterCharacterEn}\n\n${scene.sceneSpecificEn} Camera: ${scene.camera}, ${scene.lighting}, Aspect Ratio ${aspectRatio}.`;
  const fullPromptVi = `${masterCharacterVi}\n\n${scene.sceneSpecificVi} Camera: ${scene.camera}, ${scene.lighting}, Tỉ lệ ${aspectRatio}.`;

  const handleSave = () => {
    onUpdate(scene.id, {
      sceneSpecificEn: editEn,
      sceneSpecificVi: editVi,
      camera: editCamera,
      lighting: editLighting
    });
    setIsEditing(false);
  };

  const handleCopy = (text: string, isVi: boolean) => {
    navigator.clipboard.writeText(text);
    if (isVi) {
      setCopiedVi(true);
      setTimeout(() => setCopiedVi(false), 2000);
    } else {
      setCopiedEn(true);
      setTimeout(() => setCopiedEn(false), 2000);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-gray-600 transition-all duration-300">
      
      {/* Header */}
      <div className="bg-gray-900/50 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-lg text-white">Cảnh {scene.sceneNumber}</h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-1.5 rounded-md hover:bg-green-900/50 text-green-400 transition-colors" title="Save">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-md hover:bg-red-900/50 text-red-400 transition-colors" title="Cancel">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onRegenerate(scene.id)} 
                className={`p-1.5 rounded-md hover:bg-blue-900/30 text-blue-400 transition-colors ${isRegenerating ? 'animate-spin' : ''}`}
                title="Regenerate this scene"
                disabled={isRegenerating}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 transition-colors" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(scene.id)} className="p-1.5 rounded-md hover:bg-red-900/30 text-red-400 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vietnamese Column */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Tiếng Việt (Ready for VEO)</span>
            {!isEditing && (
              <button 
                onClick={() => handleCopy(fullPromptVi, true)}
                className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
              >
                {copiedVi ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copiedVi ? 'Copied' : 'Copy Full'}
              </button>
            )}
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3 text-sm text-gray-300 min-h-[140px] flex flex-col gap-2 border border-gray-700">
            {/* Master Character Preview (Read Only) */}
            <div className="text-gray-500 text-xs line-clamp-2 border-b border-gray-800 pb-2 mb-1 italic select-none" title={masterCharacterVi}>
               [Master Character]: {masterCharacterVi || "(Trống)"}
            </div>

            {isEditing ? (
              <textarea 
                value={editVi}
                onChange={(e) => setEditVi(e.target.value)}
                className="w-full h-full bg-transparent text-gray-200 focus:outline-none resize-none"
                placeholder="Mô tả hành động cảnh..."
              />
            ) : (
              <div className="flex-1">
                {scene.sceneSpecificVi}
              </div>
            )}
             <div className="mt-auto pt-2 text-xs text-blue-400 font-mono">
                Tech: {isEditing ? editCamera : scene.camera} | {isEditing ? editLighting : scene.lighting} | {aspectRatio}
             </div>
          </div>
        </div>

        {/* English Column */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">English</span>
            {!isEditing && (
              <button 
                onClick={() => handleCopy(fullPromptEn, false)}
                className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"
              >
                {copiedEn ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copiedEn ? 'Copied' : 'Copy Full'}
              </button>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg p-3 text-sm text-gray-300 min-h-[140px] flex flex-col gap-2 border border-gray-700">
             {/* Master Character Preview (Read Only) */}
             <div className="text-gray-500 text-xs line-clamp-2 border-b border-gray-800 pb-2 mb-1 italic select-none" title={masterCharacterEn}>
               [Master Character]: {masterCharacterEn || "(Empty)"}
            </div>

            {isEditing ? (
              <textarea 
                value={editEn}
                onChange={(e) => setEditEn(e.target.value)}
                className="w-full h-full bg-transparent text-gray-200 focus:outline-none resize-none"
                placeholder="Scene action description..."
              />
            ) : (
              <div className="flex-1">
                {scene.sceneSpecificEn}
              </div>
            )}

            {isEditing && (
              <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                  <input 
                    value={editCamera}
                    onChange={(e) => setEditCamera(e.target.value)}
                    placeholder="Camera"
                    className="bg-gray-800 text-xs border border-gray-700 rounded px-1 py-0.5"
                  />
                   <input 
                    value={editLighting}
                    onChange={(e) => setEditLighting(e.target.value)}
                    placeholder="Lighting"
                    className="bg-gray-800 text-xs border border-gray-700 rounded px-1 py-0.5"
                  />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
