import { useState, useCallback, useEffect } from 'react';
import type { Agent, AgentStatus, Tool, ToolStatus, Approval, ApprovalStatus, Workflow, WorkflowStatus, Activity, SystemStats } from '../types';
import { mockAgents, mockTools, mockApprovals, mockWorkflows, mockActivities, mockSystemStats } from '../data/mockData';

// Agent Management Hook
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);

  const spawnAgent = useCallback((name: string, task: string, description?: string) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name,
      task,
      description,
      status: 'idle',
      progress: 0,
      startTime: new Date(),
      lastActivity: new Date()
    };
    setAgents(prev => [newAgent, ...prev]);
    return newAgent.id;
  }, []);

  const killAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  }, []);

  const stopAgent = useCallback((id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'idle' as AgentStatus, progress: 0 } : a
    ));
  }, []);

  const startAgent = useCallback((id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'running' as AgentStatus } : a
    ));
  }, []);

  const updateAgentProgress = useCallback((id: string, progress: number) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, progress: Math.min(100, Math.max(0, progress)) } : a
    ));
  }, []);

  return {
    agents,
    spawnAgent,
    killAgent,
    stopAgent,
    startAgent,
    updateAgentProgress
  };
}

// Tool Management Hook
export function useTools() {
  const [tools, setTools] = useState<Tool[]>(mockTools);

  const toggleTool = useCallback((id: string) => {
    setTools(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === 'active' ? 'inactive' as ToolStatus : 'active' as ToolStatus }
        : t
    ));
  }, []);

  const updateToolConfig = useCallback((id: string, config: Record<string, any>) => {
    setTools(prev => prev.map(t => 
      t.id === id ? { ...t, config: { ...t.config, ...config } } : t
    ));
  }, []);

  const incrementToolUsage = useCallback((id: string) => {
    setTools(prev => prev.map(t => 
      t.id === id 
        ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date() }
        : t
    ));
  }, []);

  const createTool = useCallback((name: string, description: string, config: Record<string, any>) => {
    const newTool: Tool = {
      id: `tool-${Date.now()}`,
      name,
      description,
      status: 'inactive',
      usageCount: 0,
      lastUsed: null,
      config
    };
    setTools(prev => [...prev, newTool]);
    return newTool.id;
  }, []);

  return {
    tools,
    toggleTool,
    updateToolConfig,
    incrementToolUsage,
    createTool
  };
}

// Approval Queue Hook
export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);

  const approve = useCallback((id: string) => {
    setApprovals(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'approved' as ApprovalStatus } : a
    ));
  }, []);

  const reject = useCallback((id: string) => {
    setApprovals(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'rejected' as ApprovalStatus } : a
    ));
  }, []);

  const createApproval = useCallback((approval: Omit<Approval, 'id' | 'requestedAt' | 'status'>) => {
    const newApproval: Approval = {
      ...approval,
      id: `appr-${Date.now()}`,
      requestedAt: new Date(),
      status: 'pending'
    };
    setApprovals(prev => [newApproval, ...prev]);
    return newApproval.id;
  }, []);

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const approvalHistory = approvals.filter(a => a.status !== 'pending');

  return {
    approvals,
    pendingApprovals,
    approvalHistory,
    approve,
    reject,
    createApproval
  };
}

// Workflow Management Hook
export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);

  const toggleWorkflow = useCallback((id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id 
        ? { ...w, status: w.status === 'active' ? 'paused' as WorkflowStatus : 'active' as WorkflowStatus }
        : w
    ));
  }, []);

  const runWorkflow = useCallback((id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id 
        ? { ...w, lastRun: new Date(), runCount: w.runCount + 1 }
        : w
    ));
  }, []);

  const createWorkflow = useCallback((name: string, description: string, trigger: string, actions: string[]) => {
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name,
      description,
      trigger,
      actions,
      status: 'paused',
      runCount: 0,
      lastRun: null,
      createdAt: new Date()
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    return newWorkflow.id;
  }, []);

  const deleteWorkflow = useCallback((id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  }, []);

  return {
    workflows,
    toggleWorkflow,
    runWorkflow,
    createWorkflow,
    deleteWorkflow
  };
}

// Activity Feed Hook
export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  const addActivity = useCallback((type: Activity['type'], message: string, metadata?: Record<string, any>) => {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      metadata
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep last 100
  }, []);

  return {
    activities,
    addActivity
  };
}

// System Stats Hook
export function useSystemStats() {
  const [stats, setStats] = useState<SystemStats>(mockSystemStats);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        uptime: prev.uptime + 1000
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateStats = useCallback((newStats: Partial<SystemStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  }, []);

  return {
    stats,
    updateStats
  };
}
