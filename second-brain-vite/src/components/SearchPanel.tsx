import { useState, useMemo } from 'react';
import type { BrainItem, ContentType } from '../types';
import { ItemCard } from './ItemCard';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { debounce } from '../utils/helpers';

interface SearchPanelProps {
  items: BrainItem[];
  onFilterChange?: (filtered: BrainItem[]) => void;
}

const contentTypes: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'memory', label: 'Memory' },
  { value: 'slack', label: 'Slack' },
  { value: 'notion', label: 'Notion' },
  { value: 'user', label: 'User' },
];

export function SearchPanel({ items, onFilterChange }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => item.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    let result = items;

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(item => item.type === selectedType);
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Date range filter
    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      result = result.filter(item => new Date(item.date).getTime() >= fromTime);
    }
    if (dateTo) {
      const toTime = new Date(dateTo).getTime() + 86400000; // End of day
      result = result.filter(item => new Date(item.date).getTime() <= toTime);
    }

    return result;
  }, [items, query, selectedType, selectedTags, dateFrom, dateTo]);

  // Notify parent of filter changes
  useMemo(() => {
    onFilterChange?.(filteredItems);
  }, [filteredItems, onFilterChange]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedType('all');
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = query || selectedType !== 'all' || selectedTags.length > 0 || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search everything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {[selectedType !== 'all' && 'type', selectedTags.length > 0 && 'tags', (dateFrom || dateTo) && 'date'].filter(Boolean).length}
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Type filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedType === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Results grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredItems.slice(0, 20).map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      
      {filteredItems.length > 20 && (
        <div className="text-center py-4 text-gray-500">
          ... and {filteredItems.length - 20} more items
        </div>
      )}
    </div>
  );
}
