import type { BrainItem } from '../types';
import { StorageManager } from '../utils/storage';
import { parseMarkdown } from '../utils/helpers';
import * as fs from 'fs';

interface SlackMessage {
  ts: string;
  text: string;
  user?: string;
  user_profile?: { display_name?: string; real_name?: string };
  thread_ts?: string;
  reply_count?: number;
  replies?: SlackMessage[];
}

interface SlackChannel {
  name: string;
  messages: SlackMessage[];
}

export function importSlackExport(exportPath: string): BrainItem[] {
  const items: BrainItem[] = [];
  
  if (!fs.existsSync(exportPath)) {
    console.warn(`Slack export not found: ${exportPath}`);
    return items;
  }

  // Handle JSON file or directory
  const stats = fs.statSync(exportPath);
  
  if (stats.isFile() && exportPath.endsWith('.json')) {
    return importSlackJsonFile(exportPath);
  }

  // Directory import
  const files = fs.readdirSync(exportPath)
    .filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(exportPath, file);
    try {
      const fileItems = importSlackJsonFile(filePath);
      items.push(...fileItems);
    } catch (err) {
      console.error(`Error importing Slack file ${file}:`, err);
    }
  }

  return items;
}

export function importSlackJsonFile(filePath: string): BrainItem[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  const fileName = path.basename(filePath, '.json');
  
  const items: BrainItem[] = [];
  const messages: SlackMessage[] = Array.isArray(data) ? data : data.messages || [];
  const channel = data.channel || fileName;

  // Group messages by thread
  const threadMap = new Map<string, SlackMessage[]>();
  const standaloneMessages: SlackMessage[] = [];

  messages.forEach((msg: SlackMessage) => {
    if (msg.thread_ts && msg.thread_ts !== msg.ts) {
      // This is a reply
      if (!threadMap.has(msg.thread_ts)) threadMap.set(msg.thread_ts, []);
      threadMap.get(msg.thread_ts)!.push(msg);
    } else if (msg.reply_count && msg.reply_count > 0) {
      // This is a thread parent
      if (!threadMap.has(msg.ts)) threadMap.set(msg.ts, []);
    } else {
      standaloneMessages.push(msg);
    }
  });

  // Create items for thread parents
  threadMap.forEach((replies, threadTs) => {
    const parentMsg = messages.find(m => m.ts === threadTs);
    if (!parentMsg) return;

    const date = new Date(parseFloat(threadTs) * 1000).toISOString();
    const threadContent = formatThreadContent(parentMsg, replies);

    items.push({
      id: StorageManager.generateId(),
      type: 'slack',
      title: `Slack: #${channel} - ${parentMsg.text.slice(0, 60)}...`,
      content: threadContent,
      contentHtml: parseMarkdown(threadContent),
      date: date,
      tags: ['slack', channel, 'conversation'],
      source: `slack:${channel}`,
      threadId: threadTs,
      metadata: {
        channel,
        participants: getParticipants([parentMsg, ...replies]),
        messageCount: replies.length + 1
      },
      createdAt: date,
      updatedAt: date
    });
  });

  // Create items for standalone messages
  standaloneMessages.forEach(msg => {
    if (!msg.text) return;
    
    const date = new Date(parseFloat(msg.ts) * 1000).toISOString();
    const author = msg.user_profile?.display_name || 
                   msg.user_profile?.real_name || 
                   msg.user || 
                   'Unknown';

    items.push({
      id: StorageManager.generateId(),
      type: 'slack',
      title: `Slack: #${channel} - ${msg.text.slice(0, 60)}...`,
      content: msg.text,
      contentHtml: parseMarkdown(msg.text),
      date: date,
      tags: ['slack', channel],
      source: `slack:${channel}`,
      metadata: {
        channel,
        author,
        userId: msg.user
      },
      createdAt: date,
      updatedAt: date
    });
  });

  return items;
}

function formatThreadContent(parent: SlackMessage, replies: SlackMessage[]): string {
  const parentAuthor = parent.user_profile?.display_name || parent.user || 'Unknown';
  let content = `**${parentAuthor}**: ${parent.text}\n\n`;
  
  if (replies.length > 0) {
    content += '---\n\n**Replies:**\n\n';
    replies.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));
    replies.forEach(reply => {
      const author = reply.user_profile?.display_name || reply.user || 'Unknown';
      content += `> **${author}**: ${reply.text}\n\n`;
    });
  }
  
  return content;
}

function getParticipants(messages: SlackMessage[]): string[] {
  const participants = new Set<string>();
  messages.forEach(msg => {
    const name = msg.user_profile?.display_name || 
                 msg.user_profile?.real_name || 
                 msg.user;
    if (name) participants.add(name);
  });
  return Array.from(participants);
}

import * as path from 'path';
