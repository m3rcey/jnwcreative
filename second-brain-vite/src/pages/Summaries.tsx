import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../utils/storage';
import { formatDate } from '../utils/helpers';
import type { DailySummary } from '../types';
import { 
  FileText, 
  Calendar, 
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function Summaries() {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSummaries = async () => {
      await storage.load();
      setSummaries(storage.getSummaries());
      setIsLoading(false);
    };
    loadSummaries();
  }, []);

  // Group summaries by type
  const dailySummaries = summaries.filter(s => s.type === 'daily');
  const weeklySummaries = summaries.filter(s => s.type === 'weekly');

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Summaries</h1>
        <p className="text-gray-500 mt-1">
          Daily and weekly summaries of your content
        </p>
      </header>

      {/* Weekly Summaries */}
      {weeklySummaries.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Weekly Summaries
          </h2>
          <div className="grid gap-4">
            {weeklySummaries.map(summary => (
              <SummaryCard key={summary.id} summary={summary} />
            ))}
          </div>
        </section>
      )}

      {/* Daily Summaries */}
      {dailySummaries.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Daily Summaries
          </h2>
          <div className="grid gap-4">
            {dailySummaries.map(summary => (
              <SummaryCard key={summary.id} summary={summary} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {summaries.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No summaries yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Summaries are generated automatically from your imported data. 
            Import some memories, Slack conversations, or Notion pages to get started.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ summary }: { summary: DailySummary }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(summary.date)}</span>
            <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">
              {summary.type}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {summary.type === 'weekly' ? 'Week of ' : ''}
            {formatDate(summary.date)}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {summary.content}
          </p>
          {summary.highlights.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {summary.highlights.slice(0, 3).map((highlight, idx) => (
                <span 
                  key={idx}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {summary.itemCount}
            </div>
            <div className="text-xs text-gray-500">items</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </div>
    </div>
  );
}
