'use client';

import { useVideoStore } from '@/store/videoStore';
import { AspectRatio } from '@/types';

const ASPECT_RATIOS: { label: string; value: AspectRatio; desc: string }[] = [
  { label: '16:9', value: '16:9', desc: '가로 (유튜브)' },
  { label: '9:16', value: '9:16', desc: '세로 (쇼츠)' },
  { label: '1:1', value: '1:1', desc: '정사각형 (인스타)' },
  { label: '4:3', value: '4:3', desc: '전통 TV' },
];

export default function ProjectSettings() {
  const { project, updateProjectSettings } = useVideoStore();
  const { settings } = project;

  return (
    <div className="space-y-3 text-xs">
      <p className="text-gray-400 font-medium">프로젝트 설정</p>

      <div>
        <label className="text-gray-500 block mb-1">프로젝트 이름</label>
        <input
          type="text"
          value={settings.name}
          onChange={(e) => updateProjectSettings({ name: e.target.value })}
          className="w-full bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-gray-500 block mb-2">화면 비율</label>
        <div className="grid grid-cols-2 gap-1.5">
          {ASPECT_RATIOS.map((ar) => (
            <button
              key={ar.value}
              onClick={() => updateProjectSettings({ aspectRatio: ar.value })}
              className={`rounded border p-2 text-left transition-colors ${
                settings.aspectRatio === ar.value
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="font-bold">{ar.label}</div>
              <div className="text-gray-500 text-[10px]">{ar.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-gray-500 block mb-1">프레임 레이트</label>
        <select
          value={settings.fps}
          onChange={(e) => updateProjectSettings({ fps: Number(e.target.value) })}
          className="w-full bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none"
        >
          <option value={24}>24 fps</option>
          <option value={30}>30 fps</option>
          <option value={60}>60 fps</option>
        </select>
      </div>

      <div className="pt-1 text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>해상도</span>
          <span className="text-gray-300">
            {settings.resolution.width} × {settings.resolution.height}
          </span>
        </div>
        <div className="flex justify-between">
          <span>총 길이</span>
          <span className="text-gray-300">{project.totalDuration.toFixed(2)}s</span>
        </div>
        <div className="flex justify-between">
          <span>클립 수</span>
          <span className="text-gray-300">{project.clips.length}</span>
        </div>
      </div>
    </div>
  );
}
