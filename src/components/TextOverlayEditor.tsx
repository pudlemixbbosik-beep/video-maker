'use client';

import { useState } from 'react';
import { useVideoStore } from '@/store/videoStore';
import { TextOverlay } from '@/types';

const FONT_FAMILIES = ['Arial', 'Georgia', 'Courier New', 'Impact', 'Verdana', 'Times New Roman'];

export default function TextOverlayEditor() {
  const {
    project,
    selectedClipId,
    currentTime,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    selectTextOverlay,
    selectedTextOverlayId,
  } = useVideoStore();

  const selectedClip = project.clips.find((c) => c.id === selectedClipId);

  const [form, setForm] = useState<Omit<TextOverlay, 'id'>>({
    text: '텍스트 입력',
    x: 50,
    y: 50,
    fontSize: 36,
    color: '#ffffff',
    fontFamily: 'Arial',
    fontWeight: 'bold',
    backgroundColor: '',
    startTime: 0,
    endTime: 3,
  });

  const handleAdd = () => {
    if (!selectedClipId || !selectedClip) return;
    const relStart = Math.max(0, currentTime - selectedClip.trackStart + selectedClip.startTime);
    addTextOverlay(selectedClipId, {
      ...form,
      startTime: relStart,
      endTime: relStart + 3,
    });
  };

  const handleUpdate = (overlayId: string, updates: Partial<TextOverlay>) => {
    if (!selectedClipId) return;
    updateTextOverlay(selectedClipId, overlayId, updates);
  };

  if (!selectedClip) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-gray-600 text-center px-4">
          타임라인에서 클립을 선택하면 텍스트 오버레이를 추가할 수 있습니다
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-xs">
      <p className="text-gray-400 font-medium">텍스트 오버레이</p>

      {/* Existing overlays */}
      {selectedClip.textOverlays.length > 0 && (
        <div className="space-y-1">
          {selectedClip.textOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                selectedTextOverlayId === overlay.id
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => {
                const nextId = overlay.id === selectedTextOverlayId ? null : overlay.id;
                selectTextOverlay(nextId);
              }}
            >
              <span className="flex-1 truncate text-gray-300">{overlay.text}</span>
              <button
                className="text-red-400 hover:text-red-300 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTextOverlay(selectedClipId!, overlay.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}

          {/* Edit selected overlay */}
          {selectedTextOverlayId &&
            selectedClip.textOverlays
              .filter((o) => o.id === selectedTextOverlayId)
              .map((overlay) => (
                <div key={overlay.id} className="mt-2 space-y-2 bg-gray-800/50 p-2 rounded border border-gray-700">
                  <div>
                    <label className="text-gray-500">텍스트</label>
                    <input
                      type="text"
                      value={overlay.text}
                      onChange={(e) => handleUpdate(overlay.id, { text: e.target.value })}
                      className="w-full mt-1 bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-500">X (%)</label>
                      <input
                        type="number"
                        value={overlay.x}
                        min={0} max={100}
                        onChange={(e) => handleUpdate(overlay.id, { x: Number(e.target.value) })}
                        className="w-full mt-1 bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500">Y (%)</label>
                      <input
                        type="number"
                        value={overlay.y}
                        min={0} max={100}
                        onChange={(e) => handleUpdate(overlay.id, { y: Number(e.target.value) })}
                        className="w-full mt-1 bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-500">크기</label>
                      <input
                        type="number"
                        value={overlay.fontSize}
                        min={8} max={200}
                        onChange={(e) => handleUpdate(overlay.id, { fontSize: Number(e.target.value) })}
                        className="w-full mt-1 bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500">색상</label>
                      <input
                        type="color"
                        value={overlay.color}
                        onChange={(e) => handleUpdate(overlay.id, { color: e.target.value })}
                        className="w-full mt-1 h-7 bg-gray-700 rounded border border-gray-600 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-500">폰트</label>
                    <select
                      value={overlay.fontFamily}
                      onChange={(e) => handleUpdate(overlay.id, { fontFamily: e.target.value })}
                      className="w-full mt-1 bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none"
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-500">시작 (s)</label>
                      <input
                        type="number"
                        value={overlay.startTime}
                        min={0} step={0.1}
                        onChange={(e) => handleUpdate(overlay.id, { startTime: Number(e.target.value) })}
                        className="w-full mt-1 bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500">끝 (s)</label>
                      <input
                        type="number"
                        value={overlay.endTime}
                        min={0} step={0.1}
                        onChange={(e) => handleUpdate(overlay.id, { endTime: Number(e.target.value) })}
                        className="w-full mt-1 bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Add new */}
      <div className="border-t border-gray-700 pt-2">
        <p className="text-gray-500 mb-2">새 텍스트 추가</p>
        <input
          type="text"
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          className="w-full bg-gray-700 rounded px-2 py-1 text-gray-200 border border-gray-600 focus:border-blue-500 outline-none mb-2"
          placeholder="텍스트 내용"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded py-1.5 transition-colors"
        >
          + 텍스트 추가
        </button>
      </div>
    </div>
  );
}
