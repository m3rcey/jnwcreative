import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Clock, 
  FileText, 
  Brain,
  Tag
} from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/timeline', icon: Clock, label: 'Timeline' },
    { to: '/summaries', icon: FileText, label: 'Summaries' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Second Brain</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Tag className="w-4 h-4" />
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
