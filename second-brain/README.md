# Second Brain

A Next.js application for reviewing notes, conversations, and memories. This is a personal knowledge management system that aggregates data from multiple sources into a searchable, filterable interface.

## Features

- **Dashboard**: Overview of all your knowledge with statistics and recent items
- **Search & Filter**: Full-text search across all content with filters for date, type, source, and tags
- **Timeline View**: Chronological view of all interactions and memories
- **Summaries**: Automatic daily and weekly summary generation
- **Rich Text Rendering**: Markdown support for all content
- **Multiple Data Sources**:
  - Memory files (YYYY-MM-DD.md format)
  - Slack conversations
  - Notion CRM data
  - User profile files

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **SQLite** (better-sqlite3) for data storage
- **React Markdown** for rich text rendering
- **date-fns** for date formatting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd /home/merce/.openclaw/workspace/second-brain
```

2. Install dependencies:
```bash
npm install
```

3. Create the data directory:
```bash
mkdir -p data
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Data Import

### Memory Files
Place memory files in the `memory/` directory with the format `YYYY-MM-DD.md`. Each file should contain YAML frontmatter:

```markdown
---
title: My Memory
tags: [memory, important]
---

Content here...
```

### Slack Data
Import Slack conversations via the API:

```bash
POST /api/import
{
  "workspaceRoot": "/path/to/workspace"
}
```

Or use the "Import Data" button in the dashboard.

### Notion Data
Export Notion data as JSON and import via the API.

## Database Schema

The application uses SQLite with the following schema:

### Items Table
- `id` (TEXT PRIMARY KEY)
- `type` (TEXT) - memory, slack, notion, user_profile, note
- `title` (TEXT)
- `content` (TEXT)
- `source` (TEXT)
- `source_url` (TEXT)
- `date` (TEXT)
- `tags` (TEXT JSON array)
- `metadata` (TEXT JSON object)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### Full-Text Search
FTS5 virtual table for fast full-text search across titles, content, and tags.

### Summaries Table
- `id` (TEXT PRIMARY KEY)
- `period` (TEXT) - daily, weekly, monthly
- `start_date` (TEXT)
- `end_date` (TEXT)
- `title` (TEXT)
- `content` (TEXT)
- `highlights` (TEXT JSON array)
- `item_count` (INTEGER)
- `tags` (TEXT JSON array)
- `created_at` (TEXT)

## API Routes

### Items
- `GET /api/items` - Search items with filters
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get single item
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Metadata
- `GET /api/metadata?type=tags` - Get all tags
- `GET /api/metadata?type=sources` - Get all sources
- `GET /api/metadata?type=stats` - Get statistics
- `GET /api/metadata` - Get all metadata

### Summaries
- `GET /api/summaries?period=daily|weekly` - Get summaries
- `POST /api/summaries` - Generate new summary

### Import
- `POST /api/import` - Run data import

## Environment Variables

```env
DATABASE_PATH=/path/to/second-brain.db
```

Default: `./data/second-brain.db`

## Project Structure

```
second-brain/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── items/        # Item detail pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Dashboard
│   │   └── globals.css   # Global styles
│   ├── components/
│   │   ├── ui/           # UI components (Card, Button, etc.)
│   │   └── dashboard/    # Dashboard components
│   ├── lib/
│   │   ├── db/           # Database utilities
│   │   ├── importers/    # Data importers
│   │   ├── utils/        # Utility functions
│   │   └── summary.ts    # Summary generation
│   └── types/
│       └── index.ts      # TypeScript types
├── data/                 # SQLite database
├── memory/              # Memory files (imported)
└── README.md
```

## Usage

1. **Dashboard**: View statistics and recent items
2. **Search**: Use the search bar to find content across all sources
3. **Filters**: Filter by date range, type, source, or tags
4. **Timeline**: View items chronologically
5. **Summaries**: Generate daily/weekly summaries of your activity
6. **Item Detail**: Click any item to view full content and metadata

## Development

### Adding New Importers

1. Create a new file in `src/lib/importers/`
2. Export a function that parses your data source
3. Add it to `src/lib/importers/index.ts`
4. Call it from the import API route

### Database Migrations

The schema is automatically created on first run. To modify:

1. Update `initializeSchema()` in `src/lib/db/index.ts`
2. Restart the application

## License

MIT
