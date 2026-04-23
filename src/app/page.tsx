'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import AgentPanel from '@/components/AgentPanel';
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
          ) : currentAgent ? (
            <AgentPanel config={currentAgent} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
