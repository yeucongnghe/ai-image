export interface AppSettings {
  charPrompt: string;
  contextPrompt: string;
  accuracy: number; // 0-100
  aspectRatio: string;
  resolution: 'standard' | 'hd' | 'uhd';
  style: string;
  numberOfImages: number;
}

export type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9' | '4:3';

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export const SUGGESTIONS = {
  character: [],
  context: []
};