import React, { useState } from 'react';
import type { Approval, PriorityLevel, ApprovalType } from '../types';
import {
  Shield, Check, X, TrendingUp, DollarSign, Zap, GitBranch,
  Clock, AlertCircle, ChevronDown, History
} from './Icons';
import { formatTimeAgo, getPriorityColor, getApprovalTypeLabel } from '../utils/helpers';

const typeIcons: Record<ApprovalType, React.ReactNode> = {
  trade: <TrendingUp size={16} />,
  expense: <DollarSign size={16} />,
  action: <Zap size={16} />,
  workflow: <GitBranch size={16} />
};

interface ApprovalCardProps {
  approval: Approval;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ approval, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const isPending = approval.status === 'pending';

  return (
    <div className={`card p-4 ${!isPending ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          approval.type === 'trade' ? 'bg-blue-100 text-blue-600' :
          approval.type === 'expense' ? 'bg-green-100 text-green-600' :
          approval.type === 'action' ? 'bg-purple-100 text-purple-600' :
          'bg-orange-100 text-orange-600'
        }`}>
          {typeIcons[approval.type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-gray-900">{approval.title}</h4>
              <p className="text-sm text-gray-500">{approval.description}</p>
            </div>
            <span className={`badge ${getPriorityColor(approval.priority)} whitespace-nowrap`}>
              {approval.priority}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              {typeIcons[approval.type]}
              {getApprovalTypeLabel(approval.type)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatTimeAgo(approval.requestedAt)}
            </span>
            <span>by {approval.requestedBy}</span>
          </div>

          {approval.amount && (
            <div className="mt-2 text-sm">
              <span className="text-gray-600">Amount: </span>
              <span className="font-semibold text-gray-900">
                ${approval.amount.toLocaleString()}
              </span>
            </div>
          )}

          {approval.data && Object.keys(approval.data).length > 0 && (
            <div className="mt-2">
              <button 
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                {expanded ? 'Hide' : 'Show'} details
                <ChevronDown size={12} className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              
              {expanded && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs">
                  {Object.entries(approval.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {isPending ? (
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => onApprove(approval.id)}
                className="btn-success flex-1 py-2 text-sm"
              >
                <Check size={16} className="mr-1.5" />
                Approve
              </button>
              <button 
                onClick={() => onReject(approval.id)}
                className="btn-danger flex-1 py-2 text-sm"
              >
                <X size={16} className="mr-1.5" />
                Reject
              </button>
            </div>
          ) : (
            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              approval.status === 'approved' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {approval.status === 'approved' ? <Check size={16} /> : <X size={16} />}
              {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ApprovalQueueProps {
  pendingApprovals: Approval[];
  approvalHistory: Approval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  pendingApprovals, approvalHistory, onApprove, onReject
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ApprovalType | 'all'>('all');

  const approvals = activeTab === 'pending' ? pendingApprovals : approvalHistory;
  
  const filteredApprovals = approvals.filter(a => {
    const priorityMatch = priorityFilter === 'all' || a.priority === priorityFilter;
    const typeMatch = typeFilter === 'all' || a.type === typeFilter;
    return priorityMatch && typeMatch;
  });

  // Sort pending by priority (urgent first), then history by date
  const sortedApprovals = [...filteredApprovals].sort((a, b) => {
    if (activeTab === 'pending') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.requestedAt.getTime() - a.requestedAt.getTime();
  });

  const urgentCount = pendingApprovals.filter(a => a.priority === 'urgent').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'pending' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending
            <span className="bg-primary-200 text-primary-800 px-2 py-0.5 rounded-full text-xs">
              {pendingApprovals.length}
            </span>
            {urgentCount > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                <AlertCircle size={10} />
                {urgentCount} urgent
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <History size={16} />
            History
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityLevel | 'all')}
          className="input py-2 px-3 text-sm w-auto"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ApprovalType | 'all')}
          className="input py-2 px-3 text-sm w-auto"
        >
          <option value="all">All Types</option>
          <option value="trade">Trade</option>
          <option value="expense">Expense</option>
          <option value="action">Action</option>
          <option value="workflow">Workflow</option>
        </select>
      </div>

      <div className="space-y-3">
        {sortedApprovals.map(approval => (
          <ApprovalCard 
            key={approval.id} 
            approval={approval}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>

      {sortedApprovals.length === 0 && (
        <div className="text-center py-12">
          <Shield size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {activeTab === 'pending' ? 'No pending approvals' : 'No approval history'}
          </p>
        </div>
      )}
    </div>
  );
};
