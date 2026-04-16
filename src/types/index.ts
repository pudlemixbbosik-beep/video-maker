export type MediaType = 'video' | 'image' | 'audio';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  duration?: number; // seconds
  thumbnail?: string;
  width?: number;
  height?: number;
  file: File;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  backgroundColor?: string;
  startTime: number;
  endTime: number;
}

export interface Clip {
  id: string;
  mediaId: string;
  name: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  startTime: number; // start within the clip
  endTime: number;   // end within the clip
  duration: number;  // computed from endTime - startTime
  trackStart: number; // position in timeline
  volume: number; // 0-1
  textOverlays: TextOverlay[];
}

export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom';

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export interface ProjectSettings {
  name: string;
  aspectRatio: AspectRatio;
  fps: number;
  resolution: { width: number; height: number };
}

export interface VideoProject {
  id: string;
  settings: ProjectSettings;
  clips: Clip[];
  transitions: Transition[];
  totalDuration: number;
}
