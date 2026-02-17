import type { AgentStatus, ToolStatus, WorkflowStatus, PriorityLevel, ApprovalType, ApprovalStatus } from '../types';

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 172800) return '1 day ago';
  return `${Math.floor(seconds / 86400)} days ago`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function getStatusColor(status: AgentStatus | ToolStatus | WorkflowStatus | ApprovalStatus): string {
  const colors: Record<string, string> = {
    running: 'bg-green-500',
    active: 'bg-green-500',
    idle: 'bg-gray-400',
    inactive: 'bg-gray-400',
    error: 'bg-red-500',
    completed: 'bg-blue-500',
    paused: 'bg-amber-500',
    pending: 'bg-amber-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500'
  };
  return colors[status] || 'bg-gray-400';
}

export function getStatusTextColor(status: AgentStatus | ToolStatus | WorkflowStatus | ApprovalStatus): string {
  const colors: Record<string, string> = {
    running: 'text-green-700 bg-green-50',
    active: 'text-green-700 bg-green-50',
    idle: 'text-gray-600 bg-gray-100',
    inactive: 'text-gray-600 bg-gray-100',
    error: 'text-red-700 bg-red-50',
    completed: 'text-blue-700 bg-blue-50',
    paused: 'text-amber-700 bg-amber-50',
    pending: 'text-amber-700 bg-amber-50',
    approved: 'text-green-700 bg-green-50',
    rejected: 'text-red-700 bg-red-50'
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
}

export function getPriorityColor(priority: PriorityLevel): string {
  const colors: Record<PriorityLevel, string> = {
    low: 'text-blue-700 bg-blue-50',
    medium: 'text-gray-700 bg-gray-100',
    high: 'text-orange-700 bg-orange-50',
    urgent: 'text-red-700 bg-red-50'
  };
  return colors[priority];
}

export function getApprovalTypeIcon(type: ApprovalType): string {
  const icons: Record<ApprovalType, string> = {
    trade: 'TrendingUp',
    expense: 'DollarSign',
    action: 'Zap',
    workflow: 'GitBranch'
  };
  return icons[type];
}

export function getApprovalTypeLabel(type: ApprovalType): string {
  const labels: Record<ApprovalType, string> = {
    trade: 'Trade',
    expense: 'Expense',
    action: 'Action',
    workflow: 'Workflow'
  };
  return labels[type];
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
