import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
const AppLayout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Topbar onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      
      <div className="app-body">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
