import React, { useState } from "react";

export default function FormComparator() {
  const [sandboxJson, setSandboxJson] = useState("");
  const [prodJson, setProdJson] = useState("");
  const [similar, setSimilar] = useState([]);
  const [missing, setMissing] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  // Inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e8eaf6 100%)',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    maxWidth: {
      maxWidth: '90rem',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    headerIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem'
    },
    iconWrapper: {
      padding: '0.75rem',
      background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      borderRadius: '1rem',
      boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
    },
    icon: {
      width: '2rem',
      height: '2rem',
      color: 'white'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #1f2937 0%, #6b7280 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1.125rem'
    },
    inputSection: {
      background: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f3f4f6',
      padding: '2rem',
      marginBottom: '2rem'
    },
    inputGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem'
    },
    inputGridLg: {
      '@media (min-width: 1024px)': {
        gridTemplateColumns: '1fr 1fr'
      }
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    inputHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    inputIconWrapper: {
      padding: '0.5rem',
      borderRadius: '0.5rem'
    },
    sandboxIconWrapper: {
      backgroundColor: '#fed7aa',
    },
    prodIconWrapper: {
      backgroundColor: '#bbf7d0',
    },
    inputIconSandbox: {
      width: '1.25rem',
      height: '1.25rem',
      color: '#ea580c'
    },
    inputIconProd: {
      width: '1.25rem',
      height: '1.25rem',
      color: '#16a34a'
    },
    inputTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937'
    },
    textarea: {
      width: '100%',
      height: '20rem',
      padding: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '1rem',
      fontSize: '0.875rem',
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      resize: 'none',
      outline: 'none',
      transition: 'all 0.2s ease',
      backgroundColor: '#fafafa'
    },
    textareaFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
    },
    sandboxTextarea: {
      borderColor: '#f97316',
      boxShadow: '0 0 0 4px rgba(249, 115, 22, 0.1)'
    },
    prodTextarea: {
      borderColor: '#10b981',
      boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '2rem',
      flexWrap: 'wrap'
    },
    compareButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 2rem',
      background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      color: 'white',
      borderRadius: '1rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
      transform: 'scale(1)',
      transition: 'all 0.2s ease'
    },
    compareButtonHover: {
      transform: 'scale(1.05)',
      boxShadow: '0 15px 35px rgba(37, 99, 235, 0.4)'
    },
    compareButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'scale(1)'
    },
    clearButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 1.5rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      borderRadius: '1rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    clearButtonHover: {
      backgroundColor: '#e5e7eb'
    },
    spinner: {
      width: '1.25rem',
      height: '1.25rem',
      border: '2px solid white',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem'
    },
    resultsGridLg: {
      '@media (min-width: 1024px)': {
        gridTemplateColumns: '1fr 1fr 1fr'
      }
    },
    resultCard: {
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f3f4f6',
      overflow: 'hidden'
    },
    cardHeader: {
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    cardHeaderGreen: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    cardHeaderRed: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    cardHeaderYellow: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    cardIcon: {
      width: '1.5rem',
      height: '1.5rem',
      color: 'white'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white'
    },
    cardSubtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: '0.5rem',
      fontSize: '0.875rem'
    },
    cardContent: {
      padding: '1.5rem',
      maxHeight: '24rem',
      overflowY: 'auto'
    },
    emptyState: {
      color: '#6b7280',
      textAlign: 'center',
      padding: '2rem 0'
    },
    itemList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    itemCard: {
      padding: '1rem',
      borderRadius: '0.75rem',
      border: '1px solid'
    },
    itemCardGreen: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0'
    },
    itemCardRed: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca'
    },
    itemCardYellow: {
      backgroundColor: '#fffbeb',
      borderColor: '#fed7aa'
    },
    itemKey: {
      fontWeight: '600',
      marginBottom: '0.25rem'
    },
    itemKeyGreen: {
      color: '#166534'
    },
    itemKeyRed: {
      color: '#991b1b'
    },
    itemKeyYellow: {
      color: '#92400e'
    },
    itemLabel: {
      fontSize: '0.875rem',
      marginTop: '0.25rem'
    },
    itemLabelGreen: {
      color: '#16a34a'
    },
    itemLabelRed: {
      color: '#dc2626'
    },
    itemLabelYellow: {
      color: '#d97706'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginBottom: '0.5rem'
    },
    badgeOrange: {
      backgroundColor: '#fed7aa',
      color: '#9a3412'
    },
    badgeBlue: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    warningItem: {
      marginTop: '0.5rem',
      fontSize: '0.875rem'
    },
    warningLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    warningBadge: {
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    prodBadge: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    sandboxBadge: {
      backgroundColor: '#fed7aa',
      color: '#9a3412'
    },
    summaryCard: {
      marginTop: '2rem',
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f3f4f6',
      padding: '2rem'
    },
    summaryTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem'
    },
    summaryGridMd: {
      '@media (min-width: 768px)': {
        gridTemplateColumns: '1fr 1fr 1fr'
      }
    },
    summaryItem: {
      textAlign: 'center'
    },
    summaryNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    summaryNumberGreen: {
      color: '#16a34a'
    },
    summaryNumberRed: {
      color: '#dc2626'
    },
    summaryNumberYellow: {
      color: '#d97706'
    },
    summaryLabel: {
      color: '#6b7280'
    }
  };

