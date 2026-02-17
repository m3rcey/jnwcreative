import * as fs from 'fs';
import * as path from 'path';
import { importAllMemoryFiles } from './memory';
import { importSlackExport } from './slack';
import { importNotionExport } from './notion';
import { importAllUserFiles } from './user';
import type { BrainItem } from '../types';

const DATA_DIR = './public/data';
const WORKSPACE_DIR = '/home/merce/.openclaw/workspace';

interface ImportConfig {
  memoryDir?: string;
  slackExportPath?: string;
  notionExportPath?: string;
  userDir?: string;
}

function loadConfig(): ImportConfig {
  const configPath = path.join(DATA_DIR, 'import-config.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  return {};
}

function saveItems(items: BrainItem[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  const itemsPath = path.join(DATA_DIR, 'items.json');
  fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2));
  console.log(`Saved ${items.length} items to ${itemsPath}`);
}

function runImport(): void {
  console.log('🧠 Second Brain Data Importer\n');
  
  const config = loadConfig();
  const allItems: BrainItem[] = [];

  // Import memory files
  const memoryDir = config.memoryDir || path.join(WORKSPACE_DIR, 'memory');
  console.log(`Importing memory files from: ${memoryDir}`);
  const memoryItems = importAllMemoryFiles(memoryDir);
  allItems.push(...memoryItems);
  console.log(`  ✓ Imported ${memoryItems.length} memory items\n`);

  // Import Slack export
  if (config.slackExportPath) {
    console.log(`Importing Slack export from: ${config.slackExportPath}`);
    const slackItems = importSlackExport(config.slackExportPath);
    allItems.push(...slackItems);
    console.log(`  ✓ Imported ${slackItems.length} Slack items\n`);
  } else {
    console.log('Skipping Slack import (no path configured)\n');
  }

  // Import Notion export
  if (config.notionExportPath) {
    console.log(`Importing Notion export from: ${config.notionExportPath}`);
    const notionItems = importNotionExport(config.notionExportPath);
    allItems.push(...notionItems);
    console.log(`  ✓ Imported ${notionItems.length} Notion items\n`);
  } else {
    console.log('Skipping Notion import (no path configured)\n');
  }

  // Import user files
  const userDir = config.userDir || WORKSPACE_DIR;
  console.log(`Importing user files from: ${userDir}`);
  const userItems = importAllUserFiles(userDir);
  allItems.push(...userItems);
  console.log(`  ✓ Imported ${userItems.length} user items\n`);

  // Save all items
  saveItems(allItems);
  
  // Generate summary
  const byType = allItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 Import Summary:');
  console.log(`  Total items: ${allItems.length}`);
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
}

runImport();
