import type { BrainItem, DailySummary } from '../types';

const DB_VERSION = 1;

class StorageManager {
  private items: BrainItem[] = [];
  private summaries: DailySummary[] = [];
  private loaded = false;

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    await this.load();
  }

  async load(): Promise<void> {
    try {
      const itemsResponse = await fetch('/data/items.json');
      if (itemsResponse.ok) {
        this.items = await itemsResponse.json();
      }
    } catch {
      this.items = [];
    }

    try {
      const summariesResponse = await fetch('/data/summaries.json');
      if (summariesResponse.ok) {
        this.summaries = await summariesResponse.json();
      }
    } catch {
      this.summaries = [];
    }

    this.loaded = true;
  }

  getItems(): BrainItem[] {
    return [...this.items].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getItem(id: string): BrainItem | undefined {
    return this.items.find(item => item.id === id);
  }

  getRecentItems(limit = 50): BrainItem[] {
    return this.getItems().slice(0, limit);
  }

  getItemsByType(type: string): BrainItem[] {
    return this.getItems().filter(item => item.type === type);
  }

  getItemsByTag(tag: string): BrainItem[] {
    return this.getItems().filter(item => 
      item.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  getItemsByDateRange(from: string, to: string): BrainItem[] {
    const fromDate = new Date(from).getTime();
    const toDate = new Date(to).getTime();
    return this.getItems().filter(item => {
      const itemDate = new Date(item.date).getTime();
      return itemDate >= fromDate && itemDate <= toDate;
    });
  }

  getAllTags(): string[] {
    const tagSet = new Set<string>();
    this.items.forEach(item => {
      item.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  getAllSources(): string[] {
    const sourceSet = new Set<string>();
    this.items.forEach(item => sourceSet.add(item.source));
    return Array.from(sourceSet).sort();
  }

  search(query: string): BrainItem[] {
    const lowerQuery = query.toLowerCase();
    return this.getItems().filter(item => {
      return (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  getSummaries(): DailySummary[] {
    return [...this.summaries].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getSummary(id: string): DailySummary | undefined {
    return this.summaries.find(s => s.id === id);
  }

  getSummariesByDate(date: string): DailySummary[] {
    return this.summaries.filter(s => s.date === date);
  }

  // For use by importers to generate data
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

export const storage = new StorageManager();
