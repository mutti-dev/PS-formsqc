import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { extractLabelsFromJSON } from '../utils/utils';

export default function JSONExtractor() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = evt => {
        const json = JSON.parse(evt.target.result);
        const extracted = extractLabelsFromJSON(json);
        setData(extracted);
      }
      reader.readAsText(file);
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labels");
    XLSX.writeFile(wb, "labels.xlsx");
  };

  // Filtered data based on label, key, or type
  const filteredData = data.filter(entry =>
    entry.label.toLowerCase().includes(filter.toLowerCase()) ||
    (entry.key && entry.key.toLowerCase().includes(filter.toLowerCase())) ||
    entry.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.uploadContainer}>
        <label style={styles.uploadButton}>
          📁 Upload JSON File
          <input 
            type="file" 
            accept=".json" 
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </label>
        <div style={styles.fileTypes}>.json only</div>
      </div>

      {data.length > 0 && (
        <div style={styles.contentBox}>
          <div style={styles.filterContainer}>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search labels, keys, or types..."
              style={styles.searchInput}
            />
            <button 
              onClick={exportExcel}
              style={styles.exportButton}
            >
              ⬇️ Export to Excel
            </button>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th>Label</th>
                  <th>Key</th>
                  <th>Type</th>
                  <th>Format</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.tableCell}>{entry.label}</td>
                    <td style={styles.tableCell}>{entry.key}</td>
                    <td style={styles.tableCell}>{entry.type}</td>
                    <td style={styles.tableCell}>
                      {entry.type === 'datetime' ? entry.format || '-' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  uploadContainer: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  uploadButton: {
    backgroundColor: '#4A90E2',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#357ABD',
    },
  },
  fileTypes: {
    color: '#666',
    fontSize: '0.9rem',
    marginTop: '8px',
  },
  contentBox: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    padding: '2rem',
  },
  filterContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    minWidth: '300px',
    ':focus': {
      outline: 'none',
      borderColor: '#4A90E2',
      boxShadow: '0 0 0 3px rgba(74, 144, 226, 0.1)',
    },
  },
  exportButton: {
    backgroundColor: '#00C853',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#009624',
    },
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #f0f0f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0',
  },
  tableRow: {
    ':nth-of-type(even)': {
      backgroundColor: '#fafafa',
    },
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  tableCell: {
    padding: '14px 16px',
    borderBottom: '1px solid #eee',
    textAlign: 'left',
  },
};
