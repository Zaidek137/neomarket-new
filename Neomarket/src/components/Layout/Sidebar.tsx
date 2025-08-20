import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Grid3X3, 
  Gavel, 
  Zap, 
  User, 
  Activity, 
  Settings,
  ShoppingCart,
  Vote
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { icon: Home, label: 'Home', path: '/explore' },
  { icon: Grid3X3, label: 'Collections', path: '/collections' },
  { icon: ShoppingCart, label: 'The Exchange', path: '/exchange' },
  { icon: Gavel, label: 'Auctions', path: '/auctions' },
  { icon: Vote, label: 'Voting Circuit', path: '/voting-circuit' },
  { icon: Zap, label: 'The Dark Circuit', path: '/dark-circuit' },
  { icon: User, label: 'My Ekos', path: '/my-ekos' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 flex flex-col backdrop-blur-sm z-40",
        collapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={() => collapsed && onToggle()}
      onMouseLeave={() => !collapsed && onToggle()}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <img 
            src="https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Homepage%20Images/Neomarket%20Log.png"
            alt="NeoMarket Logo"
            className="w-12 h-8 object-contain rounded-lg shadow-lg shadow-cyan-500/25"
          />
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              NeoMarket
            </span>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
                    "hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
                    "backdrop-blur-sm border border-transparent hover:border-slate-600/50",
                    isActive && "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30 shadow-lg shadow-cyan-500/10",
                    !isActive && "text-slate-400 hover:text-white"
                  )}
                >
                  <Icon size={20} className={cn(
                    "flex-shrink-0 transition-all duration-300",
                    isActive && "text-cyan-400 drop-shadow-lg",
                    !isActive && "group-hover:text-cyan-400"
                  )} />
                  {!collapsed && (
                    <span className={cn(
                      "font-medium text-sm transition-all duration-300",
                      isActive && "text-white"
                    )}>
                      {item.label}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                  )}
                </button>
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800/90 border-l border-b border-slate-600/50 rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
