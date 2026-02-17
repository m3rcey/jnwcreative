import React from 'react';
import { 
  LayoutDashboard, Robot, Wrench, Shield, GitBranch, 
  Settings, X, Menu 
} from './Icons';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'agents', label: 'Agents', icon: <Robot size={20} /> },
  { id: 'tools', label: 'Tools', icon: <Wrench size={20} /> },
  { id: 'approvals', label: 'Approvals', icon: <Shield size={20} />, badge: 4 },
  { id: 'workflows', label: 'Workflows', icon: <GitBranch size={20} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Mission Control</h1>
              <p className="text-xs text-gray-500">Trading System</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                onClose();
              }}
              className={`w-full sidebar-item ${
                activeView === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'
              }`}
            >
              <span className={activeView === item.id ? 'text-primary-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              <span className="ml-3 flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full sidebar-item-inactive">
            <Settings size={20} className="text-gray-400" />
            <span className="ml-3">Settings</span>
          </button>
          <div className="mt-4 text-xs text-gray-400 text-center">
            v1.0.0 • Mission Control
          </div>
        </div>
      </aside>
    </>
  );
};

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-green-700">System Online</span>
          </div>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">MC</span>
          </div>
        </div>
      </div>
    </header>
  );
};
