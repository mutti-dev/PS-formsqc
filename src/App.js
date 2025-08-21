import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideDrawer from './components/SideDrawer';
import JSONExtractor from './components/JSONExtractor';
import JSONComparator from './components/JSONComparator';
import WordConverter from './components/WordConverter';
import JsonFormatter from './components/JSONFormatter';


function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <SideDrawer />
        <main style={{ marginLeft: '240px', padding: '20px', flex: 1 }}>
          <h1>Form QC Tool</h1>
          <Routes>
            <Route path="/extractor" element={<JSONExtractor />} />
            <Route path="/comparator" element={<JSONComparator />} />
            <Route path="/converter" element={<WordConverter />} />
            <Route path="/jsonformatter" element={<JsonFormatter />} />
            <Route path="*" element={<Navigate to="/extractor" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
