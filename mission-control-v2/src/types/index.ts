export type AgentStatus = 'running' | 'idle' | 'error' | 'completed';
export type ToolStatus = 'active' | 'inactive' | 'error';
export type WorkflowStatus = 'active' | 'paused' | 'error' | 'completed';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type ApprovalType = 'trade' | 'expense' | 'action' | 'workflow';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Agent {
  id: string;
  name: string;
  task: string;
  status: AgentStatus;
  progress: number;
  startTime: Date;
  lastActivity: Date;
  description?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  status: ToolStatus;
  usageCount: number;
  lastUsed: Date | null;
  config: Record<string, any>;
  icon?: string;
}

export interface Approval {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: ApprovalStatus;
  requestedBy: string;
  requestedAt: Date;
  amount?: number;
  data?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: string;
  actions: string[];
  runCount: number;
  lastRun: Date | null;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: 'agent' | 'tool' | 'approval' | 'workflow' | 'system';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SystemStats {
  activeAgents: number;
  pendingApprovals: number;
  activeWorkflows: number;
  toolsActive: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
}
