import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  User, 
  Database,
  Calendar
} from 'lucide-react';
import type { BrainItem } from '../types';
import { formatRelativeTime, formatDate } from '../utils/helpers';

interface ItemCardProps {
  item: BrainItem;
}

const typeIcons = {
  memory: FileText,
  slack: MessageSquare,
  notion: Database,
  user: User,
  summary: Calendar
};

const typeColors = {
  memory: 'bg-purple-100 text-purple-700',
  slack: 'bg-green-100 text-green-700',
  notion: 'bg-gray-100 text-gray-700',
  user: 'bg-blue-100 text-blue-700',
  summary: 'bg-orange-100 text-orange-700'
};

export function ItemCard({ item }: ItemCardProps) {
  const Icon = typeIcons[item.type] || FileText;
  const colorClass = typeColors[item.type] || 'bg-gray-100 text-gray-700';

  return (
    <Link
      to={`/item/${item.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {item.content.slice(0, 150)}...
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span>{formatRelativeTime(item.date)}</span>
            <span>•</span>
            <span className="capitalize">{item.type}</span>
            {item.tags.length > 0 && (
              <>
                <span>•</span>
                <span className="truncate">{item.tags.slice(0, 3).join(', ')}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
