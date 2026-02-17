import { SlackItem } from '@/types';
import { createItem } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface SlackMessage {
  ts: string;
  text: string;
  user?: string;
  username?: string;
  channel?: string;
  thread_ts?: string;
  reactions?: { name: string; count: number }[];
  attachments?: any[];
  blocks?: any[];
}

export async function importSlackConversations(
  messages: SlackMessage[],
  channelName: string
): Promise<number> {
  let importedCount = 0;

  for (const msg of messages) {
    try {
      const date = new Date(parseFloat(msg.ts) * 1000).toISOString();
      const dateStr = date.split('T')[0];
      
      const item: SlackItem = {
        id: `slack-${msg.ts.replace('.', '-')}`,
        type: 'slack',
        title: `Slack: ${channelName} - ${msg.username || msg.user || 'Unknown'}`,
        content: msg.text,
        source: 'slack',
        sourceUrl: msg.thread_ts 
          ? `https://slack.com/archives/${channelName}/p${msg.thread_ts.replace('.', '')}` 
          : undefined,
        date: dateStr,
        channel: channelName,
        author: msg.username || msg.user || 'Unknown',
        threadTs: msg.thread_ts,
        reactions: msg.reactions?.map(r => r.name) || [],
        tags: ['slack', channelName, msg.thread_ts ? 'thread' : 'message'],
        metadata: {
          timestamp: msg.ts,
          user: msg.user,
          attachments: msg.attachments || [],
          blocks: msg.blocks || [],
        },
        createdAt: date,
        updatedAt: date,
      };

      createItem(item);
      importedCount++;
    } catch (error) {
      console.error(`Error importing Slack message:`, error);
    }
  }

  return importedCount;
}

export function parseSlackExport(exportData: any[]): { channel: string; messages: SlackMessage[] }[] {
  const channels: Map<string, SlackMessage[]> = new Map();

  for (const entry of exportData) {
    if (entry.type === 'message' && entry.text) {
      const channel = entry.channel || 'general';
      if (!channels.has(channel)) {
        channels.set(channel, []);
      }
      channels.get(channel)!.push(entry);
    }
  }

  return Array.from(channels.entries()).map(([channel, messages]) => ({
    channel,
    messages,
  }));
}
