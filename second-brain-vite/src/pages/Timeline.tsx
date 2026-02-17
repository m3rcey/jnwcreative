import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BrainItem } from '../types';
import { formatDate, groupByDate } from '../utils/helpers';
import { 
  MessageSquare, 
  FileText, 
  User, 
  Database,
  ChevronRight,
  Calendar
} from 'lucide-react';

interface TimelineProps {
  items: BrainItem[];
}

const typeIcons = {
  memory: FileText,
  slack: MessageSquare,
  notion: Database,
  user: User,
  summary: Calendar
};

export function Timeline({ items }: TimelineProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const groupedItems = useMemo(() => {
    let filtered = items;
    if (selectedTypes.length > 0) {
      filtered = items.filter(item => selectedTypes.includes(item.type));
    }
    return groupByDate(filtered);
  }, [items, selectedTypes]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedItems).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedItems]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    items.forEach(item => types.add(item.type));
    return Array.from(types);
  }, [items]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
        <p className="text-gray-500 mt-1">
          Browse your content chronologically
        </p>
      </header>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableTypes.map(type => {
          const Icon = typeIcons[type as keyof typeof typeIcons] || FileText;
          const isSelected = selectedTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="capitalize">{type}</span>
            </button>
          );
        })}
        {selectedTypes.length > 0 && (
          <button
            onClick={() => setSelectedTypes([])}
            className="text-sm text-gray-500 hover:text-gray-700 px-3"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {sortedDates.map(date => (
          <div key={date} className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatDate(date)}
                </h2>
                <p className="text-sm text-gray-500">
                  {groupedItems[date].length} items
                </p>
              </div>
            </div>

            <div className="ml-6 pl-10 border-l-2 border-gray-200 space-y-3">
              {groupedItems[date].map(item => {
                const Icon = typeIcons[item.type] || FileText;
                return (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {item.content.slice(0, 120)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {item.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No items found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
