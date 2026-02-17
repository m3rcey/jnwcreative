import { Agent, Tool, ApprovalItem, Workflow, DashboardStats } from '@/types'

class DataStore {
  private agents: Agent[] = [
    {
      id: 'agent-1',
      name: 'QullaBot',
      status: 'running',
      task: 'Market analysis - scanning for breakout setups',
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      progress: 65
    },
    {
      id: 'agent-2',
      name: 'Trade Executor',
      status: 'idle',
      task: 'Waiting for approval on NVDA position',
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      lastActivity: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'agent-3',
      name: 'Risk Monitor',
      status: 'running',
      task: 'Monitoring portfolio heat levels',
      startedAt: new Date(Date.now() - 7200000).toISOString(),
      lastActivity: new Date().toISOString(),
      progress: 100
    }
  ]

  private tools: Tool[] = [
    {
      id: 'tool-1',
      name: 'Market Scanner',
      description: 'Daily leadership scans across timeframes',
      category: 'Trading',
      status: 'active',
      usageCount: 42,
      lastUsed: new Date().toISOString()
    },
    {
      id: 'tool-2',
      name: 'EP Detector',
      description: 'Pre-market earnings pivot scanner',
      category: 'Trading',
      status: 'active',
      usageCount: 28,
      lastUsed: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'tool-3',
      name: 'Slack Notifier',
      description: 'Send alerts and reports to Slack',
      category: 'Communication',
      status: 'active',
      usageCount: 156,
      lastUsed: new Date().toISOString()
    },
    {
      id: 'tool-4',
      name: 'Weather Check',
      description: 'Get local weather forecasts',
      category: 'Utilities',
      status: 'inactive',
      usageCount: 5
    }
  ]

  private approvals: ApprovalItem[] = [
    {
      id: 'approval-1',
      type: 'trade',
      title: 'NVDA Long Breakout',
      description: 'Entry: $148.50 | Stop: $143.20 | Size: 15% | R:R 3.2:1',
      requestedBy: 'QullaBot',
      requestedAt: new Date(Date.now() - 300000).toISOString(),
      priority: 'high',
      status: 'pending',
      data: { ticker: 'NVDA', setup: 'Setup 1 Breakout' }
    },
    {
      id: 'approval-2',
      type: 'action',
      title: 'Update Circuit Breaker',
      description: 'Adjust drawdown threshold from 10% to 15%',
      requestedBy: 'Risk Monitor',
      requestedAt: new Date(Date.now() - 900000).toISOString(),
      priority: 'medium',
      status: 'pending'
    }
  ]

  private workflows: Workflow[] = [
    {
      id: 'workflow-1',
      name: 'Daily Market Open',
      description: 'Pre-market scans, regime check, and briefing',
      status: 'active',
      trigger: 'cron: 0 8 * * 1-5',
      actions: [
        { id: 'wa-1', type: 'tool', config: { toolId: 'market-scanner' }, order: 1 },
        { id: 'wa-2', type: 'agent', config: { agentType: 'regime-check' }, order: 2 },
        { id: 'wa-3', type: 'notification', config: { channel: 'slack' }, order: 3 }
      ],
      runCount: 23,
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 2592000000).toISOString()
    },
    {
      id: 'workflow-2',
      name: 'Earnings Alert',
      description: 'Check for earnings conflicts on open positions',
      status: 'active',
      trigger: 'cron: 0 14 * * *',
      actions: [
        { id: 'wa-4', type: 'tool', config: { toolId: 'earnings-checker' }, order: 1 },
        { id: 'wa-5', type: 'condition', config: { condition: 'has-conflict' }, order: 2 }
      ],
      runCount: 45,
      lastRun: new Date(Date.now() - 43200000).toISOString(),
      createdAt: new Date(Date.now() - 5184000000).toISOString()
    }
  ]

  // Agent methods
  getAgents(): Agent[] { return [...this.agents] }
  getAgent(id: string): Agent | undefined { return this.agents.find(a => a.id === id) }
  addAgent(agent: Agent): void { this.agents.push(agent) }
  updateAgent(id: string, updates: Partial<Agent>): void {
    const idx = this.agents.findIndex(a => a.id === id)
    if (idx >= 0) this.agents[idx] = { ...this.agents[idx], ...updates }
  }

  // Tool methods
  getTools(): Tool[] { return [...this.tools] }
  getTool(id: string): Tool | undefined { return this.tools.find(t => t.id === id) }
  addTool(tool: Tool): void { this.tools.push(tool) }
  updateTool(id: string, updates: Partial<Tool>): void {
    const idx = this.tools.findIndex(t => t.id === id)
    if (idx >= 0) this.tools[idx] = { ...this.tools[idx], ...updates }
  }

  // Approval methods
  getApprovals(): ApprovalItem[] { return [...this.approvals] }
  getApproval(id: string): ApprovalItem | undefined { return this.approvals.find(a => a.id === id) }
  addApproval(approval: ApprovalItem): void { this.approvals.push(approval) }
  updateApproval(id: string, status: ApprovalItem['status']): void {
    const idx = this.approvals.findIndex(a => a.id === id)
    if (idx >= 0) this.approvals[idx].status = status
  }

  // Workflow methods
  getWorkflows(): Workflow[] { return [...this.workflows] }
  getWorkflow(id: string): Workflow | undefined { return this.workflows.find(w => w.id === id) }
  addWorkflow(workflow: Workflow): void { this.workflows.push(workflow) }
  updateWorkflow(id: string, updates: Partial<Workflow>): void {
    const idx = this.workflows.findIndex(w => w.id === id)
    if (idx >= 0) this.workflows[idx] = { ...this.workflows[idx], ...updates }
  }

  getStats(): DashboardStats {
    const recentActivity = [
      ...this.agents.slice(0, 3).map(a => ({
        id: `act-${a.id}`,
        type: 'agent' as const,
        title: `${a.name} - ${a.status}`,
        description: a.task,
        timestamp: a.lastActivity
      })),
      ...this.approvals.slice(0, 2).map(a => ({
        id: `act-${a.id}`,
        type: 'approval' as const,
        title: `${a.type}: ${a.title}`,
        description: `Requested by ${a.requestedBy}`,
        timestamp: a.requestedAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return {
      activeAgents: this.agents.filter(a => a.status === 'running').length,
      totalAgents: this.agents.length,
      pendingApprovals: this.approvals.filter(a => a.status === 'pending').length,
      activeWorkflows: this.workflows.filter(w => w.status === 'active').length,
      toolsActive: this.tools.filter(t => t.status === 'active').length,
      recentActivity
    }
  }
}

export const store = new DataStore()
