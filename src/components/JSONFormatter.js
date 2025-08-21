import React, { useState } from "react";

function JsonFormatter() {
  const [rawJson, setRawJson] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState("");
  const [searchKeys, setSearchKeys] = useState("");
  const [keyResults, setKeyResults] = useState([]);

  const handleFormat = () => {
    setError("");
    setFormattedJson("");
    setKeyResults([]);

    try {
      // Parse outer JSON
      const parsed = JSON.parse(rawJson);

      // Function to attempt parsing stringified JSON recursively
      function deepParse(obj) {
        if (typeof obj === "string") {
          try {
            const parsedInner = JSON.parse(obj);
            if (typeof parsedInner === "object") {
              return deepParse(parsedInner);
            } else {
              return parsedInner;
            }
          } catch {
            return obj;
          }
        } else if (Array.isArray(obj)) {
          return obj.map(deepParse);
        } else if (obj && typeof obj === "object") {
          const result = {};
          Object.entries(obj).forEach(([key, val]) => {
            result[key] = deepParse(val);
          });
          return result;
        } else {
          return obj;
        }
      }

      const cleanObj = deepParse(parsed);
      setFormattedJson(JSON.stringify(cleanObj, null, 2));

      // Search for keys if provided
      if (searchKeys.trim()) {
        const keysToSearch = searchKeys
          .split(',')
          .map(key => key.trim())
          .filter(key => key.length > 0);
        
        const results = searchKeysInObject(cleanObj, keysToSearch);
        setKeyResults(results);
      }
    } catch (err) {
      setError("Error parsing JSON: " + err.message);
    }
  };

  // Function to search for keys in nested object
  const searchKeysInObject = (obj, keysToFind) => {
    const results = [];
    const foundKeys = new Set();

    function searchRecursive(current, path = '') {
      if (current && typeof current === 'object') {
        if (Array.isArray(current)) {
          current.forEach((item, index) => {
            searchRecursive(item, path ? `${path}[${index}]` : `[${index}]`);
          });
        } else {
          Object.entries(current).forEach(([key, value]) => {
            const currentPath = path ? `${path}.${key}` : key;
            
            // Check if this key matches any of our search keys
            keysToFind.forEach(searchKey => {
              if (key === searchKey) {
                foundKeys.add(searchKey);
                results.push({
                  key: searchKey,
                  found: true,
                  path: currentPath,
                  value: value
                });
              }
            });
            
            searchRecursive(value, currentPath);
          });
        }
      }
    }

    searchRecursive(obj);

    // Add missing keys
    keysToFind.forEach(key => {
      if (!foundKeys.has(key)) {
        results.push({
          key: key,
          found: false,
          path: null,
          value: null
        });
      }
    });

    return results;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
  };

  const handleClear = () => {
    setRawJson("");
    setFormattedJson("");
    setError("");
    setSearchKeys("");
    setKeyResults([]);
  };

  // Syntax highlighting function
  const highlightJson = (jsonString) => {
    if (!jsonString) return "";
    
    return jsonString
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>JSON Formatter & Beautifier</h2>
      <h2 style={styles.heading}>Under Construction</h2>
      
      <div style={styles.panes}>
        <div style={styles.pane}>
          <div style={styles.labelContainer}>
            <label style={styles.label}>Raw JSON Input</label>
            <button style={styles.clearButton} onClick={handleClear}>
              Clear
            </button>
          </div>
          <textarea
            style={styles.textarea}
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            placeholder="Paste your raw database response here..."
          />
        </div>

        <div style={styles.pane}>
          <label style={styles.label}>Search Keys (comma-separated)</label>
          <input
            style={styles.searchInput}
            type="text"
            value={searchKeys}
            onChange={(e) => setSearchKeys(e.target.value)}
            placeholder="e.g., name, email, userId, status"
          />
        </div>
        
        <div style={styles.pane}>
          <div style={styles.labelContainer}>
            <label style={styles.label}>Formatted JSON Output</label>
            {formattedJson && (
              <button style={styles.copyButton} onClick={handleCopy}>
                Copy
              </button>
            )}
          </div>
          
          {formattedJson ? (
            <div style={styles.jsonOutput}>
              <pre style={styles.jsonPre}>
                <code 
                  style={styles.jsonCode}
                  dangerouslySetInnerHTML={{ __html: highlightJson(formattedJson) }}
                />
              </pre>
            </div>
          ) : (
            <div style={styles.placeholder}>
              Formatted JSON will appear here...
            </div>
          )}
        </div>
      </div>
      
      <button 
        style={{
          ...styles.button,
          ...(rawJson ? {} : styles.buttonDisabled)
        }} 
        onClick={handleFormat}
        disabled={!rawJson}
      >
        Format JSON
      </button>
      
      {error && <div style={styles.error}>{error}</div>}
      
      {keyResults.length > 0 && (
        <div style={styles.keyResults}>
          <h3 style={styles.resultsHeading}>Key Search Results</h3>
          <div style={styles.resultsList}>
            {keyResults.map((result, index) => (
              <div key={index} style={{
                ...styles.resultItem,
                ...(result.found ? styles.resultFound : styles.resultNotFound)
              }}>
                <div style={styles.resultKey}>
                  <span style={styles.keyName}>{result.key}</span>
                  <span style={{
                    ...styles.status,
                    color: result.found ? '#10b981' : '#ef4444'
                  }}>
                    {result.found ? '✓ Found' : '✗ Not Found'}
                  </span>
                </div>
                {result.found && (
                  <div style={styles.resultDetails}>
                    <div style={styles.resultPath}>Path: {result.path}</div>
                    <div style={styles.resultValue}>
                      Value: {typeof result.value === 'string' 
                        ? `"${result.value}"` 
                        : JSON.stringify(result.value)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* CSS for syntax highlighting */}
      <style>{`
        .json-key { color: #0366d6; font-weight: 600; }
        .json-string { color: #032f62; }
        .json-number { color: #005cc5; }
        .json-boolean { color: #d73a49; font-weight: 600; }
        .json-null { color: #6f42c1; font-weight: 600; }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "24px",
    maxWidth: "1200px",
    margin: "20px auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    border: "1px solid #e1e5e9",
  },
  heading: {
    textAlign: "center",
    color: "#1f2937",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "32px",
    letterSpacing: "-0.5px",
  },
  panes: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    marginBottom: "24px",
  },
  pane: {
    display: "flex",
    flexDirection: "column",
  },
  labelContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  label: {
    color: "#374151",
    fontSize: "16px",
    fontWeight: "600",
    letterSpacing: "-0.25px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    transition: "border-color 0.2s ease",
    outline: "none",
  },
  textarea: {
    flex: 1,
    padding: "16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    fontSize: "14px",
    lineHeight: "1.5",
    resize: "vertical",
    minHeight: "300px",
    backgroundColor: "#fafafa",
    transition: "border-color 0.2s ease",
    outline: "none",
  },
  jsonOutput: {
    flex: 1,
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
    overflow: "auto",
    minHeight: "300px",
  },
  jsonPre: {
    margin: 0,
    padding: "16px",
    fontSize: "14px",
    lineHeight: "1.5",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  jsonCode: {
    fontFamily: "inherit",
  },
  placeholder: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    color: "#6b7280",
    fontSize: "16px",
    fontStyle: "italic",
    minHeight: "300px",
  },
  button: {
    width: "100%",
    padding: "16px 24px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    letterSpacing: "-0.25px",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
  },
  copyButton: {
    padding: "6px 12px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  clearButton: {
    padding: "6px 12px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  error: {
    marginTop: "16px",
    padding: "16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontWeight: "500",
    fontSize: "14px",
  },
  keyResults: {
    marginTop: "24px",
    padding: "20px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  resultsHeading: {
    margin: "0 0 16px 0",
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "600",
  },
  resultsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  resultItem: {
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },
  resultFound: {
    borderLeftColor: "#10b981",
    borderLeftWidth: "4px",
  },
  resultNotFound: {
    borderLeftColor: "#ef4444",
    borderLeftWidth: "4px",
  },
  resultKey: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  keyName: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  status: {
    fontSize: "14px",
    fontWeight: "600",
  },
  resultDetails: {
    fontSize: "13px",
    color: "#6b7280",
  },
  resultPath: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    marginBottom: "4px",
  },
  resultValue: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    wordBreak: "break-all",
  },
};

export default JsonFormatter;