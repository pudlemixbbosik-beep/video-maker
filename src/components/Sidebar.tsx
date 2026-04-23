'use client';

import { AGENT_CONFIGS, PROJECT } from '@/lib/projectInfo';

interface SidebarProps {
  activeView: string;
  onSelect: (key: string) => void;
}

export default function Sidebar({ activeView, onSelect }: SidebarProps) {
  const deadline = new Date(PROJECT.submitDate);
  const dDay = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);

  return (
    <aside className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* 로고 */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="text-amber-400 font-bold text-sm tracking-tight">🏛️ 설계공모 AI</div>
        <div className="text-slate-500 text-xs mt-0.5 leading-tight">{PROJECT.name}</div>
      </div>

      {/* 대시보드 */}
      <button
        onClick={() => onSelect('dashboard')}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
          activeView === 'dashboard'
            ? 'bg-amber-500/15 text-amber-300 border-r-2 border-amber-400'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <span>🏠</span>
        <span>대시보드</span>
      </button>

      {/* 구분선 */}
      <div className="px-4 pt-3 pb-1">
        <span className="text-xs text-slate-600 uppercase tracking-widest">에이전트</span>
      </div>

      {/* 에이전트 목록 */}
      <nav className="flex-1 overflow-y-auto">
        {AGENT_CONFIGS.map((cfg, i) => (
          <button
            key={cfg.key}
            onClick={() => onSelect(cfg.key)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
              activeView === cfg.key
                ? 'bg-slate-700 text-white border-r-2 border-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-base w-5 text-center flex-shrink-0">{cfg.icon}</span>
            <span className="flex-1 text-left text-xs truncate">{cfg.title}</span>
            <span className="text-slate-600 text-xs flex-shrink-0">{i + 1}</span>
          </button>
        ))}
      </nav>

      {/* D-Day */}
      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500 space-y-0.5">
        <div>공모 제출: {PROJECT.deadline}</div>
        <div className={dDay <= 30 ? 'text-red-400 font-semibold' : 'text-slate-400'}>
          D-{dDay}일 남음
        </div>
      </div>
    </aside>
  );
}
