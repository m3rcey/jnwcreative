import { config } from './config.js';

/**
 * Search for social profiles using Brave Search API
 * Note: Uses web_search tool via OpenClaw - in production, use direct API calls
 */
export async function searchSocialProfiles(name) {
  const results = {
    linkedin: null,
    twitter: null,
    instagram: null,
    searchedAt: new Date().toISOString()
  };

  try {
    // Search LinkedIn
    console.log(`🔍 Searching LinkedIn for: ${name}`);
    const linkedinQuery = `${name} LinkedIn profile`;
    results.linkedin = await performSearch(linkedinQuery, 'linkedin.com/in');

    // Search Twitter/X
    console.log(`🔍 Searching Twitter/X for: ${name}`);
    const twitterQuery = `${name} X Twitter profile`;
    results.twitter = await performSearch(twitterQuery, 'twitter.com');

    // Search Instagram
    console.log(`🔍 Searching Instagram for: ${name}`);
    const instagramQuery = `${name} Instagram profile`;
    results.instagram = await performSearch(instagramQuery, 'instagram.com');

  } catch (error) {
    console.error('Error searching social profiles:', error.message);
  }

  return results;
}

/**
 * Perform a web search and extract relevant result
 * In production, this would call Brave Search API directly
 */
async function performSearch(query, domainFilter) {
  try {
    // This simulates what would be a direct Brave API call
    // In the actual implementation with Brave API key:
    
    /*
    const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
      method: 'GET',
      headers: {
        'X-Subscription-Token': config.brave.apiKey,
        'Accept': 'application/json'
      },
      params: new URLSearchParams({
        q: query,
        count: 5,
        offset: 0,
        mkt: 'en-US',
        safesearch: 'moderate',
        freshness: 'all',
        text_decorations: false
      })
    });
    
    const data = await response.json();
    const result = data.web?.results?.[0];
    
    if (result && result.url.includes(domainFilter)) {
      return {
        url: result.url,
        title: result.title,
        description: result.description
      };
    }
    */
    
    // Placeholder for demonstration - returns null to indicate search would happen
    return null;
    
  } catch (error) {
    console.error(`Search error for "${query}":`, error.message);
    return null;
  }
}

/**
 * Format enrichment results for Notion
 */
export function formatEnrichmentResults(results, name) {
  const lines = [
    '--- Auto-Enrichment Results ---',
    `Searched: ${results.searchedAt}`,
    `Name: ${name}`,
    ''
  ];

  if (results.linkedin) {
    lines.push('LinkedIn:', `- ${results.linkedin.url}`, `- ${results.linkedin.title || 'Profile found'}`, '');
  } else {
    lines.push('LinkedIn: No profile found', '');
  }

  if (results.twitter) {
    lines.push('Twitter/X:', `- ${results.twitter.url}`, `- ${results.twitter.title || 'Profile found'}`, '');
  } else {
    lines.push('Twitter/X: No profile found', '');
  }

  if (results.instagram) {
    lines.push('Instagram:', `- ${results.instagram.url}`, `- ${results.instagram.title || 'Profile found'}`, '');
  } else {
    lines.push('Instagram: No profile found', '');
  }

  return lines.join('\n');
}
