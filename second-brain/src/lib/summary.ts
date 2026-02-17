import { Item, Summary } from '@/types';
import { createSummary, getItemsByDateRange } from '@/lib/db';
import { format, subDays, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export function generateDailySummary(date: Date = new Date()): Summary {
  const dateStr = format(date, 'yyyy-MM-dd');
  const startDate = format(startOfDay(date), 'yyyy-MM-dd');
  const endDate = format(endOfDay(date), 'yyyy-MM-dd');
  
  const items = getItemsByDateRange(startDate, endDate);
  
  return createSummaryFromItems(items, 'daily', startDate, endDate, `Daily Summary: ${format(date, 'MMM d, yyyy')}`);
}

export function generateWeeklySummary(date: Date = new Date()): Summary {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  
  const startDate = format(weekStart, 'yyyy-MM-dd');
  const endDate = format(weekEnd, 'yyyy-MM-dd');
  
  const items = getItemsByDateRange(startDate, endDate);
  
  return createSummaryFromItems(items, 'weekly', startDate, endDate, 
    `Weekly Summary: ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
  );
}

function createSummaryFromItems(
  items: Item[],
  period: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string,
  title: string
): Summary {
  // Group items by type
  const byType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get all tags
  const allTags = items.flatMap(i => i.tags);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top tags
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  // Generate highlights
  const highlights: string[] = [];
  
  if (items.length > 0) {
    highlights.push(`Recorded ${items.length} items`);
    
    Object.entries(byType).forEach(([type, count]) => {
      highlights.push(`${count} ${type}(s)`);
    });
  }

  // Create content
  const content = generateSummaryContent(items, byType, topTags);

  const summary: Summary = {
    id: `summary-${period}-${startDate}`,
    period,
    startDate,
    endDate,
    title,
    content,
    highlights,
    itemCount: items.length,
    tags: topTags,
    createdAt: new Date().toISOString(),
  };

  createSummary(summary);
  return summary;
}

function generateSummaryContent(
  items: Item[],
  byType: Record<string, number>,
  topTags: string[]
): string {
  const sections: string[] = [];

  // Overview
  sections.push('# Summary Overview\n');
  sections.push(`Total items: ${items.length}\n`);

  // By Type
  if (Object.keys(byType).length > 0) {
    sections.push('## Items by Type\n');
    Object.entries(byType).forEach(([type, count]) => {
      sections.push(`- ${type}: ${count}`);
    });
    sections.push('');
  }

  // Top Tags
  if (topTags.length > 0) {
    sections.push('## Top Tags\n');
    sections.push(topTags.map(t => `#${t}`).join(', '));
    sections.push('');
  }

  // Recent Items
  if (items.length > 0) {
    sections.push('## Recent Activity\n');
    items.slice(0, 10).forEach(item => {
      sections.push(`- **${item.title}** (${item.type}) - ${item.date}`);
      if (item.content) {
        const preview = item.content.slice(0, 100).replace(/\n/g, ' ');
        sections.push(`  ${preview}${item.content.length > 100 ? '...' : ''}`);
      }
    });
  }

  return sections.join('\n');
}

export function generateSummaryForDateRange(
  startDate: string,
  endDate: string,
  period: 'daily' | 'weekly' | 'monthly'
): Summary {
  const items = getItemsByDateRange(startDate, endDate);
  const title = `Summary: ${startDate} to ${endDate}`;
  
  return createSummaryFromItems(items, period, startDate, endDate, title);
}
