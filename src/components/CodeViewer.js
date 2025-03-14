import React, { useState } from 'react';

export default function CodeViewer({ codeContent }) {
  // If codeContent is not an array, wrap it in a default object array.
  const sections = Array.isArray(codeContent)
    ? codeContent
    : [{ heading: '', content: codeContent }];

  const [query, setQuery] = useState('');
  
  const filteredSections = sections.filter(section => {
    const text = section.heading + "\n" + section.content;
    return text.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <input 
          type="text" 
          placeholder="Search headings or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.searchInput}
        />
      </header>
      <section style={styles.content}>
        {filteredSections.map((section, index) => (
          <div key={index} style={styles.section}>
            {section.heading && <h2 style={styles.heading}>{section.heading}</h2>}
            <pre style={styles.preformatted}>
              {section.content}
            </pre>
          </div>
        ))}
      </section>
    </div>
  );
}

const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '800px',
      margin: '20px auto',
      color: '#e0e0e0'
    },
    header: {
      marginBottom: '16px',
      position: 'sticky',
      top: '0',
      backgroundColor: '#1a1a1a',
      zIndex: '1',
      padding: '8px 0'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '14px',
      border: '1px solid #333',
      borderRadius: '8px',
      backgroundColor: '#fff',
      color: '#333',
      transition: 'all 0.2s ease',
      outline: 'none',
      ':focus': {
        borderColor: '#646cff',
        boxShadow: '0 0 0 3px rgba(100, 108, 255, 0.2)'
      },
      '::placeholder': {
        color: '#888'
      }
    },
    content: {
      backgroundColor: '#242424',
      padding: '20px',
      borderRadius: '8px',
      maxHeight: '70vh',
      overflowY: 'auto',
      border: '1px solid #333',
      scrollbarWidth: 'thin',
      scrollbarColor: '#444 #2a2a2a',
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: '#2a2a2a',
        borderRadius: '4px'
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#444',
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: '#555'
        }
      }
    },
    section: {
      marginBottom: '24px',
      ':last-child': {
        marginBottom: '0'
      }
    },
    heading: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      fontSize: '20px',
      marginBottom: '12px',
      color: 'rgba(255, 255, 255, 0.9)',
      paddingBottom: '8px',
      borderBottom: '1px solid #333'
    },
    preformatted: {
      whiteSpace: 'pre-wrap',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '14px',
      lineHeight: '1.5',
      backgroundColor: '#2a2a2a',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #333',
      color: '#e0e0e0',
      overflowX: 'auto',
      margin: '0'
    }
  };