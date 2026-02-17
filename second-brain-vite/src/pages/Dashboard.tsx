import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  User, 
  Database,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import type { BrainItem } from '../types';
import { ItemCard } from '../components/ItemCard';
import { formatDate } from '../utils/helpers';

interface DashboardProps {
  items: BrainItem[];
}

const typeIcons = {
  memory: FileText,
  slack: MessageSquare,
  notion: Database,
  user: User
};

export function Dashboard({ items }: DashboardProps) {
  const stats = useMemo(() => {
    const byType = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentItems = items.slice(0, 10);
    const today = new Date().toISOString().split('T')[0];
    const todayCount = items.filter(item => 
      item.date.startsWith(today)
    ).length;

    const allTags = new Set<string>();
    items.forEach(item => item.tags.forEach(tag => allTags.add(tag)));

    return {
      byType,
      recentItems,
      todayCount,
      tagCount: allTags.size,
      totalItems: items.length
    };
  }, [items]);

  const statCards = [
    { label: 'Total Items', value: stats.totalItems, icon: Database, color: 'blue' },
    { label: 'Today', value: stats.todayCount, icon: Clock, color: 'green' },
    { label: 'Tags', value: stats.tagCount, icon: TrendingUp, color: 'purple' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your personal knowledge base overview</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-${color}-100 rounded-lg`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content by type */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {Object.entries(stats.byType).map(([type, count]) => {
          const Icon = typeIcons[type as keyof typeof typeIcons] || FileText;
          return (
            <Link
              key={type}
              to={`/search?type=${type}`}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className="font-medium capitalize">{type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{count}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent items */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Items</h2>
          <Link to="/search" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {stats.recentItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
