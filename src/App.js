import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideDrawer from './common/SideDrawer';
import JSONExtractor from './screens/JSONExtractor';
import WordConverter from './screens/WordConverter';
import FormComparator from './screens/FormComparator';
import TextConverter from './screens/TextConverter';
import JsonFormatter from './screens/JSONFormatter';



function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div data-bs-theme="dark" className="app-root">
      <Router>
        <div className="app-layout">
          <SideDrawer isOpen={drawerOpen} setIsOpen={setDrawerOpen} />

          <main
            className="app-main"
            style={{
              marginLeft: drawerOpen ? '280px' : '55px',
              transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
             
              backgroundColor: '#121212',
            }}
          >
            <Routes>
              <Route path="/extractor" element={<JSONExtractor />} />
              <Route path="/converter" element={<WordConverter />} />
              <Route path="/form" element={<FormComparator />} />
              <Route path="/jsonformatter" element={<JsonFormatter />} />
              <Route path="/textconverter" element={<TextConverter />} />
              <Route path="*" element={<Navigate to="/extractor" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}


export default App;
