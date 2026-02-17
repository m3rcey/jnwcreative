import type { BrainItem } from '../types';
import { StorageManager } from '../utils/storage';
import { parseMarkdown } from '../utils/helpers';
import * as fs from 'fs';
import * as path from 'path';

export function importMemoryFile(filePath: string): BrainItem[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.md');
  const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const items: BrainItem[] = [];
  
  // Parse sections separated by ## headers
  const sections = content.split(/^##\s+/m).filter(s => s.trim());
  
  sections.forEach((section, index) => {
    const lines = section.split('\n');
    const title = lines[0].trim() || `Memory ${index + 1}`;
    const sectionContent = lines.slice(1).join('\n').trim();
    
    if (sectionContent) {
      items.push({
        id: StorageManager.generateId(),
        type: 'memory',
        title: title.length > 100 ? title.slice(0, 100) + '...' : title,
        content: sectionContent,
        contentHtml: parseMarkdown(sectionContent),
        date: date,
        tags: extractTags(sectionContent),
        source: 'memory',
        metadata: { fileName },
        createdAt: date,
        updatedAt: date
      });
    }
  });

  // If no sections found, treat entire file as one item
  if (items.length === 0 && content.trim()) {
    items.push({
      id: StorageManager.generateId(),
      type: 'memory',
      title: `Memory: ${date}`,
      content: content,
      contentHtml: parseMarkdown(content),
      date: date,
      tags: extractTags(content),
      source: 'memory',
      metadata: { fileName },
      createdAt: date,
      updatedAt: date
    });
  }

  return items;
}

export function importAllMemoryFiles(memoryDir: string): BrainItem[] {
  const allItems: BrainItem[] = [];
  
  if (!fs.existsSync(memoryDir)) {
    console.warn(`Memory directory not found: ${memoryDir}`);
    return allItems;
  }

  const files = fs.readdirSync(memoryDir)
    .filter(f => f.endsWith('.md') && f.match(/\d{4}-\d{2}-\d{2}/));

  for (const file of files) {
    const filePath = path.join(memoryDir, file);
    try {
      const items = importMemoryFile(filePath);
      allItems.push(...items);
      console.log(`Imported ${items.length} items from ${file}`);
    } catch (err) {
      console.error(`Error importing ${file}:`, err);
    }
  }

  return allItems;
}

function extractTags(content: string): string[] {
  const tags: string[] = [];
  const tagMatches = content.match(/#\w+/g);
  if (tagMatches) {
    tagMatches.forEach(tag => {
      const cleanTag = tag.slice(1).toLowerCase();
      if (!tags.includes(cleanTag)) tags.push(cleanTag);
    });
  }
  
  // Extract category tags
  if (content.includes('trading') || content.includes('stock')) tags.push('trading');
  if (content.includes('meeting') || content.includes('call')) tags.push('meeting');
  if (content.includes('idea') || content.includes('thought')) tags.push('ideas');
  if (content.includes('project') || content.includes('task')) tags.push('project');
  
  return tags;
}
