import React from 'react';
import { useSidebar } from '../context/SidebarContext';

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent = ({ children }: MainContentProps) => {
  const { isCollapsed } = useSidebar();
  
  return (
    <main className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-72'} p-6`}>
      {children}
    </main>
  );
}; 