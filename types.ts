export type InputType = 'text' | 'image'; // Veo 3.1 supports text or image-to-video

export type AspectRatio = '16:9' | '9:16';

export type VideoModel = 
  | 'veo-3.1-generate-preview' 
  | 'veo-3.1-fast-generate-preview';

export type JobStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface JobParams {
  prompt: string;
  inputType: InputType;
  model: VideoModel;
  aspectRatio: AspectRatio;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface Job {
  id: string;
  status: JobStatus;
  params: JobParams;
  videoUri?: string; // The download link from API
  videoBlobUrl?: string; // The local blob URL for display
  error?: string;
  createdAt: number;
}
