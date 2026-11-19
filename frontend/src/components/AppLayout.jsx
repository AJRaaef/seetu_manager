import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import ChatbotWidget from './ChatbotWidget';

const AppLayout = ({ children }) => {
  const { t } = useTranslation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Topbar onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      
      <div className="app-body">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        
        <main className="main-content d-flex flex-column justify-content-between" style={{ minHeight: 'calc(100vh - 65px)' }}>
          <div className="content-area flex-grow-1">
            {children}
          </div>

          {/* Portal Legal & Statutory Compliance Footer */}
          <footer className="mt-4 pt-2 pb-2 border-top text-muted small d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ fontSize: '0.78rem' }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-semibold text-dark">{t('app_layout.footer_platform', 'SeettuManager Platform')}</span>
              <span>•</span>
              <span className="text-secondary">{t('app_layout.footer_compliance', 'Compliant with The Cheetus Ordinance No. 61 of 1935 (Chapter 190)')}</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Link to="/law" className="text-decoration-none text-muted">{t('app_layout.footer_statutory_law', 'Statutory Law')}</Link>
              <Link to="/rules" className="text-decoration-none text-muted">{t('app_layout.footer_rules', 'Rules')}</Link>
              <Link to="/terms" className="text-decoration-none text-muted">{t('app_layout.footer_terms', 'Terms')}</Link>
              <Link to="/privacy" className="text-decoration-none text-muted">{t('app_layout.footer_privacy', 'Privacy')}</Link>
              <Link to="/disclaimer" className="text-decoration-none text-muted">{t('app_layout.footer_disclaimer', 'Disclaimer')}</Link>
            </div>
          </footer>
        </main>
      </div>

      <ChatbotWidget />
    </div>
  );
};

export default AppLayout;
