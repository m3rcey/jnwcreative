'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardStats as Stats } from '@/types';
import { 
  Database, 
  FileText, 
  MessageSquare, 
  Bookmark, 
  User, 
  StickyNote,
  TrendingUp 
} from 'lucide-react';

interface DashboardStatsProps {
  stats: Stats;
}

const typeIcons: Record<string, React.ReactNode> = {
  memory: <Bookmark className="h-4 w-4" />,
  slack: <MessageSquare className="h-4 w-4" />,
  notion: <FileText className="h-4 w-4" />,
  user_profile: <User className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  memory: 'bg-amber-50 text-amber-700 border-amber-200',
  slack: 'bg-purple-50 text-purple-700 border-purple-200',
  notion: 'bg-blue-50 text-blue-700 border-blue-200',
  user_profile: 'bg-green-50 text-green-700 border-green-200',
  note: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  const itemsByTypeEntries = Object.entries(stats.itemsByType);
  const itemsBySourceEntries = Object.entries(stats.itemsBySource).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Database className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
          <p className="text-xs text-slate-500">
            Items in your second brain
          </p>
        </CardContent>
      </Card>

      {/* Items by Type */}
      {itemsByTypeEntries.slice(0, 3).map(([type, count]) => (
        <Card key={type}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium capitalize">
              {type.replace('_', ' ')}s
            </CardTitle>
            <div className={`p-1 rounded ${typeColors[type]?.split(' ')[0] || 'bg-slate-50'}`}>
              {typeIcons[type] || <FileText className="h-4 w-4" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count}</div>
            <p className="text-xs text-slate-500">
              {((count / stats.totalItems) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Top Sources */}
      {itemsBySourceEntries.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {itemsBySourceEntries.map(([source, count]) => (
                <Badge key={source} variant="outline" className="text-sm py-1 px-3">
                  {source}
                  <span className="ml-2 text-slate-400">{count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
