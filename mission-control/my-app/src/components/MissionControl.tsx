'use client'

import { useState, useEffect } from 'react'
import type { DashboardStats, Agent, Tool, ApprovalItem, Workflow } from '../types/index'
import { 
  Activity, 
  Bot, 
  Wrench, 
  ClipboardCheck, 
  Workflow as WorkflowIcon, 
  Menu, 
  X,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Play,
  Pause,
  Settings,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sun,
  Moon
} from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck },
  { id: 'workflows', label: 'Workflows', icon: WorkflowIcon },
]

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Modal states
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [showToolModal, setShowToolModal] = useState(false)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  // Form states
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentTask, setNewAgentTask] = useState('')
  const [newToolName, setNewToolName] = useState('')
  const [newToolDescription, setNewToolDescription] = useState('')
  const [newToolCategory, setNewToolCategory] = useState('Utilities')
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('')
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState('manual')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, agentsRes, toolsRes, approvalsRes, workflowsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/agents'),
        fetch('/api/tools'),
        fetch('/api/approvals'),
        fetch('/api/workflows'),
      ])
      
      setStats(await statsRes.json())
      setAgents(await agentsRes.json())
      setTools(await toolsRes.json())
      setApprovals(await approvalsRes.json())
      setWorkflows(await workflowsRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    await fetch('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchData()
  }

  const spawnAgent = async () => {
    if (!newAgentName.trim() || !newAgentTask.trim()) return
    
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      status: 'running',
      task: newAgentTask,
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      progress: 0
    }
    
    await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAgent),
    })
    
    setNewAgentName('')
    setNewAgentTask('')
    setShowAgentModal(false)
    fetchData()
  }

  const createTool = async () => {
    if (!newToolName.trim() || !newToolDescription.trim()) return
    
    const newTool: Tool = {
      id: `tool-${Date.now()}`,
      name: newToolName,
      description: newToolDescription,
      category: newToolCategory,
      status: 'active',
      usageCount: 0,
      lastUsed: new Date().toISOString()
    }
    
    await fetch('/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTool),
    })
    
    setNewToolName('')
    setNewToolDescription('')
    setNewToolCategory('Utilities')
    setShowToolModal(false)
    fetchData()
  }

  const createWorkflow = async () => {
    if (!newWorkflowName.trim() || !newWorkflowDescription.trim()) return
    
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: newWorkflowName,
      description: newWorkflowDescription,
      status: 'active',
      trigger: newWorkflowTrigger,
      actions: [
        { id: `action-${Date.now()}`, type: 'notification', config: { message: 'Workflow started' }, order: 1 }
      ],
      runCount: 0,
      createdAt: new Date().toISOString()
    }
    
    await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkflow),
    })
    
    setNewWorkflowName('')
    setNewWorkflowDescription('')
    setNewWorkflowTrigger('manual')
    setShowWorkflowModal(false)
    fetchData()
  }

  const deleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return
    await fetch(`/api/agents?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'active':
      case 'approved':
        return 'text-green-500 bg-green-500/10'
      case 'idle':
      case 'paused':
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'error':
      case 'rejected':
        return 'text-red-500 bg-red-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-lg">Mission Control</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="hidden lg:flex items-center gap-2 p-4 border-b border-border">
            <Zap className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg">Mission Control</span>
          </div>
          
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.id 
                      ? "bg-blue-500/10 text-blue-400" 
                      : "text-muted-foreground hover:text-foreground hover:bg-border"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {item.id === 'approvals' && approvals.filter(a => a.status === 'pending').length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {approvals.filter(a => a.status === 'pending').length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Online
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-auto">
          <div className="p-4 lg:p-8">
            {/* Dashboard View */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleString()}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard 
                    title="Active Agents" 
                    value={stats.activeAgents} 
                    total={stats.totalAgents}
                    icon={Bot}
                    color="blue"
                    onClick={() => setActiveTab('agents')}
                  />
                  <StatCard 
                    title="Pending Approvals" 
                    value={stats.pendingApprovals}
                    icon={ClipboardCheck}
                    color="red"
                    onClick={() => setActiveTab('approvals')}
                  />
                  <StatCard 
                    title="Active Workflows" 
                    value={stats.activeWorkflows}
                    icon={WorkflowIcon}
                    color="purple"
                    onClick={() => setActiveTab('workflows')}
                  />
                  <StatCard 
                    title="Tools Active" 
                    value={stats.toolsActive}
                    icon={Wrench}
                    color="green"
                    onClick={() => setActiveTab('tools')}
                  />
                  <StatCard 
                    title="System Status" 
                    value="Online"
                    icon={CheckCircle}
                    color="emerald"
                  />
                </div>

                {/* Recent Activity */}
                <div className="bg-card rounded-xl border border-border">
                  <div className="p-4 border-b border-border">
                    <h2 className="font-semibold">Recent Activity</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="p-4 flex items-start gap-3">
                        <div className="mt-1">
                          {activity.type === 'agent' && <Bot className="w-4 h-4 text-blue-400" />}
                          {activity.type === 'approval' && <ClipboardCheck className="w-4 h-4 text-yellow-400" />}
                          {activity.type === 'workflow' && <WorkflowIcon className="w-4 h-4 text-purple-400" />}
                          {activity.type === 'tool' && <Wrench className="w-4 h-4 text-green-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <QuickAction icon={Plus} label="Spawn Agent" color="blue" onClick={() => setShowAgentModal(true)} />
                  <QuickAction icon={Plus} label="Create Tool" color="green" onClick={() => setShowToolModal(true)} />
                  <QuickAction icon={Plus} label="New Workflow" color="purple" onClick={() => setShowWorkflowModal(true)} />
                  <QuickAction icon={Settings} label="Settings" color="slate" onClick={() => setShowSettingsModal(true)} />
                </div>
              </div>
            )}

            {/* Agents View */}
            {activeTab === 'agents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Sub-Agents</h1>
                  <button 
                    onClick={() => setShowAgentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Spawn Agent
                  </button>
                </div>

                <div className="grid gap-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center">
                            <Bot className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground">{agent.task}</p>
                          </div>
                        </div>
                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", getStatusColor(agent.status))}>
                          {agent.status}
                        </span>
                      </div>
                      {agent.progress !== undefined && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{agent.progress}%</span>
                          </div>
                          <div className="h-2 bg-border rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${agent.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Started: {new Date(agent.startedAt).toLocaleString()}</span>
                        <span>Last activity: {new Date(agent.lastActivity).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools View */}
            {activeTab === 'tools' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Custom Tools</h1>
                  <button 
                    onClick={() => setShowToolModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Build Tool
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {tools.map((tool) => (
                    <div key={tool.id} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground">{tool.category}</p>
                          </div>
                        </div>
                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", getStatusColor(tool.status))}>
                          {tool.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-foreground">{tool.description}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Used {tool.usageCount} times</span>
                        {tool.lastUsed && (
                          <span>Last used: {new Date(tool.lastUsed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approvals View */}
            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Approvals Queue</h1>
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm">
                    {approvals.filter(a => a.status === 'pending').length} pending
                  </span>
                </div>

                <div className="grid gap-4">
                  {approvals.map((approval) => (
                    <div key={approval.id} className={cn(
                      "bg-card rounded-xl border p-4",
                      approval.status === 'pending' ? "border-yellow-500/30" : "border-border"
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center">
                            {approval.type === 'trade' && <TrendingUp className="w-5 h-5 text-blue-400" />}
                            {approval.type === 'expense' && <AlertCircle className="w-5 h-5 text-red-400" />}
                            {approval.type === 'action' && <Zap className="w-5 h-5 text-yellow-400" />}
                            {approval.type === 'workflow' && <WorkflowIcon className="w-5 h-5 text-purple-400" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{approval.title}</h3>
                            <p className="text-sm text-muted-foreground">{approval.description}</p>
                          </div>
                        </div>
                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", getPriorityColor(approval.priority))}>
                          {approval.priority}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          <span>Requested by {approval.requestedBy}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(approval.requestedAt).toLocaleString()}</span>
                        </div>
                        
                        {approval.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproval(approval.id, 'rejected')}
                              className="px-4 py-2 bg-border hover:bg-input rounded-lg text-sm font-medium transition-colors"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => handleApproval(approval.id, 'approved')}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            approval.status === 'approved' ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"
                          )}>
                            {approval.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workflows View */}
            {activeTab === 'workflows' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Workflow Automation</h1>
                  <button 
                    onClick={() => setShowWorkflowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Workflow
                  </button>
                </div>

                <div className="grid gap-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center">
                            <WorkflowIcon className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{workflow.name}</h3>
                            <p className="text-sm text-muted-foreground">{workflow.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-medium", getStatusColor(workflow.status))}>
                            {workflow.status}
                          </span>
                          <button className="p-2 hover:bg-border rounded-lg transition-colors">
                            {workflow.status === 'active' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-1 bg-border rounded text-xs text-muted-foreground">
                          {workflow.trigger}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm text-muted-foreground">
                          {workflow.actions.length} actions
                        </span>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Run {workflow.runCount} times</span>
                        {workflow.lastRun && (
                          <span>Last run: {new Date(workflow.lastRun).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Spawn Agent Modal */}
      <Modal isOpen={showAgentModal} onClose={() => setShowAgentModal(false)} title="Spawn New Agent">
        <div className="space-y-4">
          <Input
            label="Agent Name"
            value={newAgentName}
            onChange={setNewAgentName}
            placeholder="e.g., Research Assistant"
          />
          <TextArea
            label="Task Description"
            value={newAgentTask}
            onChange={setNewAgentTask}
            placeholder="What should this agent do?"
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={spawnAgent} disabled={!newAgentName.trim() || !newAgentTask.trim()}>
              Spawn Agent
            </Button>
            <Button onClick={() => setShowAgentModal(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Tool Modal */}
      <Modal isOpen={showToolModal} onClose={() => setShowToolModal(false)} title="Create New Tool">
        <div className="space-y-4">
          <Input
            label="Tool Name"
            value={newToolName}
            onChange={setNewToolName}
            placeholder="e.g., Web Scraper"
          />
          <TextArea
            label="Description"
            value={newToolDescription}
            onChange={setNewToolDescription}
            placeholder="What does this tool do?"
          />
          <Select
            label="Category"
            value={newToolCategory}
            onChange={setNewToolCategory}
            options={[
              { value: 'Trading', label: 'Trading' },
              { value: 'Communication', label: 'Communication' },
              { value: 'Utilities', label: 'Utilities' },
              { value: 'Automation', label: 'Automation' },
            ]}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={createTool} disabled={!newToolName.trim() || !newToolDescription.trim()}>
              Create Tool
            </Button>
            <Button onClick={() => setShowToolModal(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Workflow Modal */}
      <Modal isOpen={showWorkflowModal} onClose={() => setShowWorkflowModal(false)} title="Create New Workflow">
        <div className="space-y-4">
          <Input
            label="Workflow Name"
            value={newWorkflowName}
            onChange={setNewWorkflowName}
            placeholder="e.g., Daily Report"
          />
          <TextArea
            label="Description"
            value={newWorkflowDescription}
            onChange={setNewWorkflowDescription}
            placeholder="What does this workflow automate?"
          />
          <Select
            label="Trigger"
            value={newWorkflowTrigger}
            onChange={setNewWorkflowTrigger}
            options={[
              { value: 'manual', label: 'Manual (Run on demand)' },
              { value: 'cron', label: 'Scheduled (Daily/Weekly)' },
              { value: 'event', label: 'Event-based (On trigger)' },
            ]}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={createWorkflow} disabled={!newWorkflowName.trim() || !newWorkflowDescription.trim()}>
              Create Workflow
            </Button>
            <Button onClick={() => setShowWorkflowModal(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Settings">
        <div className="space-y-4">
          <ThemeToggle />
          <div className="p-3 bg-border rounded-lg">
            <h4 className="font-medium mb-1">Auto-refresh</h4>
            <p className="text-sm text-muted-foreground">Dashboard updates every 5 seconds</p>
          </div>
          <div className="p-3 bg-border rounded-lg">
            <h4 className="font-medium mb-1">Notifications</h4>
            <p className="text-sm text-muted-foreground">Slack integration active</p>
          </div>
          <div className="p-3 bg-border rounded-lg">
            <h4 className="font-medium mb-1">Version</h4>
            <p className="text-sm text-muted-foreground">Mission Control v1.0.0</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => setShowSettingsModal(false)} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function StatCard({ title, value, total, icon: Icon, color, onClick }: { 
  title: string
  value: string | number
  total?: number
  icon: React.ElementType
  color: string
  onClick?: () => void
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10',
    red: 'text-red-400 bg-red-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    green: 'text-green-400 bg-green-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    slate: 'text-muted-foreground bg-muted-foreground/10',
  }

  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "w-full text-left bg-card rounded-xl border border-border p-4 transition-all",
        onClick && "cursor-pointer hover:border-slate-600 hover:bg-border/50 active:scale-[0.98]"
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {total !== undefined && (
          <span className="text-xs text-muted-foreground">of {total}</span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </button>
  )
}

function QuickAction({ icon: Icon, label, color, onClick }: { icon: React.ElementType, label: string, color: string, onClick?: () => void }) {
  const colorClasses: Record<string, string> = {
    blue: 'hover:bg-blue-500/10 hover:border-blue-500/30',
    green: 'hover:bg-green-500/10 hover:border-green-500/30',
    purple: 'hover:bg-purple-500/10 hover:border-purple-500/30',
    slate: 'hover:bg-muted-foreground/10 hover:border-muted-foreground/30',
  }

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-4 bg-card rounded-xl border border-border transition-all",
        colorClasses[color],
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

// Modal Components
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-border rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = "text" }: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-border border border-input rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 bg-border border border-input rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
      />
    </div>
  )
}

function Select({ label, value, onChange, options }: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-border border border-input rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function Button({ onClick, children, variant = 'primary', disabled = false }: { 
  onClick: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-muted hover:bg-muted/80 text-foreground',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant]
      )}
    >
      {children}
    </button>
  )
}

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  return (
    <div className="p-3 bg-border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <div>
            <h4 className="font-medium">Theme</h4>
            <p className="text-sm text-muted-foreground">{theme === 'dark' ? 'Dark' : 'Light'} mode active</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="hidden sm:inline">Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
          <span className="sm:hidden">Toggle</span>
        </button>
      </div>
    </div>
  )
}
