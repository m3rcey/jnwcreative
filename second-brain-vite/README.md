# Second Brain Vite

A personal knowledge management system built with Vite, React, and TypeScript. This application serves as a unified interface for all your digital content — memories, Slack conversations, Notion pages, and user profiles.

## Features

- **Dashboard**: Overview of all your content with statistics and recent items
- **Search**: Full-text search across all content with advanced filters
- **Timeline**: Chronological view of all interactions
- **Rich Content**: Markdown rendering for all content types
- **Tag System**: Automatic tag extraction and filtering
- **Multi-Source**: Import from memory files, Slack exports, and Notion

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Router** - Navigation
- **Marked** - Markdown parsing
- **Lucide React** - Icons

## Quick Start

### 1. Install Dependencies

```bash
cd second-brain-vite
npm install
```

### 2. Import Your Data

Configure the import sources in `public/data/import-config.json`:

```json
{
  "memoryDir": "/path/to/memory/files",
  "slackExportPath": "/path/to/slack/export",
  "notionExportPath": "/path/to/notion/export",
  "userDir": "/path/to/user/files"
}
```

Run the importer:

```bash
npm run import
```

This will generate `public/data/items.json` with all your content.

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Data Import Formats

### Memory Files

Memory files should be markdown files named with date pattern `YYYY-MM-DD.md`:

```markdown
## Morning Notes
Today's trading session was interesting...

## Evening Review
- Setup 1 on NVDA worked well
- Need to be more patient with entries

#trading #review
```

### Slack Export

Slack exports can be:
- Single JSON file with messages array
- Directory containing multiple channel JSON files
- Must include `ts`, `text`, `user`, and optionally `thread_ts` fields

### Notion Export

Notion exports can be:
- Markdown files (`.md`)
- JSON exports (`.json`)
- Directories containing either format

### User Profile

User profiles should be markdown files with a level-1 heading as the name:

```markdown
# Your Name

## Preferences
- Key: value

## Notes
Any content here...
```

## Project Structure

```
second-brain-vite/
├── public/
│   ├── data/
│   │   ├── items.json          # Generated content data
│   │   ├── summaries.json      # Generated summaries
│   │   └── import-config.json  # Import configuration
│   └── brain.svg               # App icon
├── src/
│   ├── components/
│   │   ├── ItemCard.tsx        # Content preview card
│   │   ├── SearchPanel.tsx     # Search with filters
│   │   └── Sidebar.tsx         # Navigation sidebar
│   ├── pages/
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Search.tsx          # Search page
│   │   ├── Timeline.tsx        # Timeline view
│   │   ├── ItemDetail.tsx      # Single item view
│   │   └── Summaries.tsx       # Daily/weekly summaries
│   ├── importers/
│   │   ├── memory.ts           # Memory file importer
│   │   ├── slack.ts            # Slack export importer
│   │   ├── notion.ts           # Notion export importer
│   │   ├── user.ts             # User profile importer
│   │   └── run.ts              # Import runner
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── utils/
│   │   ├── storage.ts          # Data storage manager
│   │   └── helpers.ts          # Utility functions
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## JSON Storage Format

### BrainItem

```typescript
{
  id: string;                    // Unique identifier
  type: 'memory' | 'slack' | 'notion' | 'user' | 'summary';
  title: string;                 // Display title
  content: string;               // Raw markdown content
  contentHtml?: string;          // Pre-rendered HTML
  date: string;                  // ISO date string
  tags: string[];                // Array of tags
  source: string;                // Source identifier
  url?: string;                  // Original URL if available
  threadId?: string;             // For threaded conversations
  parentId?: string;             // For nested items
  metadata: Record<string, any>; // Additional data
  createdAt: string;
  updatedAt: string;
}
```

### DailySummary

```typescript
{
  id: string;
  date: string;
  type: 'daily' | 'weekly';
  content: string;               // Summary text
  highlights: string[];          // Key highlights
  itemCount: number;             // Items in period
  tags: string[];
}
```

## Development

### Adding a New Importer

1. Create a new file in `src/importers/` (e.g., `github.ts`)
2. Export a function that returns `BrainItem[]`
3. Update `src/importers/run.ts` to call your importer
4. Add configuration option to `import-config.json`

### Adding a New Page

1. Create a new component in `src/pages/`
2. Add a route in `src/App.tsx`
3. Add a link in `src/components/Sidebar.tsx`

## Customization

### Styling

The app uses Tailwind CSS. Customize the theme in `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        // Add your colors
      }
    }
  }
}
```

### Search

The search function in `src/utils/storage.ts` can be extended to support:
- Fuzzy matching
- Regular expressions
- Advanced query syntax

## License

MIT
