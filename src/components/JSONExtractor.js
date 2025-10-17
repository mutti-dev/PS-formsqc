import React, { useState } from "react";
import * as XLSX from "xlsx";
import { extractLabelsFromJSON } from "../utils/utils";

export default function JSONExtractor() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState(["columns", "content", "container", "panel"]);
  const [keyLengthThreshold, setKeyLengthThreshold] = useState(110);

  const handleExtract = () => {
    if (!jsonInput.trim()) {
      setError("Please paste your JSON data");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const json = JSON.parse(jsonInput);
      const extracted = extractLabelsFromJSON(json);
      setData(extracted);
    } catch (err) {
      setError("Invalid JSON format. Please check your input.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setJsonInput("");
    setData([]);
    setError("");
    setFilter("");
  };

  const toggleTypeVisibility = (type) => {
    setHiddenTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const exportData = data
    .filter((entry) => !hiddenTypes.includes(entry.type))
    .map((entry) => ({
      Label: entry.type === "panel" ? entry.title : entry.label,
      Key: entry.key || "",
      KeyLength: entry.key ? entry.key.length : 0,
      Type: entry.type,
      Format: entry.format || "",
    }));

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labels");
    XLSX.writeFile(wb, "labels.xlsx");
  };

  const filteredData = data.filter((entry) => {
    if (hiddenTypes.includes(entry.type)) return false;
    const lowerFilter = filter.toLowerCase();
    const matchesLabel = entry.label?.toLowerCase().includes(lowerFilter);
    const matchesKey = entry.key?.toLowerCase().includes(lowerFilter);
    const matchesType = entry.type?.toLowerCase().includes(lowerFilter);
    const matchesPanelTitle = entry.type === "panel" && entry.title?.toLowerCase().includes(lowerFilter);
    return matchesLabel || matchesKey || matchesType || matchesPanelTitle;
  });

  const longKeys = data.filter((entry) => entry.key && entry.key.length > keyLengthThreshold);

  const labelCounts = {};
  data.forEach((entry) => {
    if (entry.type === "columns" || entry.type === "content") return;
    const labelKey = entry.type === "panel" ? entry.title : entry.label;
    if (!labelKey) return;
    labelCounts[labelKey] = (labelCounts[labelKey] || 0) + 1;
  });
  const duplicateLabels = Object.entries(labelCounts)
    .filter(([_, count]) => count > 1)
    .map(([label, count]) => ({ label, count }));

  const uniqueTypes = [...new Set(data.map((entry) => entry.type))];

  // 🟢 Extract SELECT components from JSON
  const extractSelectValues = (jsonData) => {
    const selectItems = [];
    const traverse = (obj) => {
      if (obj && typeof obj === "object") {
        if (Array.isArray(obj)) {
          obj.forEach(traverse);
        } else {
          if (obj.type === "select" && obj.data?.values) {
            selectItems.push({
              label: obj.label || "Unknown",
              key: obj.key || "Unknown",
              values: obj.data.values.map((v) => ({
                label: v.label,
                value: v.value,
              })),
            });
          }
          Object.values(obj).forEach(traverse);
        }
      }
    };
    try {
      const parsed = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
      traverse(parsed);
    } catch (e) {
      console.error("Error parsing JSON for select values:", e);
    }
    return selectItems;
  };

  // 🟣 Extract SURVEY components separately
  const extractSurveyValues = (jsonData) => {
    const surveyItems = [];
    const traverse = (obj) => {
      if (obj && typeof obj === "object") {
        if (Array.isArray(obj)) {
          obj.forEach(traverse);
        } else {
          if (obj.type === "survey" && Array.isArray(obj.questions)) {
            surveyItems.push({
              label: obj.label || "Unknown",
              key: obj.key || "Unknown",
              questions: obj.questions.map((q) => ({
                label: q.label,
                value: q.value,
              })),
            });
          }
          Object.values(obj).forEach(traverse);
        }
      }
    };
    try {
      const parsed = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
      traverse(parsed);
    } catch (e) {
      console.error("Error parsing JSON for survey values:", e);
    }
    return surveyItems;
  };

  const selectValues = jsonInput ? extractSelectValues(jsonInput) : [];
  const surveyValues = jsonInput ? extractSurveyValues(jsonInput) : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>JSON Label Extractor</h1>
        <p style={styles.subtitle}>Paste your JSON data below and extract labels with key information</p>
      </div>

      {/* JSON Input Section */}
      <div style={styles.inputSection}>
        <div style={styles.inputHeader}>
          <h2 style={styles.sectionTitle}>📄 JSON Input</h2>
          <button onClick={clearAll} style={styles.clearButton} disabled={!jsonInput && data.length === 0}>
            🗑️ Clear All
          </button>
        </div>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste your JSON data here..."
          style={styles.textarea}
          rows={10}
        />

        {error && <div style={styles.errorMessage}>⚠️ {error}</div>}

        <div style={styles.buttonContainer}>
          <button onClick={handleExtract} style={styles.extractButton} disabled={isLoading || !jsonInput.trim()}>
            {isLoading ? "⏳ Extracting..." : "🔍 Extract Labels"}
          </button>
        </div>

        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <label htmlFor="keyLengthThreshold" style={{ fontWeight: 500, color: "#1e293b" }}>
            Key Length Threshold:
          </label>
          <input
            id="keyLengthThreshold"
            type="number"
            min={1}
            value={keyLengthThreshold}
            onChange={(e) => setKeyLengthThreshold(Number(e.target.value))}
            style={{
              padding: "8px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "1rem",
              width: "100px",
            }}
          />
        </div>
      </div>

      {data.length > 0 && (
        <div style={styles.resultsSection}>
          <div style={styles.resultsHeader}>
            <h2 style={styles.sectionTitle}>📊 Extracted Labels ({data.length} items)</h2>
            <button onClick={exportExcel} style={styles.exportButton}>
              ⬇️ Export to Excel
            </button>
          </div>

          <div style={styles.analyticsContainer}>
            {/* Duplicate Labels */}
            {duplicateLabels.length > 0 && (
              <div style={styles.analyticsBox}>
                <div style={styles.analyticsHeader}>🔄 Duplicate Labels ({duplicateLabels.length})</div>
                <div style={styles.duplicateList}>
                  {duplicateLabels.map(({ label, count }, idx) => (
                    <div key={idx} style={styles.duplicateItem}>
                      <span style={styles.duplicateLabel}>{label}</span>
                      <span style={styles.duplicateCount}>{count} occurrences</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SELECT Components */}
            {selectValues.length > 0 && (
              <div style={styles.analyticsBox}>
                <div style={styles.analyticsHeader}>📋 Select Components ({selectValues.length})</div>
                <div style={styles.selectList}>
                  {selectValues.map((select, idx) => (
                    <div key={idx} style={styles.selectItem}>
                      <div style={styles.selectLabel}>
                        <strong>{select.label}</strong> ({select.key})
                      </div>
                      <div style={styles.selectValues}>
                        {select.values.map((option, optIdx) => (
                          <span key={optIdx} style={styles.selectValue}>
                            {option.label} ({option.value})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🟣 SURVEY Components — NEW BOX */}
            {surveyValues.length > 0 && (
              <div style={styles.analyticsBox}>
                <div style={styles.analyticsHeader}>🧩 Survey Components ({surveyValues.length})</div>
                <div style={styles.selectList}>
                  {surveyValues.map((survey, idx) => (
                    <div key={idx} style={styles.selectItem}>
                      <div style={styles.selectLabel}>
                        <strong>{survey.label}</strong> ({survey.key})
                      </div>
                      <div style={styles.selectValues}>
                        {survey.questions.map((q, qIdx) => (
                          <span key={qIdx} style={styles.selectValue}>
                            {q.label} ({q.value})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Type Filter */}
            <div style={styles.analyticsBox}>
              <div style={styles.analyticsHeader}>🎯 Filter by Type</div>
              <div style={styles.typeFilters}>
                {uniqueTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleTypeVisibility(type)}
                    style={{
                      ...styles.typeFilterButton,
                      ...(hiddenTypes.includes(type)
                        ? styles.typeFilterButtonHidden
                        : {}),
                    }}
                  >
                    {hiddenTypes.includes(type) ? "👁️‍🗨️" : "👁️"} {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ⚠️ Key length warnings */}
          {longKeys.length > 0 && (
            <div style={styles.warningBox}>
              <div style={styles.warningHeader}>⚠️ Key Length Warning</div>
              <p style={styles.warningText}>
                {longKeys.length} key(s) exceed {keyLengthThreshold} characters:
              </p>
              <div style={styles.warningList}>
                {longKeys.map((entry, idx) => (
                  <div key={idx} style={styles.warningItem}>
                    <strong>{entry.label}</strong>: {entry.key.length} characters
                    <div style={styles.truncatedKey}>
                      {entry.key.substring(0, keyLengthThreshold)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter & Table */}
          <div style={styles.filterContainer}>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="🔍 Search labels, keys, or types..."
              style={styles.searchInput}
            />
            <div style={styles.filterInfo}>
              Showing {filteredData.length} of {data.length} items
              {hiddenTypes.length > 0 && (
                <span style={styles.hiddenTypesInfo}>
                  ({hiddenTypes.length} type{hiddenTypes.length > 1 ? "s" : ""} hidden)
                </span>
              )}
            </div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableHeaderCell}>Label</th>
                  <th style={styles.tableHeaderCell}>Key</th>
                  <th style={styles.tableHeaderCell}>Key Length</th>
                  <th style={styles.tableHeaderCell}>Type</th>
                  <th style={styles.tableHeaderCell}>Format</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.tableCell}>{entry.type === "panel" ? entry.title : entry.label}</td>
                    <td style={styles.tableCell}>
                      <div style={styles.keyCell}>
                        <span style={styles.keyText}>{entry.key}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.keyLength,
                          color:
                            entry.key && entry.key.length > keyLengthThreshold
                              ? "#e74c3c"
                              : "#27ae60",
                        }}
                      >
                        {entry.key ? entry.key.length : 0}
                        {entry.key && entry.key.length > keyLengthThreshold && (
                          <span style={styles.warningIcon}> ⚠️</span>
                        )}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.typeTag}>{entry.type}</span>
                    </td>
                    <td style={styles.tableCell}>{entry.format || "-"}</td>
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
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    margin: 0,
  },
  inputSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  inputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  clearButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s",
    opacity: 0.8,
  },
  textarea: {
    width: "100%",
    minHeight: "200px",
    padding: "1rem",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontFamily: "'JetBrains Mono', 'Consolas', monospace",
    resize: "vertical",
    transition: "border-color 0.2s",
    backgroundColor: "#fafafa",
    boxSizing: "border-box",
  },
  errorMessage: {
    color: "#e74c3c",
    backgroundColor: "#fef2f2",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "1rem",
    fontSize: "0.9rem",
    border: "1px solid #fecaca",
  },
  buttonContainer: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  extractButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  resultsSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  exportButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  warningBox: {
    backgroundColor: "#fef3cd",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem",
  },
  warningHeader: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#92400e",
    marginBottom: "0.5rem",
  },
  warningText: {
    color: "#92400e",
    margin: "0 0 0.5rem 0",
  },
  warningList: {
    maxHeight: "200px",
    overflowY: "auto",
  },
  warningItem: {
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
    color: "#92400e",
  },
  truncatedKey: {
    fontSize: "0.8rem",
    color: "#6b7280",
    fontFamily: "'JetBrains Mono', 'Consolas', monospace",
    marginTop: "0.25rem",
  },
  filterContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "border-color 0.2s",
  },
  filterInfo: {
    color: "#64748b",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  tableContainer: {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
  },
  tableHeaderCell: {
    padding: "1rem",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    borderBottom: "2px solid #e2e8f0",
  },
  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  tableCell: {
    padding: "1rem",
    verticalAlign: "top",
  },
  labelText: {
    fontWeight: "500",
    color: "#1e293b",
  },
  keyCell: {
    maxWidth: "300px",
  },
  keyText: {
    fontFamily: "'JetBrains Mono', 'Consolas', monospace",
    fontSize: "0.85rem",
    color: "#475569",
    wordBreak: "break-all",
  },
  keyLength: {
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  warningIcon: {
    fontSize: "0.8rem",
  },
  typeTag: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  analyticsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  analyticsBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "1rem",
  },
  analyticsHeader: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "0.75rem",
  },
  duplicateList: {
    maxHeight: "200px",
    overflowY: "auto",
  },
  duplicateItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
    borderBottom: "1px solid #e2e8f0",
  },
  duplicateLabel: {
    fontWeight: "500",
    color: "#374151",
  },
  duplicateCount: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  selectList: {
    maxHeight: "300px",
    overflowY: "auto",
  },
  selectItem: {
    marginBottom: "1rem",
    padding: "0.75rem",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
  },
  selectLabel: {
    marginBottom: "0.5rem",
    color: "#1e293b",
  },
  selectValues: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  selectValue: {
    backgroundColor: "#e0f2fe",
    color: "#0c4a6e",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  typeFilters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  typeFilterButton: {
    backgroundColor: "#e0f2fe",
    color: "#0c4a6e",
    border: "1px solid #0284c7",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  typeFilterButtonHidden: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    borderColor: "#dc2626",
  },
  hiddenTypesInfo: {
    color: "#ef4444",
    fontSize: "0.8rem",
    marginLeft: "0.5rem",
  },
};
