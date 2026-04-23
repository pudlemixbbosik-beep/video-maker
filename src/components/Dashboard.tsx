'use client';

import { AGENT_CONFIGS, PROJECT } from '@/lib/projectInfo';

interface DashboardProps {
  onSelectAgent: (key: string) => void;
}

export default function Dashboard({ onSelectAgent }: DashboardProps) {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* 프로젝트 개요 카드 */}
      <div className="bg-gradient-to-r from-amber-900/30 to-slate-800 border border-amber-500/30 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              설계공모 AI 시스템
            </div>
            <h2 className="text-white text-xl font-bold">{PROJECT.name}</h2>
          </div>
          <span className="text-3xl">🏗️</span>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '위치', value: PROJECT.location },
            { label: '규모', value: `${PROJECT.floorArea} / ${PROJECT.floors}` },
            { label: '공사비', value: PROJECT.budget },
            { label: '제출기한', value: PROJECT.deadline },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-slate-500 text-xs">{item.label}</div>
              <div className="text-slate-300 text-sm mt-0.5 leading-snug">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 에이전트 그리드 */}
      <div>
        <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3">에이전트 선택</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {AGENT_CONFIGS.map((cfg, i) => (
            <button
              key={cfg.key}
              onClick={() => onSelectAgent(cfg.key)}
              className={`text-left p-4 rounded-xl border ${cfg.borderClass} ${cfg.bgClass}
                bg-slate-800 hover:bg-slate-750 hover:border-amber-500/60 transition-all group`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{cfg.icon}</span>
                <span className="text-slate-600 text-xs group-hover:text-slate-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className={`font-semibold text-sm ${cfg.colorClass}`}>{cfg.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">{cfg.subtitle}</div>
              <div className="mt-3 text-xs text-slate-600 group-hover:text-amber-500 transition-colors">
                클릭하여 실행 →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 안내 */}
      <div className="text-xs text-slate-600 text-center pb-2">
        각 에이전트를 실행하면 AI가 자동으로 해당 문서를 생성합니다 · ANTHROPIC_API_KEY 필요
      </div>
    </div>
  );
}
