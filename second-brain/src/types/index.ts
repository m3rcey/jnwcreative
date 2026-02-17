export interface BaseItem {
  id: string;
  type: 'memory' | 'slack' | 'notion' | 'user_profile' | 'note';
  title: string;
  content: string;
  source: string;
  sourceUrl?: string;
  date: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryItem extends BaseItem {
  type: 'memory';
  memoryDate: string;
}

export interface SlackItem extends BaseItem {
  type: 'slack';
  channel: string;
  author: string;
  threadTs?: string;
  reactions?: string[];
}

export interface NotionItem extends BaseItem {
  type: 'notion';
  notionId: string;
  category: string;
  properties: Record<string, any>;
}

export interface UserProfileItem extends BaseItem {
  type: 'user_profile';
  profileKey: string;
}

export interface NoteItem extends BaseItem {
  type: 'note';
  isPinned: boolean;
}

export type Item = MemoryItem | SlackItem | NotionItem | UserProfileItem | NoteItem;

export interface SearchFilters {
  query?: string;
  types?: string[];
  tags?: string[];
  startDate?: string;
  endDate?: string;
  sources?: string[];
}

export interface TimelineGroup {
  date: string;
  items: Item[];
}

export interface Summary {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  title: string;
  content: string;
  highlights: string[];
  itemCount: number;
  tags: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalItems: number;
  itemsByType: Record<string, number>;
  itemsBySource: Record<string, number>;
  recentItems: Item[];
  topTags: { tag: string; count: number }[];
}
