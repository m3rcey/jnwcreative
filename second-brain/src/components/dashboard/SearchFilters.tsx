'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { Item } from '@/types';

interface SearchFiltersProps {
  onSearch: (filters: {
    query: string;
    types: string[];
    tags: string[];
    sources: string[];
    startDate: string;
    endDate: string;
  }) => void;
  availableTags: string[];
  availableSources: string[];
}

const ITEM_TYPES = [
  { value: 'memory', label: 'Memory' },
  { value: 'slack', label: 'Slack' },
  { value: 'notion', label: 'Notion' },
  { value: 'user_profile', label: 'Profile' },
  { value: 'note', label: 'Note' },
];

export function SearchFilters({ onSearch, availableTags, availableSources }: SearchFiltersProps) {
  const [query, setQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch({
        query,
        types: selectedTypes,
        tags: selectedTags,
        sources: selectedSources,
        startDate,
        endDate,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedTypes, selectedTags, selectedSources, startDate, endDate, onSearch]);

  const clearFilters = () => {
    setQuery('');
    setSelectedTypes([]);
    setSelectedTags([]);
    setSelectedSources([]);
    setStartDate('');
    setEndDate('');
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedTags.length > 0 || 
    selectedSources.length > 0 || startDate || endDate;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search notes, conversations, memories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-slate-100' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {selectedTypes.length + selectedTags.length + selectedSources.length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
          {/* Date Range */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
              />
              <span className="self-center text-slate-400">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
              />
            </div>
          </div>

          {/* Item Types */}
          <div>
            <label className="text-sm font-medium mb-2 block">Item Types</label>
            <div className="flex flex-wrap gap-2">
              {ITEM_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                >
                  <Badge
                    variant={selectedTypes.includes(type.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                  >
                    {type.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Sources */}
          {availableSources.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Sources</label>
              <div className="flex flex-wrap gap-2">
                {availableSources.map((source) => (
                  <button
                    key={source}
                    onClick={() => toggleSource(source)}
                  >
                    <Badge
                      variant={selectedSources.includes(source) ? 'default' : 'outline'}
                      className="cursor-pointer"
                    >
                      {source}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                  >
                    <Badge
                      variant={selectedTags.includes(tag) ? 'secondary' : 'outline'}
                      className="cursor-pointer"
                    >
                      #{tag}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
