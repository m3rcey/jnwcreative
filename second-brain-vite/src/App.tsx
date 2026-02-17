import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { storage } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Search } from './pages/Search';
import { Timeline } from './pages/Timeline';
import { ItemDetail } from './pages/ItemDetail';
import { Summaries } from './pages/Summaries';
import type { BrainItem } from './types';

function App() {
  const [items, setItems] = useState<BrainItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await storage.load();
      setItems(storage.getItems());
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Second Brain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard items={items} />} />
          <Route path="/search" element={<Search items={items} />} />
          <Route path="/timeline" element={<Timeline items={items} />} />
          <Route path="/item/:id" element={<ItemDetail items={items} />} />
          <Route path="/summaries" element={<Summaries />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
