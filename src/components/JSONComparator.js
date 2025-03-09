import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { extractLabelsFromJSON, deepCompareJSON } from '../utils/utils';

export default function JSONComparator() {
  const [json1, setJson1] = useState(null);
  const [json2, setJson2] = useState(null);
  const [report, setReport] = useState([]);

  const handleFile1 = (e) => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = evt => {
        setJson1(JSON.parse(evt.target.result));
      }
      reader.readAsText(file);
    }
  };

  const handleFile2 = (e) => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = evt => {
        setJson2(JSON.parse(evt.target.result));
      }
      reader.readAsText(file);
    }
  };

  const compareJSONs = () => {
    if(json1 && json2) {
      // First extract labels for each JSON
      const data1 = extractLabelsFromJSON(json1);
      const data2 = extractLabelsFromJSON(json2);
      const diffReport = deepCompareJSON(data1, data2);
      setReport(diffReport);
    }
  };

  const exportReport = () => {
    const ws = XLSX.utils.json_to_sheet(report);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "comparison_report.xlsx");
  };

  return (
    <div style={styles.container}>
      <div style={styles.uploadSection}>
        <div style={styles.uploadGroup}>
          <label style={styles.uploadButton}>
            📄 Upload File 1
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFile1}
              style={{ display: 'none' }}
            />
          </label>
          {json1 && <span style={styles.fileStatus}>✓ Loaded</span>}
        </div>
        
        <div style={styles.uploadGroup}>
          <label style={styles.uploadButton}>
            📄 Upload File 2
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFile2}
              style={{ display: 'none' }}
            />
          </label>
          {json2 && <span style={styles.fileStatus}>✓ Loaded</span>}
        </div>
      </div>

      <div style={styles.controlBar}>
        <button 
          onClick={compareJSONs}
          style={styles.compareButton}
          disabled={!json1 || !json2}
        >
          🔍 Compare JSONs
        </button>
      </div>

      {report.length > 0 && (
        <div style={styles.reportContainer}>
          <div style={styles.reportHeader}>
            <h3 style={styles.reportTitle}>Comparison Report ({report.length} issues found)</h3>
            <button 
              onClick={exportReport}
              style={styles.exportButton}
            >
              ⬇️ Export Report
            </button>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.reportTable}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.issueColumn}>Issue Type</th>
                  <th style={styles.detailsColumn}>Details</th>
                </tr>
              </thead>
              <tbody>
                {report.map((item, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.issueBadge(item.issue)}>
                        {item.issue}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{item.details}</td>
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
    fontFamily: "'Inter', system-ui, sans-serif",
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1.5rem',
  },
  uploadSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  uploadGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
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
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#357ABD',
      transform: 'translateY(-1px)',
    },
  },
  fileStatus: {
    color: '#4CAF50',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  controlBar: {
    textAlign: 'center',
    margin: '2rem 0',
  },
  compareButton: {
    backgroundColor: '#9C27B0',
    color: 'white',
    padding: '14px 32px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#7B1FA2',
      transform: 'translateY(-1px)',
    },
    ':disabled': {
      backgroundColor: '#E0E0E0',
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  reportContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    padding: '2rem',
    marginTop: '1.5rem',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  reportTitle: {
    margin: '0',
    color: '#333',
    fontSize: '1.25rem',
  },
  exportButton: {
    backgroundColor: '#00C853',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
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
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #F0F0F0',
  },
  reportTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem',
  },
  tableHeader: {
    backgroundColor: '#F8F9FA',
    borderBottom: '2px solid #E0E0E0',
  },
  tableRow: {
    ':nth-of-type(even)': {
      backgroundColor: '#FAFAFA',
    },
    ':hover': {
      backgroundColor: '#F5F5F5',
    },
  },
  tableCell: {
    padding: '14px 16px',
    borderBottom: '1px solid #EEE',
    textAlign: 'left',
  },
  issueColumn: {
    width: '25%',
  },
  detailsColumn: {
    width: '75%',
  },
  issueBadge: (issueType) => ({
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
    backgroundColor: issueColors[issueType] || '#666',
    color: 'white',
  }),
};

const issueColors = {
  'Missing Key': '#FF5252',
  'Type Mismatch': '#FFC107',
  'Format Difference': '#7C4DFF',
  'Value Difference': '#4CAF50',
};