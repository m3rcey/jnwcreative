import { UserProfileItem } from '@/types';
import { createItem } from '@/lib/db';
import { readFileSync, existsSync } from 'fs';
import matter from 'gray-matter';

export async function importUserProfile(filePath: string): Promise<number> {
  if (!existsSync(filePath)) {
    console.log(`User profile not found: ${filePath}`);
    return 0;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    
    const item: UserProfileItem = {
      id: 'user-profile-main',
      type: 'user_profile',
      title: data.name || 'User Profile',
      content: body,
      source: 'user-profile',
      sourceUrl: `file://${filePath}`,
      date: new Date().toISOString().split('T')[0],
      profileKey: 'main',
      tags: ['profile', 'user'],
      metadata: data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createItem(item);
    return 1;
  } catch (error) {
    console.error(`Error importing user profile:`, error);
    return 0;
  }
}
