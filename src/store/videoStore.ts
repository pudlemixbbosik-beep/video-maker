import { create } from 'zustand';
import { Clip, MediaItem, TextOverlay, VideoProject, AspectRatio } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function aspectRatioToResolution(ratio: AspectRatio) {
  const map: Record<AspectRatio, { width: number; height: number }> = {
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '1:1': { width: 1080, height: 1080 },
    '4:3': { width: 1440, height: 1080 },
  };
  return map[ratio];
}

interface VideoState {
  project: VideoProject;
  mediaLibrary: MediaItem[];
  selectedClipId: string | null;
  selectedTextOverlayId: string | null;
  currentTime: number;
  isPlaying: boolean;
  zoom: number; // timeline zoom level

  // Actions
  addMedia: (media: MediaItem) => void;
  removeMedia: (id: string) => void;
  addClipToTimeline: (mediaId: string) => void;
  removeClip: (clipId: string) => void;
  reorderClips: (oldIndex: number, newIndex: number) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  selectClip: (clipId: string | null) => void;
  splitClip: (clipId: string, atTime: number) => void;

  addTextOverlay: (clipId: string, overlay: Omit<TextOverlay, 'id'>) => void;
  updateTextOverlay: (clipId: string, overlayId: string, updates: Partial<TextOverlay>) => void;
  removeTextOverlay: (clipId: string, overlayId: string) => void;
  selectTextOverlay: (id: string | null) => void;


  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  updateProjectSettings: (settings: Partial<VideoProject['settings']>) => void;
}

function recomputeTrackStarts(clips: Clip[]): Clip[] {
  let t = 0;
  return clips.map((c) => {
    const updated = { ...c, trackStart: t };
    t += c.duration;
    return updated;
  });
}

function computeTotalDuration(clips: Clip[]): number {
  return clips.reduce((sum, c) => sum + c.duration, 0);
}

export const useVideoStore = create<VideoState>((set, get) => ({
  project: {
    id: generateId(),
    settings: {
      name: '새 프로젝트',
      aspectRatio: '16:9',
      fps: 30,
      resolution: { width: 1920, height: 1080 },
    },
    clips: [],
    transitions: [],
    totalDuration: 0,
  },
  mediaLibrary: [],
  selectedClipId: null,
  selectedTextOverlayId: null,
  currentTime: 0,
  isPlaying: false,
  zoom: 1,

  addMedia: (media) =>
    set((s) => ({ mediaLibrary: [...s.mediaLibrary, media] })),

  removeMedia: (id) =>
    set((s) => ({ mediaLibrary: s.mediaLibrary.filter((m) => m.id !== id) })),

  addClipToTimeline: (mediaId) => {
    const { mediaLibrary, project } = get();
    const media = mediaLibrary.find((m) => m.id === mediaId);
    if (!media) return;

    const duration = media.duration ?? (media.type === 'image' ? 5 : 10);
    const existingDuration = computeTotalDuration(project.clips);

    const clip: Clip = {
      id: generateId(),
      mediaId,
      name: media.name,
      type: media.type,
      url: media.url,
      thumbnail: media.thumbnail,
      startTime: 0,
      endTime: duration,
      duration,
      trackStart: existingDuration,
      volume: 1,
      textOverlays: [],
    };

    set((s) => {
      const clips = [...s.project.clips, clip];
      return {
        project: {
          ...s.project,
          clips,
          totalDuration: computeTotalDuration(clips),
        },
      };
    });
  },

  removeClip: (clipId) =>
    set((s) => {
      const clips = recomputeTrackStarts(
        s.project.clips.filter((c) => c.id !== clipId)
      );
      return {
        project: { ...s.project, clips, totalDuration: computeTotalDuration(clips) },
        selectedClipId: s.selectedClipId === clipId ? null : s.selectedClipId,
      };
    }),

  reorderClips: (oldIndex, newIndex) =>
    set((s) => {
      const clips = [...s.project.clips];
      const [moved] = clips.splice(oldIndex, 1);
      clips.splice(newIndex, 0, moved);
      const recomputed = recomputeTrackStarts(clips);
      return {
        project: { ...s.project, clips: recomputed, totalDuration: computeTotalDuration(recomputed) },
      };
    }),

  updateClip: (clipId, updates) =>
    set((s) => {
      const clips = s.project.clips.map((c) => {
        if (c.id !== clipId) return c;
        const updated = { ...c, ...updates };
        updated.duration = updated.endTime - updated.startTime;
        return updated;
      });
      const recomputed = recomputeTrackStarts(clips);
      return {
        project: { ...s.project, clips: recomputed, totalDuration: computeTotalDuration(recomputed) },
      };
    }),

  selectClip: (clipId) => set({ selectedClipId: clipId }),

  splitClip: (clipId, atTime) =>
    set((s) => {
      const idx = s.project.clips.findIndex((c) => c.id === clipId);
      if (idx === -1) return {};
      const clip = s.project.clips[idx];
      const relativeTime = atTime - clip.trackStart + clip.startTime;
      if (relativeTime <= clip.startTime || relativeTime >= clip.endTime) return {};

      const first: Clip = {
        ...clip,
        id: generateId(),
        endTime: relativeTime,
        duration: relativeTime - clip.startTime,
      };
      const second: Clip = {
        ...clip,
        id: generateId(),
        startTime: relativeTime,
        duration: clip.endTime - relativeTime,
        textOverlays: [],
      };

      const clips = [...s.project.clips];
      clips.splice(idx, 1, first, second);
      const recomputed = recomputeTrackStarts(clips);
      return {
        project: { ...s.project, clips: recomputed, totalDuration: computeTotalDuration(recomputed) },
      };
    }),

  addTextOverlay: (clipId, overlay) =>
    set((s) => ({
      project: {
        ...s.project,
        clips: s.project.clips.map((c) =>
          c.id === clipId
            ? { ...c, textOverlays: [...c.textOverlays, { ...overlay, id: generateId() }] }
            : c
        ),
      },
    })),

  updateTextOverlay: (clipId, overlayId, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        clips: s.project.clips.map((c) =>
          c.id === clipId
            ? {
                ...c,
                textOverlays: c.textOverlays.map((t) =>
                  t.id === overlayId ? { ...t, ...updates } : t
                ),
              }
            : c
        ),
      },
    })),

  removeTextOverlay: (clipId, overlayId) =>
    set((s) => ({
      project: {
        ...s.project,
        clips: s.project.clips.map((c) =>
          c.id === clipId
            ? { ...c, textOverlays: c.textOverlays.filter((t) => t.id !== overlayId) }
            : c
        ),
      },
    })),

  selectTextOverlay: (id) => set({ selectedTextOverlayId: id }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setZoom: (zoom) => set({ zoom }),

  updateProjectSettings: (settings) =>
    set((s) => {
      const merged = { ...s.project.settings, ...settings };
      if (settings.aspectRatio) {
        merged.resolution = aspectRatioToResolution(settings.aspectRatio);
      }
      return { project: { ...s.project, settings: merged } };
    }),
}));
