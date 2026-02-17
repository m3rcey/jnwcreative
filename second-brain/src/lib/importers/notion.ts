import { NotionItem } from '@/types';
import { createItem } from '@/lib/db';

interface NotionPage {
  id: string;
  url: string;
  title: string;
  content?: string;
  properties: Record<string, any>;
  category?: string;
  created_time: string;
  last_edited_time: string;
}

export async function importNotionPages(pages: NotionPage[]): Promise<number> {
  let importedCount = 0;

  for (const page of pages) {
    try {
      const date = page.last_edited_time.split('T')[0];
      
      // Extract tags from properties
      const tags: string[] = ['notion'];
      if (page.category) tags.push(page.category);
      
      // Add tags from multi_select properties
      Object.values(page.properties).forEach((prop: any) => {
        if (prop.type === 'multi_select') {
          prop.multi_select.forEach((tag: any) => tags.push(tag.name));
        }
      });

      const item: NotionItem = {
        id: `notion-${page.id}`,
        type: 'notion',
        title: page.title,
        content: page.content || '',
        source: 'notion',
        sourceUrl: page.url,
        date,
        notionId: page.id,
        category: page.category || 'uncategorized',
        properties: page.properties,
        tags: [...new Set(tags)],
        metadata: {
          notionId: page.id,
          createdTime: page.created_time,
          lastEditedTime: page.last_edited_time,
          ...page.properties,
        },
        createdAt: page.created_time,
        updatedAt: page.last_edited_time,
      };

      createItem(item);
      importedCount++;
    } catch (error) {
      console.error(`Error importing Notion page ${page.id}:`, error);
    }
  }

  return importedCount;
}

export function parseNotionDatabase(databaseResults: any[]): NotionPage[] {
  return databaseResults.map(page => {
    const titleProperty = Object.values(page.properties).find(
      (p: any) => p.type === 'title'
    ) as any;
    
    const title = titleProperty?.title?.[0]?.plain_text || 'Untitled';
    
    // Try to find category from select property
    const categoryProperty = Object.values(page.properties).find(
      (p: any) => p.type === 'select' && p.select
    ) as any;
    
    return {
      id: page.id,
      url: page.url,
      title,
      properties: page.properties,
      category: categoryProperty?.select?.name,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
    };
  });
}
