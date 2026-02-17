export type ContentType = 'memory' | 'slack' | 'notion' | 'user' | 'summary';

export interface BrainItem {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  contentHtml?: string;
  date: string; // ISO date string
  tags: string[];
  source: string;
  url?: string;
  threadId?: string;
  parentId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  channel: string;
  participants: string[];
  messages: Message[];
  date: string;
  summary?: string;
  tags: string[];
}

export interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  threadTs?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  preferences: Record<string, unknown>;
  connections: string[];
}

export interface DailySummary {
  id: string;
  date: string;
  type: 'daily' | 'weekly';
  content: string;
  highlights: string[];
  itemCount: number;
  tags: string[];
}

export interface SearchFilters {
  query: string;
  types: ContentType[];
  tags: string[];
  dateFrom?: string;
  dateTo?: string;
  source?: string;
}

export interface TimelineGroup {
  date: string;
  items: BrainItem[];
}
