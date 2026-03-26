import React, { useRef, useEffect } from "react";
import "./LineNumberedInput.css";

export default function LineNumberedInput({
  value,
  onChange,
  placeholder,
  rows = 10,
  theme = 'dark',
}) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const updateLineNumbers = () => {
    if (!textareaRef.current || !lineNumbersRef.current) return;

    const lines = (value || "").split("\n").length;
    const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1);

    lineNumbersRef.current.innerHTML = lineNumbers
      .map((num) => `<div class="line-number">${num}</div>`)
      .join("");
  };

  useEffect(() => {
    updateLineNumbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={`line-numbered-input-wrapper theme-${theme}`}>
      <div className="line-numbers" ref={lineNumbersRef}>
        <div className="line-number">1</div>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e);
          updateLineNumbers();
        }}
        onScroll={handleScroll}
        onKeyDown={(e) => {
          // Handle tab key to insert spaces instead of changing focus
          if (e.key === "Tab") {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newValue =
              value.substring(0, start) + "\t" + value.substring(end);
            onChange({ target: { value: newValue } });

            // Move cursor after the inserted tab
            setTimeout(() => {
              e.target.selectionStart = e.target.selectionEnd = start + 1;
            }, 0);
          }
        }}
        placeholder={placeholder}
        rows={rows}
        className="line-numbered-textarea"
        spellCheck="false"
      />
    </div>
  );
}
