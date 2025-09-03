import React, { useState } from "react";

const TextConverter = () => {
  const [inputText, setInputText] = useState("");
  const [convertedText, setConvertedText] = useState("");

  // Utility: copy text to clipboard
  const copyToClipboard = (text) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }
  };

  // Standard conversion
  const handleConvert = () => {
    const converted = inputText
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^(\d+)/, "");

    setConvertedText(converted);
    copyToClipboard(converted);
  };

  // Limited characters conversion
  const handleLimited = () => {
    let converted = inputText
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^(\d+)/, "");

    // Remove leading/trailing underscores
    converted = converted.replace(/^_+|_+$/g, "");

    // Limit to 110 characters
    converted = converted.slice(0, 110);

    setConvertedText(converted);
    copyToClipboard(converted);
  };

  return (
    <div style={styles.container}>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter your text here..."
        style={styles.textarea}
      />
      <div style={styles.buttonGroup}>
        <button onClick={handleConvert} style={styles.button}>
          Convert Text
        </button>
        <button onClick={handleLimited} style={styles.buttonSecondary}>
          Limited Characters
        </button>
      </div>
      {convertedText && <p style={styles.result}>{convertedText}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontFamily: "Arial, sans-serif",
  },
  textarea: {
    width: "100%",
    height: "150px",
    resize: "vertical",
    marginBottom: "10px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonSecondary: {
    backgroundColor: "#2196F3",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  result: {
    fontSize: "16px",
    marginTop: "10px",
    backgroundColor: "#f0f0f0",
    padding: "10px",
    borderRadius: "5px",
    wordWrap: "break-word",
  },
};

export default TextConverter;
