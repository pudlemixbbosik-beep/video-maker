'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AgentKey, AgentState } from '@/types';

const AGENT_KEYS: AgentKey[] = [
  'guidelines', 'siteAnalysis', 'report', 'concept',
  'description', 'layoutPlan', 'exterior', 'massDesign',
];

const blank = (): AgentState => ({ status: 'idle', content: '' });

interface DesignStore {
  agents: Record<AgentKey, AgentState>;
  setStatus: (key: AgentKey, status: AgentState['status']) => void;
  appendContent: (key: AgentKey, text: string) => void;
  resetAgent: (key: AgentKey) => void;
  setLastUpdated: (key: AgentKey, ts: string) => void;
}

export const useDesignStore = create<DesignStore>()(
  persist(
    (set) => ({
      agents: Object.fromEntries(AGENT_KEYS.map((k) => [k, blank()])) as Record<AgentKey, AgentState>,

      setStatus: (key, status) =>
        set((s) => ({ agents: { ...s.agents, [key]: { ...s.agents[key], status } } })),

      appendContent: (key, text) =>
        set((s) => ({
          agents: {
            ...s.agents,
            [key]: { ...s.agents[key], content: s.agents[key].content + text },
          },
        })),

      resetAgent: (key) =>
        set((s) => ({ agents: { ...s.agents, [key]: blank() } })),

      setLastUpdated: (key, ts) =>
        set((s) => ({
          agents: { ...s.agents, [key]: { ...s.agents[key], lastUpdated: ts } },
        })),
    }),
    {
      name: 'design-ai-store',
      partialize: (s) => ({ agents: s.agents }),
    },
  ),
);
