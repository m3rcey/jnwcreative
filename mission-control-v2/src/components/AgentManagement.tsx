import React, { useState } from 'react';
import type { Agent } from '../types';
import { Robot, Play, Pause, X, Plus, MoreHorizontal, Clock } from './Icons';
import { formatTimeAgo, formatDuration, getStatusTextColor } from '../utils/helpers';

interface AgentCardProps {
  agent: Agent;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onKill: (id: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onStart, onStop, onKill }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            agent.status === 'running' ? 'bg-green-100' : 
            agent.status === 'error' ? 'bg-red-100' :
            agent.status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Robot size={20} className={
              agent.status === 'running' ? 'text-green-600' : 
              agent.status === 'error' ? 'text-red-600' :
              agent.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
            } />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{agent.name}</h4>
            <p className="text-sm text-gray-500">{agent.task}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${getStatusTextColor(agent.status)}`}>
                {agent.status}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {formatTimeAgo(agent.lastActivity)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal size={18} className="text-gray-400" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              {agent.status === 'idle' && (
                <button 
                  onClick={() => { onStart(agent.id); setShowActions(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Play size={14} className="text-green-600" />
                  Start
                </button>
              )}
              {agent.status === 'running' && (
                <button 
                  onClick={() => { onStop(agent.id); setShowActions(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Pause size={14} className="text-amber-600" />
                  Stop
                </button>
              )}
              <button 
                onClick={() => { onKill(agent.id); setShowActions(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
              >
                <X size={14} />
                Kill
              </button>
            </div>
          )}
        </div>
      </div>
      
      {agent.status === 'running' && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{agent.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${agent.progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Started {formatTimeAgo(agent.startTime)}</span>
        <span>Runtime: {formatDuration(Date.now() - agent.startTime.getTime())}</span>
      </div>
    </div>
  );
};

interface SpawnAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawn: (name: string, task: string, description: string) => void;
}

const SpawnAgentModal: React.FC<SpawnAgentModalProps> = ({ isOpen, onClose, onSpawn }) => {
  const [name, setName] = useState('');
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSpawn(name, task, description);
    setName('');
    setTask('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Spawn New Agent</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Market Scanner"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="input"
              placeholder="e.g., Scan for breakouts"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
              placeholder="Optional description..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              <Plus size={18} className="mr-2" />
              Spawn Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AgentManagementProps {
  agents: Agent[];
  onSpawn: (name: string, task: string, description: string) => void;
  onKill: (id: string) => void;
  onStop: (id: string) => void;
  onStart: (id: string) => void;
}

export const AgentManagement: React.FC<AgentManagementProps> = ({
  agents, onSpawn, onKill, onStop, onStart
}) => {
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [filter, setFilter] = useState<Agent['status'] | 'all'>('all');

  const filteredAgents = filter === 'all' ? agents : agents.filter(a => a.status === filter);
  
  const statusCounts = {
    all: agents.length,
    running: agents.filter(a => a.status === 'running').length,
    idle: agents.filter(a => a.status === 'idle').length,
    error: agents.filter(a => a.status === 'error').length,
    completed: agents.filter(a => a.status === 'completed').length
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['all', 'running', 'idle', 'error', 'completed'] as const).map(status => (
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
          onClick={() => setShowSpawnModal(true)}
          className="btn-primary whitespace-nowrap"
        >
          <Plus size={18} className="mr-2" />
          Spawn Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAgents.map(agent => (
          <AgentCard 
            key={agent.id} 
            agent={agent} 
            onStart={onStart}
            onStop={onStop}
            onKill={onKill}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Robot size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No agents found</p>
        </div>
      )}

      <SpawnAgentModal
        isOpen={showSpawnModal}
        onClose={() => setShowSpawnModal(false)}
        onSpawn={onSpawn}
      />
    </div>
  );
};
