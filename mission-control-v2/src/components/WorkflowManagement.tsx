import React, { useState } from 'react';
import type { Workflow } from '../types';
import { 
  GitBranch, Play, Pause, RefreshCw, Plus, X, Check, Trash2,
  Clock, ChevronRight, Calendar, AlertCircle 
} from './Icons';
import { formatTimeAgo, getStatusTextColor } from '../utils/helpers';

interface WorkflowCardProps {
  workflow: Workflow;
  onToggle: (id: string) => void;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, onToggle, onRun, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const isActive = workflow.status === 'active';

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive ? 'bg-green-100' : workflow.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            <GitBranch size={20} className={
              isActive ? 'text-green-600' : workflow.status === 'error' ? 'text-red-600' : 'text-gray-600'
            } />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
            <p className="text-sm text-gray-500">{workflow.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${getStatusTextColor(workflow.status)}`}>
                {workflow.status}
              </span>
              {workflow.status === 'error' && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Error
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(workflow.id)}
            className={`p-2 rounded-lg transition-colors ${
              isActive ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'
            }`}
            title={isActive ? 'Pause' : 'Activate'}
          >
            {isActive ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={() => onRun(workflow.id)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Run now"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => onDelete(workflow.id)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              Runs: {workflow.runCount}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {workflow.lastRun ? formatTimeAgo(workflow.lastRun) : 'Never'}
            </span>
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            {expanded ? 'Less' : 'More'}
            <ChevronRight size={14} className={`transform transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        {expanded && (
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Trigger: </span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{workflow.trigger}</span>
            </div>
            <div>
              <span className="text-gray-600">Actions:</span>
              <ol className="mt-1 space-y-1">
                {workflow.actions.map((action, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium">
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </div>
            <div className="text-xs text-gray-400">
              Created {formatTimeAgo(workflow.createdAt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, trigger: string, actions: string[]) => void;
}

const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('');
  const [actions, setActions] = useState<string[]>(['']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validActions = actions.filter(a => a.trim() !== '');
    if (validActions.length === 0) return;
    onCreate(name, description, trigger, validActions);
    setName('');
    setDescription('');
    setTrigger('');
    setActions(['']);
    onClose();
  };

  const addAction = () => setActions([...actions, '']);
  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };
  const updateAction = (index: number, value: string) => {
    const newActions = [...actions];
    newActions[index] = value;
    setActions(newActions);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">Create New Workflow</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Morning Market Scan"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={2}
              placeholder="What does this workflow do?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="input"
              required
            >
              <option value="">Select trigger...</option>
              <option value="schedule: 0 8 * * 1-5">Daily at 8:00 AM (Weekdays)</option>
              <option value="schedule: 0 16 * * 1-5">Daily at 4:00 PM (Weekdays)</option>
              <option value="event: market_open">Market Open</option>
              <option value="event: market_close">Market Close</option>
              <option value="interval: 3600">Every Hour</option>
              <option value="interval: 1800">Every 30 Minutes</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => updateAction(index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Action ${index + 1}`}
                    required
                  />
                  {actions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAction}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Plus size={14} />
              Add Action
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              <Check size={18} className="mr-2" />
              Create Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface WorkflowManagementProps {
  workflows: Workflow[];
  onToggle: (id: string) => void;
  onRun: (id: string) => void;
  onCreate: (name: string, description: string, trigger: string, actions: string[]) => void;
  onDelete: (id: string) => void;
}

export const WorkflowManagement: React.FC<WorkflowManagementProps> = ({
  workflows, onToggle, onRun, onCreate, onDelete
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<Workflow['status'] | 'all'>('all');

  const filteredWorkflows = filter === 'all' ? workflows : workflows.filter(w => w.status === filter);
  
  const statusCounts = {
    all: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    paused: workflows.filter(w => w.status === 'paused').length,
    error: workflows.filter(w => w.status === 'error').length,
    completed: workflows.filter(w => w.status === 'completed').length
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['all', 'active', 'paused', 'error', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-1.5 text-xs opacity-75">({statusCounts[status]})</span>
            </button>
          ))}
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary whitespace-nowrap"
        >
          <Plus size={18} className="mr-2" />
          New Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredWorkflows.map(workflow => (
          <WorkflowCard 
            key={workflow.id} 
            workflow={workflow}
            onToggle={onToggle}
            onRun={onRun}
            onDelete={onDelete}
          />
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <GitBranch size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No workflows found</p>
        </div>
      )}

      <CreateWorkflowModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={onCreate}
      />
    </div>
  );
};
