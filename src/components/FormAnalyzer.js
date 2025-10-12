import React, { useState } from "react";
import {
  extractComponents,
  parseFormJson,
  runValidations,
} from "../utils/utils";
import Card from "./Card";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function FormAnalyzer() {
  const [rawJson, setRawJson] = useState("");
  const [components, setComponents] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAnalyze = () => {
    const parsed = parseFormJson(rawJson);
    if (!parsed) return alert("Invalid JSON!");

    const mainComponents =
      parsed || parsed?.components || parsed?.form?.components || parsed || [];

    const flat = extractComponents(mainComponents);
    setComponents(flat);

    const groupedByType = flat.reduce((acc, comp) => {
      if (!acc[comp.type]) acc[comp.type] = [];
      acc[comp.type].push(comp);
      return acc;
    }, {});
    setGrouped(groupedByType);

    const validationResults = runValidations(mainComponents);
    setResults(validationResults);
  };

  const handleDownloadExcel = () => {
    if (components.length === 0) return alert("No components to export.");

    const worksheet = XLSX.utils.json_to_sheet(
      components.map((c) => ({
        Label: c.label || "",
        Key: c.key || "",
        Type: c.type || "",
        Required: c.validate?.required ? "Yes" : "No",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Components");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `formio_components_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handleClear = () => {
    setRawJson("");
    setComponents([]);
    setGrouped({});
    setResults([]);
    setSearchTerm("");
  };

  // ✅ Filter components based on search term
  const filteredGrouped = Object.entries(grouped).reduce(
    (acc, [type, comps]) => {
      const filtered = comps.filter((c) => {
        const term = searchTerm.toLowerCase();
        return (
          (c.label || "").toLowerCase().includes(term) ||
          (c.type || "").toLowerCase().includes(term) ||
          (c.key || "").toLowerCase().includes(term)
        );
      });
      if (filtered.length > 0) acc[type] = filtered;
      return acc;
    },
    {}
  );

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h2
          style={{
            marginBottom: "12px",
            fontSize: "32px",
            fontWeight: "700",
            color: "#1a202c",
          }}
        >
          🧩 Form.io JSON Analyzer
        </h2>

        {/* JSON Input */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <textarea
            rows={10}
            placeholder="Paste your Form.io JSON here..."
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #e2e8f0",
              fontFamily: "monospace",
              fontSize: "14px",
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
          <button
            onClick={handleAnalyze}
            style={{
              marginTop: "12px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.2s",
              boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#2563eb";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 8px rgba(59, 130, 246, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#3b82f6";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 4px rgba(59, 130, 246, 0.3)";
            }}
          >
            Analyze Form
          </button>

          <button
            onClick={handleClear}
            disabled={components.length === 0}
            style={{
              marginTop: "12px",
              marginLeft: "12px",
              backgroundColor:
                components.length === 0 ? "#cbd5e1" : "#f80909ff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: components.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.2s",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
            }}
          >
            clear
          </button>

          <button
              onClick={handleDownloadExcel}
              disabled={components.length === 0}
              style={{
                marginTop: "12px",
                marginLeft: "12px",
                backgroundColor:
                  components.length === 0 ? "#cbd5e1" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                cursor: components.length === 0 ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "16px",
                transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
              }}
            >
              📥 Download Excel
            </button>
        </div>

        {/* Validation Results */}
        {results.length > 0 && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              marginBottom: "24px",
            }}
          >
            
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1a202c",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "3px solid #e2e8f0",
              }}
            >
              Validation Results
            </h3>
            

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {results.map((r, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: r.passed ? "#ecfdf5" : "#fef2f2",
                    color: r.passed ? "#065f46" : "#991b1b",
                    fontWeight: 500,
                    padding: "14px 18px",
                    borderRadius: "8px",
                    border: r.passed
                      ? "2px solid #a7f3d0"
                      : "2px solid #fecaca",
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: r.message }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Components */}
        {components.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                paddingBottom: "12px",
                borderBottom: "3px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1a202c",
                  margin: 0,
                }}
              >
                Extracted Components
              </h3>

              <input
                type="text"
                placeholder="🔍 Search by label, key, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "2px solid #e2e8f0",
                  fontSize: "14px",
                  outline: "none",
                  width: "280px",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {Object.entries(filteredGrouped).map(([type, comps]) => (
                <Card key={type} type={type} components={comps} />
              ))}
            </div>

            {Object.keys(filteredGrouped).length === 0 && (
              <p
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  marginTop: "20px",
                }}
              >
                No components match your search.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
