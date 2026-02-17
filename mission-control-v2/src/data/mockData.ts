import type { Agent, Tool, Approval, Workflow, Activity, SystemStats } from '../types';

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Scanner Agent',
    task: 'Market scanning for breakout setups',
    status: 'running',
    progress: 78,
    startTime: new Date(Date.now() - 1000 * 60 * 45),
    lastActivity: new Date(Date.now() - 1000 * 60 * 2),
    description: 'Scans market for momentum stocks and breakout patterns'
  },
  {
    id: 'agent-2',
    name: 'Trade Proposer',
    task: 'Building trade proposals',
    status: 'idle',
    progress: 0,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    lastActivity: new Date(Date.now() - 1000 * 60 * 15),
    description: 'Analyzes setups and builds detailed trade proposals'
  },
  {
    id: 'agent-3',
    name: 'Review Agent',
    task: 'Reviewing trade proposals',
    status: 'running',
    progress: 45,
    startTime: new Date(Date.now() - 1000 * 60 * 30),
    lastActivity: new Date(Date.now() - 1000 * 30),
    description: 'Validates trade proposals against risk criteria'
  },
  {
    id: 'agent-4',
    name: 'Risk Monitor',
    task: 'Portfolio risk monitoring',
    status: 'running',
    progress: 92,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 4),
    lastActivity: new Date(Date.now() - 1000 * 60),
    description: 'Monitors portfolio heat and risk exposure'
  },
  {
    id: 'agent-5',
    name: 'Data Sync',
    task: 'Syncing market data',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 6),
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 5),
    description: 'Synchronizes market data and price feeds'
  },
  {
    id: 'agent-6',
    name: 'Report Generator',
    task: 'Generating daily report',
    status: 'error',
    progress: 34,
    startTime: new Date(Date.now() - 1000 * 60 * 20),
    lastActivity: new Date(Date.now() - 1000 * 60 * 5),
    description: 'Generates daily and weekly trading reports'
  }
];

export const mockTools: Tool[] = [
  {
    id: 'tool-1',
    name: 'Alpaca API',
    description: 'Brokerage integration for trade execution',
    status: 'active',
    usageCount: 1247,
    lastUsed: new Date(Date.now() - 1000 * 60 * 5),
    config: { endpoint: 'paper-api.alpaca.markets', mode: 'paper' },
    icon: 'TrendingUp'
  },
  {
    id: 'tool-2',
    name: 'Yahoo Finance',
    description: 'Market data and historical prices',
    status: 'active',
    usageCount: 3892,
    lastUsed: new Date(Date.now() - 1000 * 60 * 2),
    config: { cacheEnabled: true, cacheDuration: 300 },
    icon: 'BarChart3'
  },
  {
    id: 'tool-3',
    name: 'Slack Integration',
    description: 'Notifications and approval requests',
    status: 'active',
    usageCount: 567,
    lastUsed: new Date(Date.now() - 1000 * 60 * 10),
    config: { channel: '#trading-alerts', webhook: 'configured' },
    icon: 'MessageSquare'
  },
  {
    id: 'tool-4',
    name: 'Earnings Calendar',
    description: 'Upcoming earnings dates and alerts',
    status: 'inactive',
    usageCount: 89,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
    config: { source: 'earningswhispers', autoCheck: false },
    icon: 'Calendar'
  },
  {
    id: 'tool-5',
    name: 'Web Search',
    description: 'Brave Search API for research',
    status: 'active',
    usageCount: 234,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    config: { apiKey: '***', rateLimit: 100 },
    icon: 'Search'
  },
  {
    id: 'tool-6',
    name: 'News Feed',
    description: 'Real-time market news aggregator',
    status: 'error',
    usageCount: 445,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 8),
    config: { sources: ['bloomberg', 'reuters'], filter: 'finance' },
    icon: 'Newspaper'
  }
];

