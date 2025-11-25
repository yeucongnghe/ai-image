export interface StyleOption {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
}

export interface GeneratedImageResult {
  id: string;
  imageUrl: string;
  style: string;
}

export type OutputQuality = 'standard' | 'high';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';