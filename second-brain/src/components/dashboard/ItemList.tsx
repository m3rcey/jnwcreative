'use client';

import { Item } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, truncateText } from '@/lib/utils';
import { MessageSquare, FileText, User, Bookmark, StickyNote, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ItemListProps {
  items: Item[];
  view?: 'grid' | 'list';
}

const typeIcons = {
  memory: Bookmark,
  slack: MessageSquare,
  notion: FileText,
  user_profile: User,
  note: StickyNote,
};

const typeColors = {
  memory: 'bg-amber-100 text-amber-800',
  slack: 'bg-purple-100 text-purple-800',
  notion: 'bg-blue-100 text-blue-800',
  user_profile: 'bg-green-100 text-green-800',
  note: 'bg-slate-100 text-slate-800',
};

export function ItemList({ items, view = 'list' }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No items found</p>
      </div>
    );
  }

  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function ItemCard({ item }: { item: Item }) {
  const Icon = typeIcons[item.type] || FileText;
  const colorClass = typeColors[item.type] || 'bg-slate-100 text-slate-800';

  return (
    <Link href={`/items/${item.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {item.type}
              </Badge>
            </div>
            <span className="text-xs text-slate-400">
              {formatDate(item.date)}
            </span>
          </div>
          <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 line-clamp-3">
            {truncateText(item.content, 150)}
          </p>
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {item.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {item.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 5}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function ItemRow({ item }: { item: Item }) {
  const Icon = typeIcons[item.type] || FileText;
  const colorClass = typeColors[item.type] || 'bg-slate-100 text-slate-800';

  return (
    <Link href={`/items/${item.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate">
                  {item.title}
                </h3>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {item.type}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">
                {truncateText(item.content, 200)}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-slate-400">
                  {formatDate(item.date)}
                </span>
                <span className="text-xs text-slate-400">
                  Source: {item.source}
                </span>
                {item.sourceUrl && (
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                )}
              </div>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 8).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
