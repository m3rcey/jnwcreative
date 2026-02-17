import type { BrainItem, UserProfile } from '../types';
import { StorageManager } from '../utils/storage';
import { parseMarkdown } from '../utils/helpers';
import * as fs from 'fs';
import * as path from 'path';

export function importUserProfile(filePath: string): BrainItem | null {
  if (!fs.existsSync(filePath)) {
    console.warn(`User profile not found: ${filePath}`);
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.md');
  
  // Extract name from first heading or filename
  const nameMatch = content.match(/^#\s+(.+)$/m);
  const name = nameMatch ? nameMatch[1] : fileName;

  const stats = fs.statSync(filePath);
  const date = stats.mtime.toISOString();

  return {
    id: StorageManager.generateId(),
    type: 'user',
    title: `Profile: ${name}`,
    content: content,
    contentHtml: parseMarkdown(content),
    date: date,
    tags: ['profile', 'user'],
    source: 'user',
    metadata: {
      fileName,
      name,
      lastModified: stats.mtime
    },
    createdAt: stats.birthtime.toISOString(),
    updatedAt: date
  };
}

export function importAllUserFiles(userDir: string): BrainItem[] {
  const items: BrainItem[] = [];
  
  if (!fs.existsSync(userDir)) {
    console.warn(`User directory not found: ${userDir}`);
    return items;
  }

  const files = fs.readdirSync(userDir)
    .filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(userDir, file);
    try {
      const item = importUserProfile(filePath);
      if (item) items.push(item);
    } catch (err) {
      console.error(`Error importing user file ${file}:`, err);
    }
  }

  return items;
}
