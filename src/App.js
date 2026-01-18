import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import SideDrawer from './common/SideDrawer';
import JSONExtractor from './screens/JSONExtractor';
import WordConverter from './screens/WordConverter';
import FormComparator from './screens/FormComparator';
import TextConverter from './screens/TextConverter';
import JsonFormatter from './screens/JSONFormatter';
import ThemeChange from './common/ThemeChange';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState('dark');


  
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };
  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    setTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div data-bs-theme={theme} className="app-root">
      <Router>
        <div className="app-layout">

          <SideDrawer isOpen={drawerOpen} setIsOpen={setDrawerOpen} />

          <main
            className="app-main"
            style={{
              marginLeft: drawerOpen ? '280px' : '55px',
              transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
              color: theme === 'dark' ? '#fff' : '#000',
            }}
          >
            <ThemeChange theme={theme} toggleTheme={toggleTheme} />
            <Routes>
              <Route path="/JsonExtractor" element={<JSONExtractor />} />
              <Route path="/Converter" element={<WordConverter />} />
              <Route path="/FormComparator" element={<FormComparator />} />
              <Route path="/Jsonformatter" element={<JsonFormatter />} />
              <Route path="/TextConverter" element={<TextConverter />} />
              <Route path="*" element={<Navigate to="/extractor" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;
