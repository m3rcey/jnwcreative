import type { BrainItem } from '../types';
import { StorageManager } from '../utils/storage';
import { parseMarkdown } from '../utils/helpers';
import * as fs from 'fs';
import * as path from 'path';

interface NotionPage {
  id: string;
  title?: string;
  content?: string;
  properties?: Record<string, unknown>;
  created_time?: string;
  last_edited_time?: string;
  url?: string;
}

interface NotionDatabase {
  id: string;
  title?: string;
  pages: NotionPage[];
}

export function importNotionExport(exportPath: string): BrainItem[] {
  const items: BrainItem[] = [];
  
  if (!fs.existsSync(exportPath)) {
    console.warn(`Notion export not found: ${exportPath}`);
    return items;
  }

  const stats = fs.statSync(exportPath);
  
  if (stats.isFile()) {
    if (exportPath.endsWith('.json')) {
      return importNotionJson(exportPath);
    } else if (exportPath.endsWith('.md')) {
      return [importNotionMarkdown(exportPath)];
    }
    return items;
  }

  // Directory import
  const entries = fs.readdirSync(exportPath, { recursive: true }) as string[];
  
  for (const entry of entries) {
    const fullPath = path.join(exportPath, entry);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) continue;
    
    try {
      if (entry.endsWith('.json')) {
        const fileItems = importNotionJson(fullPath);
        items.push(...fileItems);
      } else if (entry.endsWith('.md')) {
        const item = importNotionMarkdown(fullPath);
        items.push(item);
      }
    } catch (err) {
      console.error(`Error importing Notion file ${entry}:`, err);
    }
  }

  return items;
}

export function importNotionJson(filePath: string): BrainItem[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  const items: BrainItem[] = [];
  
  // Handle both single page and database export formats
  if (Array.isArray(data)) {
    // Database export
    data.forEach((page: NotionPage) => {
      items.push(notionPageToItem(page));
    });
  } else if (data.pages) {
    // Nested database format
    data.pages.forEach((page: NotionPage) => {
      items.push(notionPageToItem(page, data.title));
    });
  } else {
    // Single page
    items.push(notionPageToItem(data));
  }

  return items;
}

export function importNotionMarkdown(filePath: string): BrainItem {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.md');
  const stats = fs.statSync(filePath);
  
  // Try to extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : fileName;

  return {
    id: StorageManager.generateId(),
    type: 'notion',
    title: title,
    content: content,
    contentHtml: parseMarkdown(content),
    date: stats.mtime.toISOString(),
    tags: extractNotionTags(content),
    source: 'notion',
    metadata: { fileName, filePath },
    createdAt: stats.birthtime.toISOString(),
    updatedAt: stats.mtime.toISOString()
  };
}

function notionPageToItem(page: NotionPage, databaseName?: string): BrainItem {
  const date = page.created_time || new Date().toISOString();
  const content = page.content || '';
  const title = page.title || 'Untitled';
  
  // Extract tags from properties
  const tags = ['notion'];
  if (databaseName) tags.push(databaseName.toLowerCase().replace(/\s+/g, '-'));
  
  if (page.properties) {
    Object.entries(page.properties).forEach(([key, value]) => {
      if (key.toLowerCase().includes('tag') || key.toLowerCase().includes('category')) {
        if (Array.isArray(value)) {
          tags.push(...value.map(v => String(v).toLowerCase()));
        } else if (typeof value === 'string') {
          tags.push(value.toLowerCase());
        }
      }
    });
  }

  return {
    id: StorageManager.generateId(),
    type: 'notion',
    title: title,
    content: content,
    contentHtml: parseMarkdown(content),
    date: date,
    tags: [...new Set(tags)],
    source: databaseName ? `notion:${databaseName}` : 'notion',
    url: page.url,
    metadata: {
      notionId: page.id,
      properties: page.properties
    },
    createdAt: date,
    updatedAt: page.last_edited_time || date
  };
}

function extractNotionTags(content: string): string[] {
  const tags = ['notion'];
  
  // Extract hashtags
  const tagMatches = content.match(/#\w+/g);
  if (tagMatches) {
    tagMatches.forEach(tag => {
      tags.push(tag.slice(1).toLowerCase());
    });
  }
  
  return [...new Set(tags)];
}
