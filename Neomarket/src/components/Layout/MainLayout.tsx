import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import BottomStatusBar from './BottomStatusBar';

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>

      {/* Mobile Sidebar */}
      {isMobile && (
        <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 z-50 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar 
            collapsed={false} 
            onToggle={() => {}} 
          />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
      )}
      
      {/* Main Content Area */}
      <div 
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          !isMobile ? (sidebarCollapsed ? 'md:ml-16' : 'md:ml-64') : ''
        }`}
      >
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="fixed top-4 left-4 z-30 p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700/50 md:hidden"
          >
            <Menu size={24} className="text-white" />
          </button>
        )}

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
