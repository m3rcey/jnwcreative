import { Item, Summary, SearchFilters } from '@/types';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'data');
const ITEMS_FILE = join(DATA_DIR, 'items.json');
const SUMMARIES_FILE = join(DATA_DIR, 'summaries.json');

interface DataStore {
  items: Item[];
  summaries: Summary[];
}

let store: DataStore | null = null;

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadStore(): DataStore {
  ensureDataDir();
  
  if (!existsSync(ITEMS_FILE)) {
    writeFileSync(ITEMS_FILE, JSON.stringify([]));
  }
  if (!existsSync(SUMMARIES_FILE)) {
    writeFileSync(SUMMARIES_FILE, JSON.stringify([]));
  }
  
  const items = JSON.parse(readFileSync(ITEMS_FILE, 'utf-8'));
  const summaries = JSON.parse(readFileSync(SUMMARIES_FILE, 'utf-8'));
  
  return { items, summaries };
}

function saveStore() {
  if (store) {
    writeFileSync(ITEMS_FILE, JSON.stringify(store.items, null, 2));
    writeFileSync(SUMMARIES_FILE, JSON.stringify(store.summaries, null, 2));
  }
}

function getStore(): DataStore {
  if (!store) {
    store = loadStore();
  }
  return store;
}

export function initializeSchema() {
  getStore();
}

// Items CRUD
export function createItem(item: Item): void {
  const data = getStore();
  const existingIndex = data.items.findIndex(i => i.id === item.id);
  
  if (existingIndex >= 0) {
    data.items[existingIndex] = item;
  } else {
    data.items.push(item);
  }
  
  // Sort by date descending
  data.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  saveStore();
}

export function getItemById(id: string): Item | null {
  const data = getStore();
  return data.items.find(i => i.id === id) || null;
}

export function updateItem(id: string, updates: Partial<Item>): void {
  const data = getStore();
  const index = data.items.findIndex(i => i.id === id);
  
  if (index >= 0) {
    data.items[index] = { ...data.items[index], ...updates, updatedAt: new Date().toISOString() };
    saveStore();
  }
}

export function deleteItem(id: string): void {
  const data = getStore();
  data.items = data.items.filter(i => i.id !== id);
  saveStore();
}

export function searchItems(filters: SearchFilters): Item[] {
  const data = getStore();
  let results = [...data.items];
  
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  
  if (filters.types && filters.types.length > 0) {
    results = results.filter(item => filters.types?.includes(item.type));
  }
  
  if (filters.sources && filters.sources.length > 0) {
    results = results.filter(item => filters.sources?.includes(item.source));
  }
  
  if (filters.startDate) {
    results = results.filter(item => item.date >= filters.startDate);
  }
  
  if (filters.endDate) {
    results = results.filter(item => item.date <= filters.endDate);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(item => 
      filters.tags?.some(t => item.tags.includes(t))
    );
  }
  
  return results;
}

export function getItemsByDateRange(startDate: string, endDate: string, types?: string[]): Item[] {
  const data = getStore();
  let results = data.items.filter(item => 
    item.date >= startDate && item.date <= endDate
  );
  
  if (types && types.length > 0) {
    results = results.filter(item => types.includes(item.type));
  }
  
  return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllTags(): string[] {
  const data = getStore();
  const tagSet = new Set<string>();
  
  data.items.forEach(item => {
    item.tags.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
}

export function getSources(): string[] {
  const data = getStore();
  const sources = new Set(data.items.map(i => i.source));
  return Array.from(sources).sort();
}

export function getStats(): { totalItems: number; itemsByType: Record<string, number>; itemsBySource: Record<string, number> } {
  const data = getStore();
  
  const itemsByType: Record<string, number> = {};
  const itemsBySource: Record<string, number> = {};
  
  data.items.forEach(item => {
    itemsByType[item.type] = (itemsByType[item.type] || 0) + 1;
    itemsBySource[item.source] = (itemsBySource[item.source] || 0) + 1;
  });
  
  return {
    totalItems: data.items.length,
    itemsByType,
    itemsBySource,
  };
}

// Summaries
export function createSummary(summary: Summary): void {
  const data = getStore();
  data.summaries.push(summary);
  saveStore();
}

export function getSummaries(period?: 'daily' | 'weekly' | 'monthly'): Summary[] {
  const data = getStore();
  let results = data.summaries;
  
  if (period) {
    results = results.filter(s => s.period === period);
  }
  
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
