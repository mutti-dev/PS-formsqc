import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  extractLabelsFromJSON,
  extractSelectValues,
  extractSurveyValues,
} from "../utils/utils";

// Collapsible Section Component
const CollapsibleSection = ({ title, count, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.sectionHeaderLeft}>
          <span style={styles.chevron}>{isOpen ? "▼" : "▶"}</span>
          <h3 style={styles.sectionTitle}>{title}</h3>
          {count !== undefined && (
            <span style={styles.badge}>{count}</span>
          )}
        </div>
      </div>
      {isOpen && <div style={styles.sectionContent}>{children}</div>}
    </div>
  );
};

// Duplicate Labels Component
const DuplicateLabelsSection = ({ duplicateLabels }) => {
  if (duplicateLabels.length === 0) return null;

  return (
    <CollapsibleSection 
      title="Duplicate Labels" 
      count={duplicateLabels.length}
      defaultOpen={true}
    >
      <div style={styles.list}>
        {duplicateLabels.map(({ label, count }, idx) => (
          <div key={idx} style={styles.listItem}>
            <span style={styles.listItemLabel}>{label}</span>
            <span style={styles.listItemCount}>{count} occurrences</span>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};
const DuplicateAPISection = ({ duplicateKeys }) => {
  if (duplicateKeys.length === 0) return null;

  return (
    <CollapsibleSection 
      title="Duplicate Keys" 
      count={duplicateKeys.length}
      defaultOpen={true}
    >
      <div style={styles.list}>
        {duplicateKeys.map(({ key, count }, idx) => (
          <div key={idx} style={styles.listItem}>
            <span style={styles.listItemLabel}>{key}</span>
            <span style={styles.listItemCount}>{count} occurrences</span>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};

// Duplicate Values Component
const DuplicateValuesSection = ({ selectValues }) => {
  const itemsWithDuplicates = selectValues.filter(
    (item) => item.duplicateValues?.length > 0
  );

  if (itemsWithDuplicates.length === 0) return null;

  return (
    <CollapsibleSection 
      title="Duplicate Select Values" 
      count={`${itemsWithDuplicates.length} field(s)`}
      defaultOpen={true}
    >
      <div style={styles.cardList}>
        {itemsWithDuplicates.map((selectItem, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderInfo}>
                <div style={styles.cardTitle}>{selectItem.label}</div>
                <div style={styles.cardSubtitle}>Key: {selectItem.key}</div>
              </div>
              <span style={styles.warningBadge}>
                {selectItem.duplicateValues.length} duplicate{selectItem.duplicateValues.length > 1 ? 's' : ''}
              </span>
            </div>
            <div style={styles.cardBody}>
              {selectItem.duplicateValues.map((dup, dupIdx) => (
                <div key={dupIdx} style={styles.duplicateEntry}>
                  <div style={styles.duplicateEntryRow}>
                    <span style={styles.label}>Value:</span>
                    <code style={styles.codeText}>{dup.value}</code>
                  </div>
                  <div style={styles.duplicateEntryRow}>
                    <span style={styles.label}>Found in:</span>
                    <div style={styles.tagList}>
                      {dup.labels.map((label, labelIdx) => (
                        <span key={labelIdx} style={styles.tag}>
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};

// Select Components Section
const SelectComponentsSection = ({ selectValues }) => {
  if (selectValues.length === 0) return null;

  return (
    <CollapsibleSection 
      title="Select Components" 
      count={selectValues.length}
      defaultOpen={false}
    >
      <div style={styles.cardList}>
        {selectValues.map((select, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.cardTitle}>{select.label}</div>
            <div style={styles.cardSubtitle}>Key: {select.key}</div>
            <div style={styles.tagList}>
              {select.values.map((option, optIdx) => (
                <span key={optIdx} style={styles.tag}>
                  {option.label} ({option.value})
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};

// Survey Components Section
const SurveyComponentsSection = ({ surveyValues }) => {
  if (surveyValues.length === 0) return null;

  return (
    <CollapsibleSection 
      title="Survey Components" 
      count={surveyValues.length}
      defaultOpen={false}
    >
      <div style={styles.cardList}>
        {surveyValues.map((survey, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.cardTitle}>{survey.label}</div>
            <div style={styles.cardSubtitle}>Key: {survey.key}</div>
            <div style={styles.tagList}>
              {survey.questions.map((q, qIdx) => (
                <span key={qIdx} style={styles.tag}>
                  {q.label} ({q.value})
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};

// Key Length Warnings Section
const KeyLengthWarningsSection = ({ longKeys, threshold }) => {
  if (longKeys.length === 0) return null;

  return (
    <CollapsibleSection 
      title="Key Length Warnings" 
      count={longKeys.length}
      defaultOpen={true}
    >
      <div style={styles.warningText}>
        {longKeys.length} key(s) exceed {threshold} characters
      </div>
      <div style={styles.list}>
        {longKeys.map((entry, idx) => (
          <div key={idx} style={styles.warningItem}>
            <div style={styles.warningItemHeader}>
              <strong>{entry.label}</strong>
              <span style={styles.warningItemCount}>{entry.key.length} characters</span>
            </div>
            <code style={styles.truncatedKey}>
              {entry.key.substring(0, threshold)}...
            </code>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};

// Type Filter Section
const TypeFilterSection = ({ uniqueTypes, hiddenTypes, onToggle }) => {
  return (
    <CollapsibleSection 
      title="Filter by Type" 
      count={`${hiddenTypes.length} hidden`}
      defaultOpen={false}
    >
      <div style={styles.filterButtonGroup}>
        {uniqueTypes.map((type) => {
          const isHidden = hiddenTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => onToggle(type)}
              style={{
                ...styles.filterButton,
                ...(isHidden ? styles.filterButtonHidden : styles.filterButtonActive),
              }}
            >
              {isHidden ? "Hidden" : "Visible"}: {type}
            </button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
};

export default function JSONExtractor() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState([
    "columns",
    "content",
    "container",
    "panel",
  ]);
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

  const exportToExcel = () => {
    const exportData = data
      .filter((entry) => !hiddenTypes.includes(entry.type))
      .map((entry) => ({
        Label: entry.type === "panel" ? entry.title : entry.label,
        Key: entry.key || "",
        KeyLength: entry.key ? entry.key.length : 0,
        Type: entry.type,
        Format: entry.format || "",
      }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labels");
    XLSX.writeFile(wb, "labels.xlsx");
  };

  // Computed values
  const filteredData = data.filter((entry) => {
    if (hiddenTypes.includes(entry.type)) return false;
    const lowerFilter = filter.toLowerCase();
    return (
      entry.label?.toLowerCase().includes(lowerFilter) ||
      entry.key?.toLowerCase().includes(lowerFilter) ||
      entry.type?.toLowerCase().includes(lowerFilter) ||
      (entry.type === "panel" && entry.title?.toLowerCase().includes(lowerFilter))
    );
  });

  const longKeys = data.filter(
    (entry) => entry.key && entry.key.length > keyLengthThreshold
  );

  const labelCounts = {};
  const keyCounts = {};

  data.forEach((entry) => {
    if (entry.type === "columns" || entry.type === "content") return;
    const labelKey = entry.type === "panel" ? entry.title : entry.label;
    if (!labelKey) return;
    labelCounts[labelKey] = (labelCounts[labelKey] || 0) + 1;

     const key = entry.key;   // <-- adjust this based on your field name
  if (key) {
    keyCounts[key] = (keyCounts[key] || 0) + 1;
  }
  });
  const duplicateLabels = Object.entries(labelCounts)
    .filter(([_, count]) => count > 1)
    .map(([label, count]) => ({ label, count }));


    const duplicateKeys = Object.entries(keyCounts)
  .filter(([_, count]) => count > 1)
  .map(([key, count]) => ({ key, count }));

  const uniqueTypes = [...new Set(data.map((entry) => entry.type))];
  const selectValues = jsonInput ? extractSelectValues(jsonInput) : [];
  const surveyValues = jsonInput ? extractSurveyValues(jsonInput) : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>JSON Label Extractor</h1>
        <p style={styles.subtitle}>
          Extract and analyze labels from JSON data
        </p>
      </div>

      {/* Input Section */}
      <div style={styles.inputSection}>
        <div style={styles.inputHeader}>
          <h2 style={styles.inputTitle}>JSON Input</h2>
          <button
            onClick={clearAll}
            style={{
              ...styles.button,
              ...styles.buttonDanger,
              opacity: !jsonInput && data.length === 0 ? 0.5 : 1,
            }}
            disabled={!jsonInput && data.length === 0}
          >
            Clear All
          </button>
        </div>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste your JSON data here..."
          style={styles.textarea}
          rows={10}
        />

        {error && <div style={styles.errorMessage}>{error}</div>}

        <div style={styles.controlsRow}>
          <button
            onClick={handleExtract}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              opacity: isLoading || !jsonInput.trim() ? 0.6 : 1,
            }}
            disabled={isLoading || !jsonInput.trim()}
          >
            {isLoading ? "Extracting..." : "Extract Labels"}
          </button>

          <div style={styles.thresholdControl}>
            <label htmlFor="keyLengthThreshold" style={styles.controlLabel}>
              Key Length Threshold:
            </label>
            <input
              id="keyLengthThreshold"
              type="number"
              min={1}
              value={keyLengthThreshold}
              onChange={(e) => setKeyLengthThreshold(Number(e.target.value))}
              style={styles.numberInput}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {data.length > 0 && (
        <div style={styles.resultsSection}>
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>
              Extracted Labels ({data.length} items)
            </h2>
            <button
              onClick={exportToExcel}
              style={{ ...styles.button, ...styles.buttonSuccess }}
            >
              Export to Excel
            </button>
          </div>

          {/* Analytics Sections */}
          <div style={styles.analyticsGrid}>
            <DuplicateLabelsSection duplicateLabels={duplicateLabels} />
            <DuplicateAPISection duplicateKeys={duplicateKeys} />
            <DuplicateValuesSection selectValues={selectValues} />
            <SelectComponentsSection selectValues={selectValues} />
            <SurveyComponentsSection surveyValues={surveyValues} />
            <KeyLengthWarningsSection 
              longKeys={longKeys} 
              threshold={keyLengthThreshold} 
            />
            <TypeFilterSection
              uniqueTypes={uniqueTypes}
              hiddenTypes={hiddenTypes}
              onToggle={toggleTypeVisibility}
            />
          </div>

          {/* Search and Table */}
          <div style={styles.tableSection}>
            <div style={styles.searchRow}>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search labels, keys, or types..."
                style={styles.searchInput}
              />
              <div style={styles.searchInfo}>
                Showing {filteredData.length} of {data.length} items
                {hiddenTypes.length > 0 && (
                  <span style={styles.hiddenInfo}>
                    ({hiddenTypes.length} type{hiddenTypes.length > 1 ? "s" : ""} hidden)
                  </span>
                )}
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Label</th>
                    <th style={styles.th}>Key</th>
                    <th style={styles.th}>Key Length</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Format</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((entry, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={styles.td}>
                        {entry.type === "panel" ? entry.title : entry.label}
                      </td>
                      <td style={styles.td}>
                        <code style={styles.tableCode}>{entry.key}</code>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.keyLengthBadge,
                            color:
                              entry.key && entry.key.length > keyLengthThreshold
                                ? "#dc2626"
                                : "#16a34a",
                          }}
                        >
                          {entry.key ? entry.key.length : 0}
                          {entry.key && entry.key.length > keyLengthThreshold && " ⚠"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.typeTag}>{entry.type}</span>
                      </td>
                      <td style={styles.td}>{entry.format || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  mainTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6b7280",
    margin: 0,
  },
  inputSection: {
    backgroundColor: "white",
    borderRadius: "8px",
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
  inputTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  textarea: {
    width: "100%",
    minHeight: "200px",
    padding: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontFamily: "monospace",
    resize: "vertical",
    backgroundColor: "#f9fafb",
    boxSizing: "border-box",
  },
  errorMessage: {
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    padding: "0.75rem",
    borderRadius: "6px",
    marginTop: "1rem",
    fontSize: "0.875rem",
    border: "1px solid #fecaca",
  },
  controlsRow: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  button: {
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  buttonPrimary: {
    backgroundColor: "#2563eb",
    color: "white",
  },
  buttonSuccess: {
    backgroundColor: "#16a34a",
    color: "white",
  },
  buttonDanger: {
    backgroundColor: "#dc2626",
    color: "white",
  },
  thresholdControl: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  controlLabel: {
    fontWeight: "500",
    color: "#374151",
    fontSize: "0.875rem",
  },
  numberInput: {
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.875rem",
    width: "80px",
  },
  resultsSection: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  resultsTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  analyticsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "2rem",
  },
  section: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "white",
  },
  sectionHeader: {
    padding: "1rem",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.2s",
  },
  sectionHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  chevron: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  badge: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    padding: "0.25rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  sectionContent: {
    padding: "1rem",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem",
    backgroundColor: "#f9fafb",
    borderRadius: "4px",
  },
  listItemLabel: {
    fontWeight: "500",
    color: "#374151",
  },
  listItemCount: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "1rem",
    backgroundColor: "#fafafa",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.75rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #e5e7eb",
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: "0.9375rem",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "0.25rem",
  },
  cardSubtitle: {
    fontSize: "0.75rem",
    color: "#6b7280",
    fontFamily: "monospace",
  },
  warningBadge: {
    backgroundColor: "#dc2626",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  duplicateEntry: {
    backgroundColor: "white",
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid #e5e7eb",
  },
  duplicateEntryRow: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.5rem",
    alignItems: "flex-start",
  },
  label: {
    fontSize: "0.75rem",
    color: "#6b7280",
    fontWeight: "500",
    minWidth: "70px",
  },
  codeText: {
    fontSize: "0.8125rem",
    fontFamily: "monospace",
    backgroundColor: "#f3f4f6",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    color: "#111827",
  },
  tagList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    flex: 1,
  },
  tag: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  warningText: {
    color: "#92400e",
    fontSize: "0.875rem",
    marginBottom: "0.75rem",
  },
  warningItem: {
    marginBottom: "0.75rem",
    padding: "0.5rem",
    backgroundColor: "#fef3c7",
    borderRadius: "4px",
  },
  warningItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  warningItemCount: {
    fontSize: "0.75rem",
    color: "#92400e",
  },
  truncatedKey: {
    fontSize: "0.75rem",
    color: "#6b7280",
    fontFamily: "monospace",
    wordBreak: "break-all",
    display: "block",
  },
  filterButtonGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  filterButton: {
    border: "1px solid",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8125rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  filterButtonActive: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderColor: "#3b82f6",
  },
  filterButtonHidden: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderColor: "#dc2626",
  },
  tableSection: {
    marginTop: "2rem",
  },
  searchRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.875rem",
  },
  searchInfo: {
    color: "#6b7280",
    fontSize: "0.875rem",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  hiddenInfo: {
    color: "#dc2626",
    fontSize: "0.75rem",
    marginLeft: "0.5rem",
  },
  tableContainer: {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.875rem",
  },
  th: {
    padding: "0.75rem",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "0.75rem",
    verticalAlign: "top",
  },
  tableCode: {
    fontFamily: "monospace",
    fontSize: "0.8125rem",
    color: "#374151",
    wordBreak: "break-all",
  },
  keyLengthBadge: {
    fontWeight: "600",
    fontSize: "0.875rem",
  },
  typeTag: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
};