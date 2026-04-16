'use client';

import { useVideoStore } from '@/store/videoStore';

export default function ClipProperties() {
  const { project, selectedClipId, updateClip, removeClip } = useVideoStore();
  const clip = project.clips.find((c) => c.id === selectedClipId);

  if (!clip) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs text-gray-600 text-center px-4">
          클립을 선택하면 속성을 편집할 수 있습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <p className="text-gray-400 font-medium truncate">{clip.name}</p>

      <div>
        <label className="text-gray-500 block mb-1">시작 시간 (s)</label>
        <input
          type="number"
          value={clip.startTime.toFixed(2)}
          min={0}
          step={0.1}
          onChange={(e) =>
            updateClip(clip.id, { startTime: Math.min(Number(e.target.value), clip.endTime - 0.1) })
          }
          className="w-full bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-gray-500 block mb-1">끝 시간 (s)</label>
        <input
          type="number"
          value={clip.endTime.toFixed(2)}
          min={0}
          step={0.1}
          onChange={(e) =>
            updateClip(clip.id, { endTime: Math.max(Number(e.target.value), clip.startTime + 0.1) })
          }
          className="w-full bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-gray-500 block mb-1">볼륨</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={clip.volume}
            onChange={(e) => updateClip(clip.id, { volume: parseFloat(e.target.value) })}
            className="flex-1 accent-blue-500"
          />
          <span className="text-gray-400 w-8 text-right">{Math.round(clip.volume * 100)}%</span>
        </div>
      </div>

      <div className="pt-1">
        <div className="text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>유형</span>
            <span className="text-gray-300 capitalize">{clip.type}</span>
          </div>
          <div className="flex justify-between">
            <span>길이</span>
            <span className="text-gray-300">{clip.duration.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between">
            <span>위치</span>
            <span className="text-gray-300">{clip.trackStart.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => removeClip(clip.id)}
        className="w-full bg-red-800 hover:bg-red-700 text-white rounded py-1.5 transition-colors mt-2"
      >
        클립 삭제
      </button>
    </div>
  );
}
