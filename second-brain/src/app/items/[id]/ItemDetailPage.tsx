'use client';

import { useState, useEffect } from 'react';
import { Item } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  ExternalLink, 
  Edit2,
  MessageSquare,
  FileText,
  User,
  Bookmark,
  StickyNote
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

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

interface ItemDetailPageProps {
  id: string;
}

export default function ItemDetailPage({ id }: ItemDetailPageProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/items/${id}`);
      if (!res.ok) {
        throw new Error('Item not found');
      }
      const data = await res.json();
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Item Not Found</h1>
          <p className="text-slate-500 mb-4">{error || 'The item you\'re looking for doesn\'t exist.'}</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = typeIcons[item.type] || FileText;
  const colorClass = typeColors[item.type] || 'bg-slate-100 text-slate-800';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <Badge variant="secondary">{item.type}</Badge>
                <span className="text-sm text-slate-400">|</span>
                <span className="text-sm text-slate-500">{item.source}</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{item.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(item.date)}
              </span>
              {item.sourceUrl && (
                <a 
                  href={item.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Source
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content */}
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </div>

            {/* Metadata */}
            {Object.keys(item.metadata).length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Metadata</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <pre className="text-xs text-slate-600 overflow-x-auto">
                    {JSON.stringify(item.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-6 text-xs text-slate-400">
              <p>Created: {formatDate(item.createdAt, 'MMM d, yyyy h:mm a')}</p>
              <p>Updated: {formatDate(item.updatedAt, 'MMM d, yyyy h:mm a')}</p>
              <p>ID: {item.id}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
