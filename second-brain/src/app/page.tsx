'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item, DashboardStats as Stats } from '@/types';
import { SearchFilters } from '@/components/dashboard/SearchFilters';
import { ItemList } from '@/components/dashboard/ItemList';
import { TimelineView } from '@/components/dashboard/TimelineView';
import { SummaryView } from '@/components/dashboard/SummaryView';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, LayoutGrid, List, Clock, FileText } from 'lucide-react';

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    query: '',
    types: [] as string[],
    tags: [] as string[],
    sources: [] as string[],
    startDate: '',
    endDate: '',
  });

  const fetchData = useCallback(async () => {
    try {
      // Fetch items with filters
      const params = new URLSearchParams();
      if (filters.query) params.set('query', filters.query);
      if (filters.types.length) params.set('types', filters.types.join(','));
      if (filters.tags.length) params.set('tags', filters.tags.join(','));
      if (filters.sources.length) params.set('sources', filters.sources.join(','));
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const [itemsRes, metaRes] = await Promise.all([
        fetch(`/api/items?${params.toString()}`),
        fetch('/api/metadata'),
      ]);

      const itemsData = await itemsRes.json();
      const metaData = await metaRes.json();

      setItems(itemsData.items);
      setStats(metaData.stats);
      setTags(metaData.tags);
      setSources(metaData.sources);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const runImport = async () => {
    try {
      setLoading(true);
      await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceRoot: '/home/merce/.openclaw/workspace' }),
      });
      await fetchData();
    } catch (error) {
      console.error('Error running import:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Second Brain</h1>
              <p className="text-sm text-slate-500">
                Your personal knowledge management system
              </p>
            </div>
            <Button
              variant="outline"
              onClick={runImport}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Import Data
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <DashboardStats stats={stats} />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" isActive={activeTab === 'all'}>
              <LayoutGrid className="h-4 w-4 mr-2" />
              All Items
            </TabsTrigger>
            <TabsTrigger value="timeline" isActive={activeTab === 'timeline'}>
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="daily" isActive={activeTab === 'daily'}>
              <FileText className="h-4 w-4 mr-2" />
              Daily Summary
            </TabsTrigger>
            <TabsTrigger value="weekly" isActive={activeTab === 'weekly'}>
              <FileText className="h-4 w-4 mr-2" />
              Weekly Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent isActive={activeTab === 'all'}>
            <div className="space-y-6">
              <SearchFilters
                onSearch={handleSearch}
                availableTags={tags}
                availableSources={sources}
              />
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {items.length} items found
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ItemList items={items} view={viewMode} />
            </div>
          </TabsContent>

          <TabsContent isActive={activeTab === 'timeline'}>
            <TimelineView items={items} />
          </TabsContent>

          <TabsContent isActive={activeTab === 'daily'}>
            <SummaryView period="daily" />
          </TabsContent>

          <TabsContent isActive={activeTab === 'weekly'}>
            <SummaryView period="weekly" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
