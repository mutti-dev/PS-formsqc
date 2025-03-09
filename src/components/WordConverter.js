import React, { useState } from 'react';

export default function WordConverter() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState([]);

  const convertWords = () => {
    // Split by newlines; trim and filter out empty lines.
    const words = inputText.split(/\r?\n/).map(w => w.trim()).filter(w => w);
    const converted = words.map(word => {
      // Replace spaces with underscores and remove any character not an alphabet or underscore.
      const value = word
        .replace(/[\s]+/g, '_')
        .replace(/[^A-Za-z_]/g, '');
      return { label: word, value };
    });
    setResult(converted);
  };

  return (
    <div style={styles.container}>
      <h2>Drop Downs</h2>
      <textarea
        style={styles.textarea}
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        placeholder="Enter words (one per line)"
      />
      <button onClick={convertWords} style={styles.button}>
        Convert
      </button>
      {result.length > 0 && (
        <pre style={styles.result}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '1rem',
    fontFamily: "'Segoe UI', sans-serif"
  },
  textarea: {
    width: '100%',
    height: '150px',
    padding: '0.5rem',
    fontSize: '1rem',
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#4A90E2',
    color: 'white',
    border: 'none',
    borderRadius: '4px'
  },
  result: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem'
  }
};
