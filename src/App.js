import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideDrawer from './components/SideDrawer';
import JSONExtractor from './components/JSONExtractor';
import JSONComparator from './components/JSONComparator';
import WordConverter from './components/WordConverter';
import FormComparator from './components/FormComparator';
import TextConverter from './components/TextConverter';
import JsonFormatter from './components/JSONFormatter';



function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <SideDrawer isOpen={drawerOpen} setIsOpen={setDrawerOpen} />
        <main
          style={{
            marginLeft: drawerOpen ? '280px' : '60px',
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '20px',
            flex: 1,
            minWidth: 0,
          }}
        >
          
          <Routes>
            <Route path="/extractor" element={<JSONExtractor />} />
            <Route path="/comparator" element={<JSONComparator />} />
            <Route path="/converter" element={<WordConverter />} />
            <Route path="/form" element={<FormComparator />} />
            <Route path="/jsonformatter" element={<JsonFormatter />} />
            <Route path="/textconverter" element={<TextConverter />} />
            <Route path="*" element={<Navigate to="/extractor" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
