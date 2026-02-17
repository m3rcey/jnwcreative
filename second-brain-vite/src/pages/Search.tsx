import { useState } from 'react';
import type { BrainItem } from '../types';
import { SearchPanel } from '../components/SearchPanel';

interface SearchProps {
  items: BrainItem[];
}

export function Search({ items }: SearchProps) {
  const [filteredItems, setFilteredItems] = useState(items);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        <p className="text-gray-500 mt-1">
          Search across all your memories, conversations, and notes
        </p>
      </header>

      <SearchPanel items={items} onFilterChange={setFilteredItems} />
    </div>
  );
}
