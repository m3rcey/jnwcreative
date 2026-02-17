import { Client } from '@notionhq/client';
import { config } from './config.js';

class NotionClient {
  constructor() {
    this.client = new Client({ auth: config.notion.token });
    this.databaseId = config.notion.databaseId;
  }

  /**
   * Get prospects that haven't been enriched yet
   * Looks for entries without enrichment marker in Conversation Notes
   */
  async getNewProspects() {
    try {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          and: [
            {
              property: 'Name',
              title: { is_not_empty: true }
            },
            {
              or: [
                {
                  property: 'Conversation Notes',
                  rich_text: { is_empty: true }
                },
                {
                  property: 'Conversation Notes',
                  rich_text: { does_not_contain: '--- Auto-Enrichment Results ---' }
                }
              ]
            }
          ]
        }
      });

      return response.results.map(page => this.parseProspect(page));
    } catch (error) {
      console.error('Error fetching prospects from Notion:', error.message);
      return [];
    }
  }

  /**
   * Parse a Notion page into a prospect object
   */
  parseProspect(page) {
    const properties = page.properties;
    const name = properties.Name?.title?.[0]?.text?.content || '';
    const notes = properties['Conversation Notes']?.rich_text?.[0]?.text?.content || '';
    
    return {
      id: page.id,
      name: name.trim(),
      currentNotes: notes,
      url: page.url
    };
  }

  /**
   * Append enrichment results to Conversation Notes
   */
  async appendEnrichment(prospectId, enrichmentText) {
    try {
      // Get current page to append to existing notes
      const page = await this.client.pages.retrieve({ page_id: prospectId });
      const currentNotes = page.properties['Conversation Notes']?.rich_text?.[0]?.text?.content || '';
      
      const separator = currentNotes ? '\n\n' : '';
      const updatedNotes = currentNotes + separator + enrichmentText;

      await this.client.pages.update({
        page_id: prospectId,
        properties: {
          'Conversation Notes': {
            rich_text: [
              {
                text: { content: updatedNotes }
              }
            ]
          }
        }
      });

      console.log(`✅ Enriched prospect: ${prospectId}`);
      return true;
    } catch (error) {
      console.error(`Error updating prospect ${prospectId}:`, error.message);
      return false;
    }
  }
}

export const notionClient = new NotionClient();
