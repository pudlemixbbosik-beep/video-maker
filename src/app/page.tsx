'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { AGENT_CONFIGS } from '@/lib/projectInfo';
import { AgentKey } from '@/types';

type View = 'dashboard' | AgentKey;

export default function Page() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const currentAgent = AGENT_CONFIGS.find((c) => c.key === activeView);

  const headerTitle = currentAgent
    ? `${currentAgent.icon} ${currentAgent.title}`
    : '🏠 대시보드';
  const headerSubtitle = currentAgent?.subtitle;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar activeView={activeView} onSelect={(v) => setActiveView(v as View)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={headerTitle} subtitle={headerSubtitle} />

        <main className="flex-1 overflow-hidden">
          {activeView === 'dashboard' ? (
            <Dashboard onSelectAgent={(k) => setActiveView(k as AgentKey)} />
          ) : (
            /* 에이전트 패널 자리 (2단계에서 구현) */
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <span className="text-5xl">{currentAgent?.icon}</span>
              <p className="text-sm">{currentAgent?.title} 에이전트 — 2단계에서 구현 예정</p>
              <button
                onClick={() => setActiveView('dashboard')}
                className="text-xs text-amber-500 hover:text-amber-400 underline"
              >
                ← 대시보드로 돌아가기
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
