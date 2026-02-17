'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Summary } from '@/types';
import { formatDate } from '@/lib/utils';
import { FileText, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SummaryViewProps {
  period: 'daily' | 'weekly';
}

export function SummaryView({ period }: SummaryViewProps) {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetchSummaries();
  }, [period]);

  const fetchSummaries = async () => {
    try {
      const res = await fetch(`/api/summaries?period=${period}`);
      const data = await res.json();
      setSummaries(data.summaries);
      if (data.summaries.length > 0 && !selectedSummary) {
        setSelectedSummary(data.summaries[0]);
      }
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummaries(prev => [data.summary, ...prev]);
        setSelectedSummary(data.summary);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Summary List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{period === 'daily' ? 'Daily' : 'Weekly'} Summaries</h3>
          <Button
            size="sm"
            onClick={generateSummary}
            disabled={generating}
          >
            {generating ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate
          </Button>
        </div>
        
        {summaries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No summaries yet</p>
              <p className="text-sm mt-1">Generate your first summary</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {summaries.map((summary) => (
              <button
                key={summary.id}
                onClick={() => setSelectedSummary(summary)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedSummary?.id === summary.id
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-medium">{summary.title}</div>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {formatDate(summary.startDate)} - {formatDate(summary.endDate)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {summary.itemCount} items
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary Detail */}
      <div className="lg:col-span-2">
        {selectedSummary ? (
          <Card>
            <CardHeader>
              <CardTitle>{selectedSummary.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSummary.highlights.map((highlight, i) => (
                  <Badge key={i} variant="outline">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{selectedSummary.content}</ReactMarkdown>
              </div>
              {selectedSummary.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {selectedSummary.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a summary to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
