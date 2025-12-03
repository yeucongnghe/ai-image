export enum AspectRatio {
  RATIO_16_9 = '16:9',
  RATIO_9_16 = '9:16',
}

export interface GlobalSettings {
  context: string;
  characterDescEn: string;
  characterDescVi: string;
  videoIdea: string;
  genre: string;
  aspectRatio: AspectRatio;
  sceneCount: number;
}

export interface SceneData {
  id: string;
  sceneNumber: number;
  // Specific action/environment for this scene (without character desc prefix)
  sceneSpecificEn: string;
  sceneSpecificVi: string;
  // Metadata for display/editing
  camera: string;
  lighting: string;
}

// The structure returned by the Gemini API
export interface GeneratedSceneResponse {
  scenes: {
    sceneNumber: number;
    actionEn: string;
    actionVi: string;
    camera: string;
    lighting: string;
  }[];
}