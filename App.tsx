import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SceneCard from './components/SceneCard';
import { GlobalSettings, AspectRatio, SceneData } from './types';
import { generateSceneBreakdown, regenerateSingleScene } from './services/geminiService';
import { Layers, Plus, Download, Clapperboard } from 'lucide-react';

const DEFAULT_CHARACTER_EN = `Captain Nemo, a mysterious and commanding figure in his late forties, with broad shoulders, wearing a dark blue officer’s uniform adorned with brass buttons and golden embroidery.
Sophia, a young marine scientist in her late twenties, with curly chestnut hair tied in a loose bun, green eyes full of curiosity. She wears a waterproof light jacket.`;

const DEFAULT_CHARACTER_VI = `Thuyền trưởng Nemo, người đàn ông bí ẩn quyền uy khoảng gần 50 tuổi, bờ vai rộng, khoác quân phục xanh đậm với cúc nút đồng và thêu hình sinh vật biển vàng.
Sophia, nhà khoa học biển trẻ khoảng cuối 20 tuổi, tóc nâu hạt dẻ xoăn búi thấp, đôi mắt xanh lá tò mò. Cô mặc áo khoác chống nước sáng màu.`;

const App: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings>({
    context: '',
    characterDescEn: DEFAULT_CHARACTER_EN,
    characterDescVi: DEFAULT_CHARACTER_VI,
    videoIdea: '',
    genre: 'Cinematic',
    aspectRatio: AspectRatio.RATIO_16_9,
    sceneCount: 5
  });

  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set());

  // Main Generation Handler
  const handleGenerateScenes = async () => {
    if (!process.env.API_KEY) {
      alert("Missing API_KEY in environment variables.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateSceneBreakdown(settings);
      
      const newScenes: SceneData[] = response.scenes.map((s) => ({
        id: Math.random().toString(36).substr(2, 9),
        sceneNumber: s.sceneNumber,
        sceneSpecificEn: s.actionEn,
        sceneSpecificVi: s.actionVi,
        camera: s.camera,
        lighting: s.lighting
      }));

      setScenes(newScenes);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo cảnh. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateScene = (id: string, updates: Partial<SceneData>) => {
    setScenes(prev => prev.map(scene => scene.id === id ? { ...scene, ...updates } : scene));
  };

  const handleDeleteScene = (id: string) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa cảnh này?");
    if (confirm) {
      setScenes(prev => {
        const filtered = prev.filter(s => s.id !== id);
        // Renumber scenes
        return filtered.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
      });
    }
  };

  const handleRegenerateSingle = async (id: string) => {
    const sceneToRegen = scenes.find(s => s.id === id);
    if (!sceneToRegen) return;

    setRegeneratingIds(prev => new Set(prev).add(id));
    
    try {
      const result = await regenerateSingleScene(sceneToRegen.sceneNumber, settings, sceneToRegen.sceneSpecificVi);
      
      handleUpdateScene(id, {
        sceneSpecificEn: result.actionEn,
        sceneSpecificVi: result.actionVi,
        camera: result.camera,
        lighting: result.lighting
      });
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo lại cảnh này.");
    } finally {
      setRegeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAddScene = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newScene: SceneData = {
      id: newId,
      sceneNumber: scenes.length + 1,
      sceneSpecificEn: "A new scene description...",
      sceneSpecificVi: "Mô tả cảnh mới...",
      camera: "Wide Shot",
      lighting: "Natural"
    };
    setScenes([...scenes, newScene]);
    // Scroll to bottom logic could be added here
  };

  const handleExportAll = () => {
     const content = scenes.map(s => {
         return `=== SCENE ${s.sceneNumber} ===\n[VI]\n${settings.characterDescVi}\n${s.sceneSpecificVi} Camera: ${s.camera}, ${s.lighting}, ${settings.aspectRatio}.\n\n[EN]\n${settings.characterDescEn}\n${s.sceneSpecificEn} Camera: ${s.camera}, ${s.lighting}, ${settings.aspectRatio}.\n\n`;
     }).join("--------------------------------------------------\n");

     const blob = new Blob([content], { type: 'text/plain' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `video-veo-3-prompts-${Date.now()}.txt`;
     a.click();
     URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 overflow-hidden">
      
      {/* GLOBAL HEADER */}
      <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-center flex-col shrink-0 z-50 shadow-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          <Clapperboard className="w-6 h-6 text-blue-400" />
          App AI tạo prompt Veo 3
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Được thiết kế bởi <span className="text-blue-400 font-bold">Bùi Tuấn Hằng</span>
        </p>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - 1/3 Width */}
        <Sidebar 
          settings={settings} 
          setSettings={setSettings} 
          onGenerate={handleGenerateScenes}
          isGenerating={isGenerating}
        />

        {/* Right Panel - 2/3 Width */}
        <div className="w-2/3 h-full flex flex-col bg-gray-950">
          
          {/* Right Header */}
          <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/80 backdrop-blur sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-2 text-white font-medium">
              <Layers className="w-5 h-5 text-blue-500" />
              <span>Danh sách cảnh ({scenes.length})</span>
            </div>
            
            <div className="flex gap-3">
              {scenes.length > 0 && (
                  <button 
                    onClick={handleExportAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-lg hover:bg-blue-500 hover:shadow-blue-900/50 transition-all"
                  >
                    <Download className="w-4 h-4" /> Export TXT
                  </button>
              )}
            </div>
          </div>

          {/* Scene List Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-950 pb-20">
            {scenes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
                <Layers className="w-16 h-16 stroke-1" />
                <p className="text-lg">Chưa có cảnh nào. Hãy nhập ý tưởng bên trái và nhấn "Tạo danh sách cảnh".</p>
              </div>
            ) : (
              scenes.map((scene) => (
                <SceneCard 
                  key={scene.id}
                  scene={scene}
                  masterCharacterEn={settings.characterDescEn}
                  masterCharacterVi={settings.characterDescVi}
                  aspectRatio={settings.aspectRatio}
                  onUpdate={handleUpdateScene}
                  onDelete={handleDeleteScene}
                  onRegenerate={handleRegenerateSingle}
                  isRegenerating={regeneratingIds.has(scene.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;