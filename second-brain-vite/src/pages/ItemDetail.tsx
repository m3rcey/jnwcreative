import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  ExternalLink,
  Trash2,
  Edit3,
  MessageSquare,
  FileText,
  User,
  Database
} from 'lucide-react';
import type { BrainItem } from '../types';
import { formatDateTime } from '../utils/helpers';

interface ItemDetailProps {
  items: BrainItem[];
}

const typeIcons = {
  memory: FileText,
  slack: MessageSquare,
  notion: Database,
  user: User
};

const typeLabels = {
  memory: 'Memory',
  slack: 'Slack Conversation',
  notion: 'Notion Page',
  user: 'User Profile',
  summary: 'Summary'
};

export function ItemDetail({ items }: ItemDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id);

  if (!item) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          Return to dashboard
        </Link>
      </div>
    );
  }

  const Icon = typeIcons[item.type] || FileText;
  const typeLabel = typeLabels[item.type] || item.type;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Icon className="w-4 h-4" />
          <span className="uppercase tracking-wide font-medium">{typeLabel}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
      </header>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDateTime(item.date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Source:</span>
          <span className="font-medium">{item.source}</span>
        </div>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open original</span>
          </a>
        )}
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Tag className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <Link
                key={tag}
                to={`/search?tag=${tag}`}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <article className="prose prose-lg max-w-none">
        {item.contentHtml ? (
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: item.contentHtml }} 
          />
        ) : (
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {item.content}
          </div>
        )}
      </article>

      {/* Metadata section */}
      {Object.keys(item.metadata).length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Metadata</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(item.metadata).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-500 capitalize">{key}</dt>
                <dd className="text-gray-900 font-mono">
                  {typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-4">
        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
          <Edit3 className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors">
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
