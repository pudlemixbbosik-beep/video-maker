'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useVideoStore } from '@/store/videoStore';
import { Clip, TextOverlay } from '@/types';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms}`;
}

function getActiveClip(clips: Clip[], currentTime: number): Clip | null {
  for (const clip of clips) {
    if (currentTime >= clip.trackStart && currentTime < clip.trackStart + clip.duration) {
      return clip;
    }
  }
  return null;
}

function getActiveTextOverlays(clip: Clip, currentTime: number): TextOverlay[] {
  const relTime = currentTime - clip.trackStart + clip.startTime;
  return clip.textOverlays.filter((t) => relTime >= t.startTime && relTime <= t.endTime);
}

export default function VideoPreview() {
  const {
    project,
    currentTime,
    isPlaying,
    setCurrentTime,
    setIsPlaying,
  } = useVideoStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastClipIdRef = useRef<string | null>(null);
  const [volume, setVolume] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalDuration = project.totalDuration;
  const { clips } = project;
  const { aspectRatio } = project.settings;

  const aspectClass: Record<string, string> = {
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
  };

  const activeClip = getActiveClip(clips, currentTime);

  // Sync video element when clip changes or time jumps
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip) return;
    if (activeClip.type !== 'video') return;

    const newSrc = activeClip.url;
    if (video.src !== newSrc || lastClipIdRef.current !== activeClip.id) {
      video.src = newSrc;
      video.load();
      lastClipIdRef.current = activeClip.id;
    }
    const relTime = currentTime - activeClip.trackStart + activeClip.startTime;
    if (Math.abs(video.currentTime - relTime) > 0.3) {
      video.currentTime = relTime;
    }
    video.volume = activeClip.volume * volume;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [activeClip, currentTime, isPlaying, volume]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    // Use a local variable to accumulate time, avoiding stale closure on currentTime.
    let localTime = currentTime;
    let lastTimestamp: number | null = null;

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      localTime += delta;
      if (localTime >= totalDuration) {
        setCurrentTime(totalDuration);
        setIsPlaying(false);
        return;
      }
      setCurrentTime(localTime);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, totalDuration, setCurrentTime, setIsPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (isPlaying) {
      const video = videoRef.current;
      if (video) {
        const clip = getActiveClip(clips, t);
        if (clip && clip.type === 'video') {
          video.currentTime = t - clip.trackStart + clip.startTime;
        }
      }
    }
  };

  const togglePlay = () => {
    if (totalDuration === 0) return;
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const activeTextOverlays = activeClip ? getActiveTextOverlays(activeClip, currentTime) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Preview canvas */}
      <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden min-h-0">
        <div
          className={`relative w-full ${aspectClass[aspectRatio] ?? 'aspect-video'} max-h-full bg-black`}
          style={{ maxWidth: '100%' }}
        >
          {activeClip?.type === 'video' && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain"
              muted={false}
              playsInline
            />
          )}
          {activeClip?.type === 'image' && (
            <img
              src={activeClip.url}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
          {!activeClip && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-600 text-sm">미디어를 타임라인에 추가하세요</p>
            </div>
          )}

          {/* Text overlays */}
          {activeTextOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute pointer-events-none"
              style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${overlay.fontSize}px`,
                color: overlay.color,
                fontFamily: overlay.fontFamily,
                fontWeight: overlay.fontWeight,
                backgroundColor: overlay.backgroundColor ?? 'transparent',
                padding: overlay.backgroundColor ? '4px 8px' : '0',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
              }}
            >
              {overlay.text}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-3 space-y-2">
        {/* Scrubber */}
        <input
          type="range"
          min={0}
          max={totalDuration || 1}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 accent-blue-500 cursor-pointer"
        />
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>

        {/* Playback buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRestart}
            className="text-gray-400 hover:text-white transition-colors text-sm px-2 py-1"
            title="처음으로"
          >
            ⏮
          </button>
          <button
            onClick={togglePlay}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg transition-colors"
            disabled={totalDuration === 0}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="flex items-center gap-1">
            <span className="text-gray-500 text-xs">🔊</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
