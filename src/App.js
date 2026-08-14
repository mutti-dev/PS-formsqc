import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SideDrawer from './common/SideDrawer';
import JSONExtractor from './screens/JSONExtractor';
import WordConverter from './screens/WordConverter';

import TextConverter from './screens/TextConverter';

import AdvancedJSONComparator from './screens/AdvancedJSONComparator';
import AIPrompt from './screens/AIPrompt';

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

  return (
    <div data-bs-theme={theme} className="app-root">
      <Router>
        <div className="app-layout">

          <SideDrawer isOpen={drawerOpen} setIsOpen={setDrawerOpen} theme={theme} toggleTheme={toggleTheme} />

          <main
            className="app-main"
            style={{
              marginLeft: drawerOpen ? '280px' : '55px',
              transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: theme === 'dark' ? 'var(--bs-body-bg)' : '#f5f5f5',
              color: theme === 'dark' ? 'var(--bs-body-color)' : '#000',
            }}
          >
            <Routes>
              <Route path="/JsonExtractor" element={<JSONExtractor theme={theme} />} />
              <Route path="/Converter" element={<WordConverter />} />

              <Route path="/AdvancedJSONComparator" element={<AdvancedJSONComparator theme={theme} />} />
   
              <Route path="/TextConverter" element={<TextConverter />} />
              <Route path="/AIPrompt" element={<AIPrompt />} />
              <Route path="*" element={<Navigate to="/JsonExtractor" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;