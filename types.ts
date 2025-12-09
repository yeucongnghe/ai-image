export enum RequestStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum InputType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface VideoRequest {
  id: string;
  inputType: InputType;
  prompt: string;
  image: File | null;
  aspectRatio: '16:9' | '9:16';
  status: RequestStatus;
  videoUrl?: string;
  error?: string;
  progress?: string; // Optional message like "Queueing", "Rendering"
}

export const ASPECT_RATIOS = ['16:9', '9:16'] as const;

// Declare the AIStudio interface globally to match the expected type of window.aistudio.
// We refrain from redeclaring Window.aistudio to avoid conflicts with existing definitions.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
