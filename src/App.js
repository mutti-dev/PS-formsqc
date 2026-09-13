import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SideDrawer from './common/SideDrawer';
import BackToTop from './common/BackToTop';
import { Analytics } from '@vercel/analytics/react';
import { getEnabledTools, getDefaultRoute, APP_CONFIG } from './config/toolsConfig';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const THEME_STORAGE_KEY = 'appTheme';

  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch (err) {
      console.warn('Unable to load saved theme', err);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (err) {
      console.warn('Unable to save theme', err);
    }
  }, [theme]);

  useEffect(() => {
    if (APP_CONFIG && APP_CONFIG.siteTitle) {
      document.title = APP_CONFIG.siteTitle;
    }
  }, []);

  const enabledTools = getEnabledTools();
  const defaultRoute = getDefaultRoute();

  return (
    <div data-bs-theme={theme} className="app-root">
      <Router>
        <div className="app-layout">
          <SideDrawer isOpen={drawerOpen} setIsOpen={setDrawerOpen} theme={theme} toggleTheme={toggleTheme} />

          <main
            className="app-main"
            style={{
              marginLeft: drawerOpen ? '280px' : '80px',
              transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: theme === 'dark' ? 'var(--bs-body-bg)' : '#f5f5f5',
              color: theme === 'dark' ? 'var(--bs-body-color)' : '#000',
            }}
          >
            <Routes>
              {enabledTools.map((tool) => (
                <Route
                  key={tool.id}
                  path={tool.path}
                  element={tool.render(theme)}
                />
              ))}
              <Route path="*" element={<Navigate to={defaultRoute} replace />} />
            </Routes>
            <BackToTop />
          </main>
        </div>
      </Router>
      <Analytics />
    </div>
  );
}

export default App;