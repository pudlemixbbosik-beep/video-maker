'use client';

import { useCallback, useRef } from 'react';
import { useVideoStore } from '@/store/videoStore';
import { MediaItem, MediaType } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function getMediaType(file: File): MediaType {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'video';
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => resolve(10);
    video.src = URL.createObjectURL(file);
  });
}

function getVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    video.preload = 'metadata';
    video.onloadeddata = () => {
      video.currentTime = 0.5;
    };
    video.onseeked = () => {
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(video, 0, 0, 160, 90);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => resolve('');
    video.src = URL.createObjectURL(file);
  });
}

async function processFile(file: File): Promise<MediaItem> {
  const type = getMediaType(file);
  const url = URL.createObjectURL(file);
  let duration: number | undefined;
  let thumbnail: string | undefined;

  if (type === 'video') {
    duration = await getVideoDuration(file);
    thumbnail = await getVideoThumbnail(file);
  } else if (type === 'image') {
    duration = 5;
    thumbnail = url;
  } else if (type === 'audio') {
    duration = await getVideoDuration(file);
  }

  return {
    id: generateId(),
    name: file.name,
    type,
    url,
    duration,
    thumbnail,
    file,
  };
}

export default function MediaUploader() {
  const { mediaLibrary, addMedia, addClipToTimeline } = useVideoStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      for (const file of Array.from(files)) {
        const media = await processFile(file);
        addMedia(media);
      }
    },
    [addMedia]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const typeIcon = (type: MediaType) => {
    if (type === 'video') return '🎬';
    if (type === 'image') return '🖼';
    return '🎵';
  };

  const typeColor = (type: MediaType) => {
    if (type === 'video') return 'bg-blue-500/20 border-blue-500/40';
    if (type === 'image') return 'bg-green-500/20 border-green-500/40';
    return 'bg-purple-500/20 border-purple-500/40';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-500/5 transition-all"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-2xl mb-1">+</div>
        <p className="text-xs text-gray-400">미디어 파일 추가</p>
        <p className="text-xs text-gray-600 mt-1">드래그 앤 드롭 또는 클릭</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,image/*,audio/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Media library */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2">
        {mediaLibrary.length === 0 && (
          <p className="text-xs text-gray-600 text-center mt-4">
            업로드된 미디어가 없습니다
          </p>
        )}
        {mediaLibrary.map((media) => (
          <div
            key={media.id}
            className={`rounded-lg border p-2 cursor-pointer hover:brightness-110 transition-all ${typeColor(media.type)}`}
            onDoubleClick={() => addClipToTimeline(media.id)}
          >
            <div className="flex items-center gap-2">
              {media.thumbnail && media.type !== 'audio' ? (
                <img
                  src={media.thumbnail}
                  alt={media.name}
                  className="w-14 h-9 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-9 bg-gray-700 rounded flex items-center justify-center text-xl flex-shrink-0">
                  {typeIcon(media.type)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-200 truncate">{media.name}</p>
                <p className="text-xs text-gray-500">
                  {media.type} {media.duration ? `· ${media.duration.toFixed(1)}s` : ''}
                </p>
              </div>
            </div>
            <button
              className="mt-2 w-full text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded px-2 py-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                addClipToTimeline(media.id);
              }}
            >
              타임라인에 추가
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