export const mockApprovals: Approval[] = [
  {
    id: 'appr-1',
    type: 'trade',
    title: 'NVDA Long Breakout',
    description: 'Setup 1 Breakout - Entry $142.50, Stop $140.20, Size 15%',
    priority: 'high',
    status: 'pending',
    requestedBy: 'Trade Proposer',
    requestedAt: new Date(Date.now() - 1000 * 60 * 15),
    amount: 15000,
    data: { ticker: 'NVDA', setup: 'breakout', riskReward: '3.2:1' }
  },
  {
    id: 'appr-2',
    type: 'trade',
    title: 'TSLA Episodic Pivot',
    description: 'EP on earnings beat - Entry $245.00, Stop $238.50',
    priority: 'urgent',
    status: 'pending',
    requestedBy: 'Trade Proposer',
    requestedAt: new Date(Date.now() - 1000 * 60 * 5),
    amount: 12000,
    data: { ticker: 'TSLA', setup: 'ep', gap: '12%' }
  },
  {
    id: 'appr-3',
    type: 'action',
    title: 'Switch to Live Trading',
    description: 'Request to switch from paper to live trading mode',
    priority: 'medium',
    status: 'pending',
    requestedBy: 'System',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    data: { current: 'paper', requested: 'live' }
  },
  {
    id: 'appr-4',
    type: 'expense',
    title: 'Data Subscription',
    description: 'Polygon.io API subscription renewal',
    priority: 'low',
    status: 'pending',
    requestedBy: 'Admin',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    amount: 199,
    data: { service: 'polygon.io', period: 'monthly' }
  },
  {
    id: 'appr-5',
    type: 'workflow',
    title: 'Auto-Scan Workflow',
    description: 'Enable automated market scanning every 30 minutes',
    priority: 'medium',
    status: 'approved',
    requestedBy: 'Scanner Agent',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    data: { interval: 30, enabled: true }
  }
];

export const mockWorkflows: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Morning Market Scan',
    description: 'Daily 8:00 AM market regime and leadership scan',
    status: 'active',
    trigger: 'schedule: 0 8 * * 1-5',
    actions: ['Fetch SPY/QQQ data', 'Calculate MAs', 'Run leadership scans', 'Send briefing'],
    runCount: 127,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 15),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  },
  {
    id: 'wf-2',
    name: 'EP Opportunity Alert',
    description: 'Detect and alert on earnings gap opportunities',
    status: 'active',
    trigger: 'event: market_open',
    actions: ['Scan pre-market gaps', 'Check volume', 'Validate setup', 'Send alert'],
    runCount: 45,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 7),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
  },
  {
    id: 'wf-3',
    name: 'Portfolio Risk Check',
    description: 'Hourly portfolio heat monitoring',
    status: 'active',
    trigger: 'interval: 3600',
    actions: ['Calculate heat', 'Check exposure', 'Alert if >10%'],
    runCount: 892,
    lastRun: new Date(Date.now() - 1000 * 60 * 45),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60)
  },
  {
    id: 'wf-4',
    name: 'Daily Summary Report',
    description: 'Generate and send EOD trading summary',
    status: 'paused',
    trigger: 'schedule: 0 16 * * 1-5',
    actions: ['Compile P&L', 'Update positions', 'Generate report', 'Send to Slack'],
    runCount: 89,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45)
  },
  {
    id: 'wf-5',
    name: 'Earnings Conflict Check',
    description: 'Check for earnings on open positions',
    status: 'error',
    trigger: 'schedule: 0 6 * * 1-5',
    actions: ['Get positions', 'Check earnings calendar', 'Flag conflicts'],
    runCount: 34,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 20),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20)
  }
];

export const mockActivities: Activity[] = [
  { id: 'act-1', type: 'agent', message: 'Scanner Agent completed market scan', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 'act-2', type: 'approval', message: 'Trade proposal submitted for NVDA', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
  { id: 'act-3', type: 'workflow', message: 'Morning Market Scan triggered', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 15) },
  { id: 'act-4', type: 'tool', message: 'Alpaca API executed 2 orders', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'act-5', type: 'system', message: 'System health check passed', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
  { id: 'act-6', type: 'agent', message: 'Review Agent approved TSLA trade', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: 'act-7', type: 'workflow', message: 'Portfolio Risk Check completed', timestamp: new Date(Date.now() - 1000 * 60 * 45) },
  { id: 'act-8', type: 'tool', message: 'Yahoo Finance data sync completed', timestamp: new Date(Date.now() - 1000 * 60 * 2) }
];

export const mockSystemStats: SystemStats = {
  activeAgents: 4,
  pendingApprovals: 4,
  activeWorkflows: 3,
  toolsActive: 4,
  systemHealth: 'healthy',
  cpuUsage: 34,
  memoryUsage: 62,
  uptime: 1000 * 60 * 60 * 24 * 5 // 5 days
};
