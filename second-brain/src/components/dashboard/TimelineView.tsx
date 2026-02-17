'use client';

import { useState, useEffect } from 'react';
import { Item, TimelineGroup } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, groupByDate } from '@/lib/utils';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface TimelineViewProps {
  items: Item[];
}

export function TimelineView({ items }: TimelineViewProps) {
  const [groupedItems, setGroupedItems] = useState<TimelineGroup[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const grouped = groupByDate(items);
    const sorted = Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({ date, items }));
    setGroupedItems(sorted);
    
    // Expand first 3 dates by default
    const initialExpanded = new Set(sorted.slice(0, 3).map(g => g.date));
    setExpandedDates(initialExpanded);
  }, [items]);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  if (groupedItems.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No items to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedItems.map(({ date, items }) => {
        const isExpanded = expandedDates.has(date);
        const typeCounts = items.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return (
          <Card key={date} className="overflow-hidden">
            <button
              onClick={() => toggleDate(date)}
              className="w-full"
            >
              <CardHeader className="py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                    <CardTitle className="text-base font-semibold">
                      {formatDate(date, 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <Badge variant="secondary">
                      {items.length} items
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(typeCounts).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
            </button>
            
            {isExpanded && (
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    <TimelineItem key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function TimelineItem({ item }: { item: Item }) {
  const typeColors: Record<string, string> = {
    memory: 'border-l-amber-400',
    slack: 'border-l-purple-400',
    notion: 'border-l-blue-400',
    user_profile: 'border-l-green-400',
    note: 'border-l-slate-400',
  };

  return (
    <Link href={`/items/${item.id}`}>
      <div className={`p-4 hover:bg-slate-50 transition-colors border-l-4 ${typeColors[item.type] || 'border-l-slate-400'} cursor-pointer`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-900 truncate">
              {item.title}
            </h4>
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">
              {item.content.slice(0, 200)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {item.type}
              </Badge>
              <span className="text-xs text-slate-400">
                {item.source}
              </span>
              {item.tags.slice(0, 5).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
