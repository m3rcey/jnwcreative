export interface Agent {
  id: string
  name: string
  status: 'running' | 'idle' | 'error' | 'completed'
  task: string
  startedAt: string
  lastActivity: string
  progress?: number
}

export interface Tool {
  id: string
  name: string
  description: string
  category: string
  status: 'active' | 'inactive' | 'error'
  usageCount: number
  lastUsed?: string
  config?: Record<string, any>
}

export interface ApprovalItem {
  id: string
  type: 'trade' | 'expense' | 'action' | 'workflow'
  title: string
  description: string
  requestedBy: string
  requestedAt: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'approved' | 'rejected'
  data?: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'error' | 'completed'
  trigger: string
  actions: WorkflowAction[]
  runCount: number
  lastRun?: string
  createdAt: string
}

export interface WorkflowAction {
  id: string
  type: 'agent' | 'tool' | 'notification' | 'delay' | 'condition'
  config: Record<string, any>
  order: number
}

export interface DashboardStats {
  activeAgents: number
  totalAgents: number
  pendingApprovals: number
  activeWorkflows: number
  toolsActive: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'agent' | 'approval' | 'workflow' | 'tool'
  title: string
  description: string
  timestamp: string
}

// Re-export all types
export type { Agent as default }
