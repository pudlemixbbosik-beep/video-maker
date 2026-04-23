export type AgentKey =
  | 'guidelines'
  | 'siteAnalysis'
  | 'report'
  | 'concept'
  | 'description'
  | 'layoutPlan'
  | 'exterior'
  | 'massDesign';

export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

export interface AgentState {
  status: AgentStatus;
  content: string;
  lastUpdated?: string;
}

export interface AgentConfig {
  key: AgentKey;
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}
