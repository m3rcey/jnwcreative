import axios from 'axios';
import { config } from './config.js';

/**
 * Send notification to Slack
 */
export async function sendSlackNotification(changes) {
  if (!config.slack.webhookUrl) {
    console.log('⚠️  No Slack webhook configured, skipping notification');
    console.log('   Changes:', JSON.stringify(changes, null, 2));
    return false;
  }

  const message = formatSlackMessage(changes);
  
  try {
    await axios.post(config.slack.webhookUrl, message, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Slack notification sent');
    return true;
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error.message);
    return false;
  }
}

/**
 * Format changes into Slack message
 */
function formatSlackMessage(changes) {
  const date = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🛏️ Daily Competitor Report - ${date}`,
        emoji: true
      }
    },
    {
      type: 'divider'
    }
  ];

  // Price changes section
  if (changes.priceChanges.length > 0) {
    const priceLines = changes.priceChanges.map(c => {
      const arrow = c.direction === 'increase' ? '🔼' : '🔽';
      const sign = c.difference > 0 ? '+' : '';
      return `• *${c.competitor}* - ${c.product}: $${c.oldPrice} → $${c.newPrice} (${sign}$${c.difference}) ${arrow}`;
    });

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📊 PRICE CHANGES:*\n${priceLines.join('\n')}`
      }
    });
  } else {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📊 PRICE CHANGES:*\nNo price changes detected'
      }
    });
  }

  blocks.push({ type: 'divider' });

  // New promotions section
  if (changes.newPromotions.length > 0) {
    const promoLines = changes.newPromotions.map(p => 
      `• *${p.competitor}:* ${p.text}`
    );

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🎉 NEW PROMOTIONS:*\n${promoLines.join('\n')}`
      }
    });
  } else {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*🎉 NEW PROMOTIONS:*\nNo new promotions detected'
      }
    });
  }

  blocks.push({ type: 'divider' });

  // Policy changes section
  if (changes.policyChanges.length > 0) {
    const policyLines = changes.policyChanges.map(p => {
      if (p.type === 'trial') {
        return `• *${p.competitor}:* Trial period changed from ${p.old} to ${p.new} days`;
      }
      if (p.type === 'warranty') {
        return `• *${p.competitor}:* Warranty changed from ${p.old} to ${p.new} years`;
      }
      return `• *${p.competitor}:* Policy updated`;
    });

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📋 POLICY UPDATES:*\n${policyLines.join('\n')}`
      }
    });
    blocks.push({ type: 'divider' });
  }

  // Summary footer
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: 'Reply *DETAILED* for full comparison table'
      }
    ]
  });

  return {
    blocks,
    text: `Competitor Report ${date}: ${changes.priceChanges.length} price changes, ${changes.newPromotions.length} new promotions`
  };
}

/**
 * Generate detailed comparison table (for DETAILED response)
 */
export function generateDetailedTable(allData) {
  // This would be called when user replies "DETAILED" in Slack
  // For now, returns a formatted text table
  
  let table = '*FULL COMPETITOR COMPARISON*\n\n';
  table += '| Competitor | Product | Category | Price | Trial | Warranty |\n';
  table += '|------------|---------|----------|-------|-------|----------|\n';

  for (const [key, data] of Object.entries(allData)) {
    if (data.error) continue;
    
    const trial = data.policies?.trialPeriodDays || 'N/A';
    const warranty = data.policies?.warrantyYears || 'N/A';
    
    for (const product of data.products || []) {
      table += `| ${data.name} | ${product.name} | ${product.category} | $${product.price} | ${trial} days | ${warranty} yrs |\n`;
    }
  }

  return table;
}

// Run directly if called from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  // Test notification
  const testChanges = {
    priceChanges: [
      { competitor: 'Saatva', product: 'Saatva Classic', oldPrice: 1595, newPrice: 1495, difference: -100, direction: 'decrease' }
    ],
    newPromotions: [
      { competitor: 'Helix', text: 'Presidents Day Sale - $200 off + 2 free pillows' }
    ],
    policyChanges: []
  };
  
  sendSlackNotification(testChanges).then(() => {
    console.log('Test notification complete');
  });
}
