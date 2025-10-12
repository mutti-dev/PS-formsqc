import React, { useState, useRef, useEffect } from "react";

export default function Card({ type, components }) {
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ width: 350, height: 400 });
  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const getTypeColor = (type) => {
    const colors = {
      textfield: { from: "#3b82f6", to: "#2563eb" },
      email: { from: "#06b6d4", to: "#0891b2" },
      number: { from: "#10b981", to: "#059669" },
      select: { from: "#a855f7", to: "#9333ea" },
      radio: { from: "#ec4899", to: "#db2777" },
      checkbox: { from: "#f97316", to: "#ea580c" },
      textarea: { from: "#6366f1", to: "#4f46e5" },
      button: { from: "#ef4444", to: "#dc2626" },
      datetime: { from: "#eab308", to: "#ca8a04" },
      panel: { from: "#6b7280", to: "#4b5563" },
      columns: { from: "#14b8a6", to: "#0d9488" },
      fieldset: { from: "#8b5cf6", to: "#7c3aed" },
    };
    return colors[type.toLowerCase()] || { from: "#64748b", to: "#475569" };
  };

  const getTypeAbbreviation = (type) => {
    const abbr = {
      textfield: "TXT",
      email: "EML",
      number: "NUM",
      select: "SEL",
      radio: "RAD",
      checkbox: "CHK",
      textarea: "TXA",
      button: "BTN",
      datetime: "DTE",
      panel: "PNL",
      columns: "COL",
      fieldset: "FLD",
    };
    return abbr[type.toLowerCase()] || "CMP";
  };

  const typeColor = getTypeColor(type);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      const newWidth = Math.max(280, Math.min(800, startPos.current.width + deltaX));
      const newHeight = Math.max(300, Math.min(800, startPos.current.height + deltaY));

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const isCompact = size.width < 350;

  return (
    <div
      ref={cardRef}
      style={{
        position: "relative",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        transition: isResizing ? "none" : "all 0.3s ease",
        width: `${size.width}px`,
        height: `${size.height}px`,
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        if (!isResizing) {
          e.currentTarget.style.boxShadow =
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
          const border = e.currentTarget.querySelector(".hover-border");
          if (border) border.style.borderColor = "#60a5fa";
        }
      }}
      onMouseLeave={(e) => {
        if (!isResizing) {
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
          const border = e.currentTarget.querySelector(".hover-border");
          if (border) border.style.borderColor = "transparent";
        }
      }}
    >
      {/* Gradient Header */}
      <div
        style={{
          background: `linear-gradient(to right, ${typeColor.from}, ${typeColor.to})`,
          padding: isCompact ? "12px" : "16px",
          color: "white",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: isCompact ? "wrap" : "nowrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: isCompact ? "8px" : "12px" }}>
            <div
              style={{
                width: isCompact ? "32px" : "40px",
                height: isCompact ? "32px" : "40px",
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isCompact ? "10px" : "12px",
                fontWeight: "700",
                letterSpacing: "0.5px",
                flexShrink: 0,
              }}
            >
              {getTypeAbbreviation(type)}
            </div>
            <div style={{ minWidth: 0 }}>
              <h4
                style={{
                  fontSize: isCompact ? "14px" : "18px",
                  fontWeight: "700",
                  textTransform: "capitalize",
                  letterSpacing: "0.025em",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {type}
              </h4>
              <p
                style={{ fontSize: isCompact ? "11px" : "14px", opacity: 0.9, margin: "4px 0 0 0" }}
              >
                {components.length}{" "}
                {components.length === 1 ? "component" : "components"}
              </p>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(4px)",
              borderRadius: "9999px",
              padding: isCompact ? "3px 10px" : "4px 12px",
              fontSize: isCompact ? "12px" : "14px",
              fontWeight: "600",
              flexShrink: 0,
            }}
          >
            {components.length}
          </div>
        </div>
      </div>

      {/* Component List */}
      <div style={{ padding: isCompact ? "12px" : "16px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: isCompact ? "8px" : "12px",
          }}
          className="custom-scrollbar"
        >
          {components.map((comp, idx) => {
            const keyLength = (comp.key || "").length;
            const isLongKey = keyLength > 110;

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  padding: isCompact ? "8px" : "12px",
                  border: "1px solid #e5e7eb",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f9fafb")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "space-between",
                    gap: "8px",
                    marginBottom: "8px",
                    flexWrap: isCompact ? "wrap" : "nowrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: isCompact ? "100%" : 0 }}>
                    <p
                      style={{
                        fontWeight: "600",
                        color: "#1f2937",
                        margin: "0 0 6px 0",
                        fontSize: isCompact ? "12px" : "14px",
                        overflow: isCompact ? "visible" : "hidden",
                        textOverflow: isCompact ? "clip" : "ellipsis",
                        whiteSpace: isCompact ? "normal" : "nowrap",
                        wordBreak: isCompact ? "break-word" : "normal",
                      }}
                    >
                      {comp.label || "Untitled"}
                    </p>
                    <code
                      style={{
                        fontSize: isCompact ? "10px" : "11px",
                        color: "#4b5563",
                        backgroundColor: "#e5e7eb",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        display: "inline-block",
                        maxWidth: "100%",
                        overflow: isCompact ? "visible" : "hidden",
                        textOverflow: isCompact ? "clip" : "ellipsis",
                        whiteSpace: isCompact ? "normal" : "nowrap",
                        wordBreak: isCompact ? "break-all" : "normal",
                      }}
                      title={comp.key}
                    >
                      {comp.key}
                    </code>
                  </div>
                  {comp.validate?.required && (
                    <span
                      style={{
                        flexShrink: 0,
                        color: "#ef4444",
                        fontSize: isCompact ? "10px" : "12px",
                        fontWeight: "700",
                        backgroundColor: "#fef2f2",
                        padding: isCompact ? "3px 6px" : "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Required
                    </span>
                  )}
                </div>

                {/* Key Length Info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: isCompact ? "10px" : "11px",
                      color: isLongKey ? "#ef4444" : "#6b7280",
                      backgroundColor: isLongKey ? "#fee2e2" : "#f3f4f6",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: "600",
                    }}
                  >
                    Length: {keyLength}
                  </span>
                  {isLongKey && (
                    <span
                      style={{
                        fontSize: isCompact ? "10px" : "11px",
                        color: "#dc2626",
                        fontWeight: "600",
                      }}
                    >
                      ⚠ Too Long
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "20px",
          height: "20px",
          cursor: "nwse-resize",
          background: "linear-gradient(135deg, transparent 50%, #94a3b8 50%)",
          borderBottomRightRadius: "12px",
        }}
        title="Drag to resize"
      />

      {/* Hover Effect Border */}
      <div
        className="hover-border"
        style={{
          position: "absolute",
          inset: 0,
          border: "2px solid transparent",
          borderRadius: "12px",
          transition: "border-color 0.3s",
          pointerEvents: "none",
        }}
      ></div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}