import React, { useState } from 'react';
import type { Tool } from '../types';
import { 
  Wrench, TrendingUp, BarChart3, MessageSquare, Calendar, 
  Search, Newspaper, Settings, Plus, X, Check
} from './Icons';
import { formatTimeAgo, getStatusTextColor } from '../utils/helpers';

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  TrendingUp,
  BarChart3,
  MessageSquare,
  Calendar,
  Search,
  Newspaper,
  Settings
};

interface ToolCardProps {
  tool: Tool;
  onToggle: (id: string) => void;
  onEdit: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onToggle, onEdit }) => {
  const IconComponent = tool.icon ? iconMap[tool.icon] : Wrench;
  const isActive = tool.status === 'active';

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isActive ? 'bg-green-100' : tool.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          {IconComponent ? (
            <IconComponent size={20} className={
              isActive ? 'text-green-600' : tool.status === 'error' ? 'text-red-600' : 'text-gray-600'
            } />
          ) : (
            <Wrench size={20} className="text-gray-600" />
          )}
        </div>
        <button
          onClick={() => onToggle(tool.id)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isActive ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <h4 className="font-semibold text-gray-900">{tool.name}</h4>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tool.description}</p>
      
      <div className="mt-3 flex items-center gap-2">
        <span className={`badge ${getStatusTextColor(tool.status)}`}>
          {tool.status}
        </span>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Usage</span>
          <span className="font-medium text-gray-900">{tool.usageCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Last used</span>
          <span className="font-medium text-gray-900">
            {tool.lastUsed ? formatTimeAgo(tool.lastUsed) : 'Never'}
          </span>
        </div>
      </div>
      
      <button 
        onClick={() => onEdit(tool)}
        className="mt-3 w-full py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        <Settings size={14} />
        Configure
      </button>
    </div>
  );
};

interface ToolConfigModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, config: Record<string, any>) => void;
}

const ToolConfigModal: React.FC<ToolConfigModalProps> = ({ tool, isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<Record<string, any>>({});

  React.useEffect(() => {
    if (tool) {
      setConfig(tool.config);
    }
  }, [tool]);

  if (!isOpen || !tool) return null;

  const handleSave = () => {
    onSave(tool.id, config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Configure {tool.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(config).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {typeof value === 'boolean' ? (
                <button
                  onClick={() => setConfig({ ...config, [key]: !value })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  className="input"
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary flex-1">
              <Check size={18} className="mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CreateToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, config: Record<string, any>) => void;
}

const CreateToolModal: React.FC<CreateToolModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [configJson, setConfigJson] = useState('{}');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = JSON.parse(configJson);
      onCreate(name, description, config);
      setName('');
      setDescription('');
      setConfigJson('{}');
      onClose();
    } catch {
      alert('Invalid JSON config');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Create New Tool</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Custom API"
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
              placeholder="What does this tool do?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Config (JSON)</label>
            <textarea
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              className="input font-mono text-sm"
              rows={4}
              placeholder='{"key": "value"}'
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              <Plus size={18} className="mr-2" />
              Create Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ToolManagementProps {
  tools: Tool[];
  onToggle: (id: string) => void;
  onUpdateConfig: (id: string, config: Record<string, any>) => void;
  onCreate: (name: string, description: string, config: Record<string, any>) => void;
}

export const ToolManagement: React.FC<ToolManagementProps> = ({
  tools, onToggle, onUpdateConfig, onCreate
}) => {
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<Tool['status'] | 'all'>('all');

  const filteredTools = filter === 'all' ? tools : tools.filter(t => t.status === filter);
  
  const statusCounts = {
    all: tools.length,
    active: tools.filter(t => t.status === 'active').length,
    inactive: tools.filter(t => t.status === 'inactive').length,
    error: tools.filter(t => t.status === 'error').length
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['all', 'active', 'inactive', 'error'] as const).map(status => (
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
          Add Tool
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map(tool => (
          <ToolCard 
            key={tool.id} 
            tool={tool} 
            onToggle={onToggle}
            onEdit={setEditingTool}
          />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No tools found</p>
        </div>
      )}

      <ToolConfigModal
        tool={editingTool}
        isOpen={!!editingTool}
        onClose={() => setEditingTool(null)}
        onSave={onUpdateConfig}
      />

      <CreateToolModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={onCreate}
      />
    </div>
  );
};
