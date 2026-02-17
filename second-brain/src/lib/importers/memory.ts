import { MemoryItem } from '@/types';
import { createItem } from '@/lib/db';
import matter from 'gray-matter';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function importMemoryFiles(memoryDir: string): Promise<number> {
  if (!existsSync(memoryDir)) {
    console.log(`Memory directory not found: ${memoryDir}`);
    return 0;
  }

  const files = readdirSync(memoryDir).filter(f => f.endsWith('.md'));
  let importedCount = 0;

  for (const file of files) {
    try {
      const content = readFileSync(join(memoryDir, file), 'utf-8');
      const { data, content: body } = matter(content);
      
      // Extract date from filename (YYYY-MM-DD.md)
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})\.md$/);
      const memoryDate = dateMatch ? dateMatch[1] : data.date || new Date().toISOString().split('T')[0];
      
      const item: MemoryItem = {
        id: `memory-${memoryDate}-${uuidv4().slice(0, 8)}`,
        type: 'memory',
        title: data.title || `Memory from ${memoryDate}`,
        content: body,
        source: 'memory-file',
        sourceUrl: `file://${join(memoryDir, file)}`,
        date: memoryDate,
        memoryDate,
        tags: data.tags || ['memory'],
        metadata: {
          ...data,
          filename: file,
        },
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };

      createItem(item);
      importedCount++;
    } catch (error) {
      console.error(`Error importing memory file ${file}:`, error);
    }
  }

  return importedCount;
}
