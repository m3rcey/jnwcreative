import React from 'react';
import type { Activity } from '../types';
import { Robot, Wrench, Shield, GitBranch, Activity as ActivityIcon, ChevronRight } from './Icons';
import { formatTimeAgo } from '../utils/helpers';

interface ActivityItemProps {
  activity: Activity;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'agent':
      return <Robot size={16} className="text-blue-600" />;
    case 'tool':
      return <Wrench size={16} className="text-purple-600" />;
    case 'approval':
      return <Shield size={16} className="text-amber-600" />;
    case 'workflow':
      return <GitBranch size={16} className="text-green-600" />;
    case 'system':
      return <ActivityIcon size={16} className="text-gray-600" />;
    default:
      return <ActivityIcon size={16} className="text-gray-600" />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'agent':
      return 'bg-blue-50';
    case 'tool':
      return 'bg-purple-50';
    case 'approval':
      return 'bg-amber-50';
    case 'workflow':
      return 'bg-green-50';
    case 'system':
      return 'bg-gray-50';
    default:
      return 'bg-gray-50';
  }
};

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center`}>
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium truncate">{activity.message}</p>
        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
      </div>
    </div>
  );
};

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, maxItems = 10 }) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ActivityIcon size={20} className="text-primary-600" />
          Recent Activity
        </h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
          View all
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {displayActivities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          displayActivities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
};
