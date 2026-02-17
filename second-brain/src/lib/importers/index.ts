import { importMemoryFiles } from './memory';
import { importSlackConversations, parseSlackExport } from './slack';
import { importNotionPages, parseNotionDatabase } from './notion';
import { importUserProfile } from './user-profile';
import { join } from 'path';

export interface ImportResult {
  memory: number;
  slack: number;
  notion: number;
  userProfile: number;
  total: number;
}

export async function runAllImports(workspaceRoot: string): Promise<ImportResult> {
  const results: ImportResult = {
    memory: 0,
    slack: 0,
    notion: 0,
    userProfile: 0,
    total: 0,
  };

  // Import memory files
  const memoryDir = join(workspaceRoot, 'memory');
  results.memory = await importMemoryFiles(memoryDir);

  // Import user profile
  const userProfilePath = join(workspaceRoot, 'USER.md');
  results.userProfile = await importUserProfile(userProfilePath);

  // Note: Slack and Notion imports require external data
  // These would typically be run via API routes with imported data

  results.total = results.memory + results.slack + results.notion + results.userProfile;
  
  console.log(`Import complete:`, results);
  return results;
}

export {
  importMemoryFiles,
  importSlackConversations,
  parseSlackExport,
  importNotionPages,
  parseNotionDatabase,
  importUserProfile,
};
