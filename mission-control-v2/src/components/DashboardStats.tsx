import React from 'react';
import type { SystemStats } from '../types';
import { Robot, Shield, GitBranch, Wrench, Activity } from './Icons';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp, color }) => (
  <div className="card p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`mt-1 text-xs sm:text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

interface SystemHealthProps {
  health: SystemStats['systemHealth'];
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
}

const formatUptime = (ms: number): string => {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

export const SystemHealth: React.FC<SystemHealthProps> = ({ health, cpuUsage, memoryUsage, uptime }) => {
  const healthConfig = {
    healthy: { color: 'text-green-500', bg: 'bg-green-500', label: 'Healthy' },
    warning: { color: 'text-amber-500', bg: 'bg-amber-500', label: 'Warning' },
    critical: { color: 'text-red-500', bg: 'bg-red-500', label: 'Critical' }
  };

  const config = healthConfig[health];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity size={20} className="text-primary-600" />
          System Health
        </h3>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${config.bg} animate-pulse`}></span>
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">CPU Usage</span>
            <span className="font-medium text-gray-900">{cpuUsage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                cpuUsage > 80 ? 'bg-red-500' : cpuUsage > 60 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${cpuUsage}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Memory Usage</span>
            <span className="font-medium text-gray-900">{memoryUsage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                memoryUsage > 80 ? 'bg-red-500' : memoryUsage > 60 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${memoryUsage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Uptime</span>
            <span className="font-medium text-gray-900">{formatUptime(uptime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  stats: SystemStats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Agents"
          value={stats.activeAgents}
          icon={<Robot size={24} className="text-blue-600" />}
          color="bg-blue-50"
          trend="2 new today"
          trendUp={true}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<Shield size={24} className="text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          title="Active Workflows"
          value={stats.activeWorkflows}
          icon={<GitBranch size={24} className="text-green-600" />}
          color="bg-green-50"
          trend="1 completed"
          trendUp={true}
        />
        <StatCard
          title="Tools Active"
          value={stats.toolsActive}
          icon={<Wrench size={24} className="text-purple-600" />}
          color="bg-purple-50"
        />
      </div>
      
      <SystemHealth 
        health={stats.systemHealth}
        cpuUsage={stats.cpuUsage}
        memoryUsage={stats.memoryUsage}
        uptime={stats.uptime}
      />
    </div>
  );
};
