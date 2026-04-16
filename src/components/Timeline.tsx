'use client';

import { useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useVideoStore } from '@/store/videoStore';
import { Clip } from '@/types';

const PX_PER_SEC = 80; // pixels per second at zoom=1

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function ClipBlock({ clip, isSelected }: { clip: Clip; isSelected: boolean }) {
  const { selectClip, removeClip, splitClip, currentTime, zoom } = useVideoStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: clip.id,
  });

  const width = clip.duration * PX_PER_SEC * zoom;

  const typeColor: Record<string, string> = {
    video: 'bg-blue-700 border-blue-500',
    image: 'bg-green-700 border-green-500',
    audio: 'bg-purple-700 border-purple-500',
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${width}px`,
    minWidth: `${width}px`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative h-16 rounded border-2 cursor-grab active:cursor-grabbing flex-shrink-0 overflow-hidden select-none
        ${typeColor[clip.type] ?? 'bg-gray-700 border-gray-500'}
        ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        selectClip(isSelected ? null : clip.id);
      }}
    >
      {/* Thumbnail */}
      {clip.thumbnail && clip.type !== 'audio' && (
        <img
          src={clip.thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          draggable={false}
        />
      )}

      {/* Label */}
      <div className="absolute inset-0 flex flex-col justify-between p-1">
        <p className="text-xs text-white font-medium truncate drop-shadow">{clip.name}</p>
        <p className="text-xs text-gray-300 drop-shadow">{clip.duration.toFixed(1)}s</p>
      </div>

      {/* Actions */}
      {isSelected && (
        <div
          className="absolute top-0 right-0 flex gap-1 p-0.5"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            className="text-xs bg-red-600 hover:bg-red-500 text-white rounded px-1"
            onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }}
            title="삭제"
          >
            ✕
          </button>
          <button
            className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white rounded px-1"
            onClick={(e) => { e.stopPropagation(); splitClip(clip.id, currentTime); }}
            title="분할"
          >
            ✂
          </button>
        </div>
      )}
    </div>
  );
}

export default function Timeline() {
  const {
    project,
    selectedClipId,
    currentTime,
    zoom,
    setCurrentTime,
    setZoom,
    selectClip,
    reorderClips,
  } = useVideoStore();

  const { clips, totalDuration } = project;
  const timelineRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = clips.findIndex((c) => c.id === active.id);
      const newIndex = clips.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderClips(oldIndex, newIndex);
      }
    },
    [clips, reorderClips]
  );

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
      const t = x / (PX_PER_SEC * zoom);
      setCurrentTime(Math.max(0, Math.min(t, totalDuration)));
      selectClip(null);
    },
    [zoom, totalDuration, setCurrentTime, selectClip]
  );

  // Ruler ticks
  const tickInterval = zoom < 0.5 ? 10 : zoom < 1.5 ? 5 : 1;
  const numTicks = Math.ceil(totalDuration / tickInterval) + 2;
  const totalWidth = Math.max(totalDuration * PX_PER_SEC * zoom + 200, 600);

  const playheadLeft = currentTime * PX_PER_SEC * zoom;

  return (
    <div className="flex flex-col h-full select-none">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-gray-700 text-xs text-gray-400">
        <span>타임라인</span>
        <div className="ml-auto flex items-center gap-2">
          <span>확대</span>
          <button
            className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
            onClick={() => setZoom(Math.max(0.2, zoom - 0.2))}
          >
            −
          </button>
          <span className="w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
            onClick={() => setZoom(Math.min(5, zoom + 0.2))}
          >
            +
          </button>
        </div>
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-auto relative" ref={timelineRef}>
        <div
          className="relative cursor-pointer"
          style={{ width: `${totalWidth}px`, minHeight: '120px' }}
          onClick={handleTimelineClick}
        >
          {/* Ruler */}
          <div className="h-6 bg-gray-900 border-b border-gray-700 sticky top-0 z-10 flex">
            {Array.from({ length: numTicks }).map((_, i) => {
              const t = i * tickInterval;
              return (
                <div
                  key={i}
                  className="absolute flex flex-col items-start"
                  style={{ left: `${t * PX_PER_SEC * zoom}px` }}
                >
                  <div className="w-px h-3 bg-gray-600" />
                  <span className="text-xs text-gray-500 pl-0.5 text-[10px]">
                    {formatTime(t)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Clip track */}
          <div className="flex items-center gap-1 px-1 py-2 mt-1" style={{ minHeight: '80px' }}>
            {clips.length === 0 && (
              <p className="text-gray-600 text-xs ml-4">
                미디어 라이브러리에서 클립을 추가하세요
              </p>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={clips.map((c) => c.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {clips.map((clip) => (
                    <ClipBlock
                      key={clip.id}
                      clip={clip}
                      isSelected={selectedClipId === clip.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${playheadLeft}px` }}
          >
            <div className="w-0.5 h-full bg-red-500 opacity-90" />
            <div
              className="absolute top-0 -translate-x-1/2 w-3 h-3 bg-red-500"
              style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