//   // recursive function to extract all fields
//   const extractFields = (components, fields = {}) => {
//     components.forEach((comp) => {
//       if (comp.key) {
//         fields[comp.key] = comp.label || "";
//       }
//       if (comp.components) {
//         extractFields(comp.components, fields);
//       }
//       if (comp.columns) {
//         comp.columns.forEach((col) => extractFields(col.components, fields));
//       }
//     });
//     return fields;
//   };

// recursive function to extract only actual input fields (ignore container/columns/content)
const extractFields = (components, fields = {}) => {
  const ignoreTypes = ["container", "columns", "content"];

  components.forEach((comp) => {
    // agar component ka type ignoreTypes me hai to skip
    if (!ignoreTypes.includes(comp.type)) {
      if (comp.key) {
        fields[comp.key] = comp.label || "";
      }
    }

    // agar andar nested components hain to unko traverse karo
    if (comp.components) {
      extractFields(comp.components, fields);
    }

    // agar columns hain to unke andar bhi dekh lo
    if (comp.columns) {
      comp.columns.forEach((col) => extractFields(col.components || [], fields));
    }
  });

  return fields;
};


  const compareForms = async () => {
    if (!sandboxJson.trim() || !prodJson.trim()) {
      alert("⚠️ Please fill both JSON inputs!");
      return;
    }

    setIsComparing(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const sandboxObj = JSON.parse(sandboxJson);
      const prodObj = JSON.parse(prodJson);

      const sandboxFields = extractFields(sandboxObj.components || sandboxObj);
      const prodFields = extractFields(prodObj.components || prodObj);

      const sim = [];
      const miss = [];
      const warn = [];

      Object.keys(prodFields).forEach((key) => {
        if (sandboxFields[key]) {
          if (prodFields[key] !== sandboxFields[key]) {
            warn.push({
              key,
              prodLabel: prodFields[key],
              sandboxLabel: sandboxFields[key]
            });
          } else {
            sim.push({ key, label: prodFields[key] });
          }
        } else {
          miss.push({ key, label: prodFields[key], type: 'Missing in Sandbox' });
        }
      });

      Object.keys(sandboxFields).forEach((key) => {
        if (!prodFields[key]) {
          miss.push({ key, label: sandboxFields[key], type: 'Missing in Prod' });
        }
      });

      setSimilar(sim);
      setMissing(miss);
      setWarnings(warn);
      setHasResults(true);
    } catch (e) {
      alert("❌ Invalid JSON format! Please check your input and try again.");
    }
    
    setIsComparing(false);
  };

  const clearAll = () => {
    setSandboxJson("");
    setProdJson("");
    setSimilar([]);
    setMissing([]);
    setWarnings([]);
    setHasResults(false);
  };

  // CSS Animation for spinner
  const spinnerKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <div style={styles.iconWrapper}>
              <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <h1 style={styles.title}>
            Form Comparator
          </h1>
          <p style={styles.subtitle}>
            Compare your JSON forms between Sandbox and Production environments
          </p>
        </div>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <div style={{...styles.inputGrid, ...(window.innerWidth >= 1024 ? styles.inputGridLg : {})}}>
            {/* Sandbox Input */}
            <div style={styles.inputGroup}>
              <div style={styles.inputHeader}>
                <div style={{...styles.inputIconWrapper, ...styles.sandboxIconWrapper}}>
                  <svg style={styles.inputIconSandbox} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 style={styles.inputTitle}>Sandbox JSON</h3>
              </div>
              <textarea
                style={styles.textarea}
                placeholder="Paste your Sandbox JSON configuration here..."
                value={sandboxJson}
                onChange={(e) => setSandboxJson(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Production Input */}
            <div style={styles.inputGroup}>
              <div style={styles.inputHeader}>
                <div style={{...styles.inputIconWrapper, ...styles.prodIconWrapper}}>
                  <svg style={styles.inputIconProd} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 style={styles.inputTitle}>Production JSON</h3>
              </div>
              <textarea
                style={styles.textarea}
                placeholder="Paste your Production JSON configuration here..."
                value={prodJson}
                onChange={(e) => setProdJson(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            <button
              onClick={compareForms}
              disabled={isComparing}
              style={{
                ...styles.compareButton,
                ...(isComparing ? styles.compareButtonDisabled : {})
              }}
              onMouseEnter={(e) => !isComparing && Object.assign(e.target.style, styles.compareButtonHover)}
              onMouseLeave={(e) => !isComparing && Object.assign(e.target.style, styles.compareButton)}
            >
              {isComparing ? (
                <>
                  <div style={styles.spinner}></div>
                  <span>Comparing...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                  </svg>
                  <span>Compare Forms</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </>
              )}
            </button>
            
            <button
              onClick={clearAll}
              style={styles.clearButton}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.clearButtonHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, styles.clearButton)}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {hasResults && (
          <div style={{...styles.resultsGrid, ...(window.innerWidth >= 1024 ? styles.resultsGridLg : {})}}>
            {/* Similar Fields */}
            <div style={styles.resultCard}>
              <div style={{...styles.cardHeader, ...styles.cardHeaderGreen}}>
                <svg style={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 style={styles.cardTitle}>Matching Fields</h3>
                  <p style={styles.cardSubtitle}>Fields that are identical in both environments</p>
                </div>
              </div>
              <div style={styles.cardContent}>
                {similar.length === 0 ? (
                  <p style={styles.emptyState}>No matching fields found</p>
                ) : (
                  <div style={styles.itemList}>
                    {similar.map((item, i) => (
                      <div key={i} style={{...styles.itemCard, ...styles.itemCardGreen}}>
                        <div style={{...styles.itemKey, ...styles.itemKeyGreen}}>{item.key}</div>
                        {item.label && (
                          <div style={{...styles.itemLabel, ...styles.itemLabelGreen}}>"{item.label}"</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Missing Fields */}
            <div style={styles.resultCard}>
              <div style={{...styles.cardHeader, ...styles.cardHeaderRed}}>
                <svg style={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 style={styles.cardTitle}>Missing Fields</h3>
                  <p style={styles.cardSubtitle}>Fields present in one environment only</p>
                </div>
              </div>
              <div style={styles.cardContent}>
                {missing.length === 0 ? (
                  <p style={styles.emptyState}>No missing fields found</p>
                ) : (
                  <div style={styles.itemList}>
                    {missing.map((item, i) => (
                      <div key={i} style={{...styles.itemCard, ...styles.itemCardRed}}>
                        <div style={styles.warningLabel}>
                          <span style={{
                            ...styles.badge,
                            ...(item.type === 'Missing in Sandbox' ? styles.badgeOrange : styles.badgeBlue)
                          }}>
                            {item.type}
                          </span>
                        </div>
                        <div style={{...styles.itemKey, ...styles.itemKeyRed}}>{item.key}</div>
                        {item.label && (
                          <div style={{...styles.itemLabel, ...styles.itemLabelRed}}>"{item.label}"</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Warnings */}
            <div style={styles.resultCard}>
              <div style={{...styles.cardHeader, ...styles.cardHeaderYellow}}>
                <svg style={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 style={styles.cardTitle}>Label Changes</h3>
                  <p style={styles.cardSubtitle}>Fields with different labels</p>
                </div>
              </div>
              <div style={styles.cardContent}>
                {warnings.length === 0 ? (
                  <p style={styles.emptyState}>No label differences found</p>
                ) : (
                  <div style={styles.itemList}>
                    {warnings.map((item, i) => (
                      <div key={i} style={{...styles.itemCard, ...styles.itemCardYellow}}>
                        <div style={{...styles.itemKey, ...styles.itemKeyYellow}}>{item.key}</div>
                        <div style={styles.warningItem}>
                          <div style={styles.warningLabel}>
                            <span style={{...styles.warningBadge, ...styles.prodBadge}}>PROD</span>
                            <span style={{color: '#374151'}}>"{item.prodLabel}"</span>
                          </div>
                          <div style={styles.warningLabel}>
                            <span style={{...styles.warningBadge, ...styles.sandboxBadge}}>SANDBOX</span>
                            <span style={{color: '#374151'}}>"{item.sandboxLabel}"</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {hasResults && (
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Comparison Summary</h3>
            <div style={{...styles.summaryGrid, ...(window.innerWidth >= 768 ? styles.summaryGridMd : {})}}>
              <div style={styles.summaryItem}>
                <div style={{...styles.summaryNumber, ...styles.summaryNumberGreen}}>{similar.length}</div>
                <div style={styles.summaryLabel}>Matching Fields</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={{...styles.summaryNumber, ...styles.summaryNumberRed}}>{missing.length}</div>
                <div style={styles.summaryLabel}>Missing Fields</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={{...styles.summaryNumber, ...styles.summaryNumberYellow}}>{warnings.length}</div>
                <div style={styles.summaryLabel}>Label Changes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}