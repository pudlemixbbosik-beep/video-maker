'use client';

import { useState } from 'react';
import MediaUploader from './MediaUploader';
import VideoPreview from './VideoPreview';
import Timeline from './Timeline';
import TextOverlayEditor from './TextOverlayEditor';
import ClipProperties from './ClipProperties';
import ProjectSettings from './ProjectSettings';
import { useVideoStore } from '@/store/videoStore';

type RightPanel = 'clip' | 'text' | 'settings';

export default function VideoEditor() {
  const [rightPanel, setRightPanel] = useState<RightPanel>('clip');
  const { project, selectedClipId } = useVideoStore();

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-blue-400 font-bold text-lg tracking-tight">VideoMaker</div>
          <span className="text-gray-600 text-sm">|</span>
          <span className="text-gray-400 text-sm">{project.settings.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{project.settings.aspectRatio}</span>
          <span>·</span>
          <span>{project.settings.fps}fps</span>
          <span>·</span>
          <span>{project.settings.resolution.width}×{project.settings.resolution.height}</span>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar - Media Library */}
        <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="px-3 py-2 border-b border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              미디어 라이브러리
            </h2>
          </div>
          <div className="flex-1 overflow-hidden p-2">
            <MediaUploader />
          </div>
        </aside>

        {/* Center - Preview */}
        <main className="flex-1 min-w-0 flex flex-col bg-gray-950">
          <div className="flex-1 p-4 min-h-0">
            <VideoPreview />
          </div>
        </main>

        {/* Right sidebar - Properties */}
        <aside className="w-60 flex-shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col">
          {/* Panel tabs */}
          <div className="flex border-b border-gray-800 flex-shrink-0">
            {([
              { id: 'clip', label: '클립' },
              { id: 'text', label: '텍스트' },
              { id: 'settings', label: '설정' },
            ] as { id: RightPanel; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanel(tab.id)}
                className={`flex-1 text-xs py-2 transition-colors ${
                  rightPanel === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-800/50'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-3">
            {rightPanel === 'clip' && <ClipProperties />}
            {rightPanel === 'text' && <TextOverlayEditor />}
            {rightPanel === 'settings' && <ProjectSettings />}
          </div>
        </aside>
      </div>

      {/* Timeline */}
      <div className="h-40 flex-shrink-0 bg-gray-900 border-t border-gray-800">
        <Timeline />
      </div>
    </div>
  );
}
