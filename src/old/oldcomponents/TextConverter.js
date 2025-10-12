import React, { useState } from "react";
import { copyToClipboard, convertText, limitText } from "../oldutils/utils";

const TextConverter = () => {
  const [inputText, setInputText] = useState("");
  const [convertedText, setConvertedText] = useState("");

  const handleConvert = () => {
    const converted = convertText(inputText);
    setConvertedText(converted);
    copyToClipboard(converted);
  };

  const handleLimited = () => {
    const converted = limitText(inputText, 110);
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
