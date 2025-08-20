import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import BottomStatusBar from './BottomStatusBar';

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Left Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content Area */}
      <div 
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Sticky Header */}
        <TopHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        
        {/* Bottom Status Bar */}
        <BottomStatusBar />
      </div>
    </div>
  );
}
