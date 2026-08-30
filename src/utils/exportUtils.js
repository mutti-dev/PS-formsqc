import * as XLSX from "xlsx-js-style";

export const exportToExcel = (data, hiddenTypes, selectValues = [], radioValues = [], formComplexity = null) => {
  const wb = XLSX.utils.book_new();

  // If formComplexity is present, add the Estimation Summary sheet first
  if (formComplexity) {
    const summaryRows = [
      { Metric: "Form Complexity & Estimation Standard", Value: "" },
      { Metric: "Equivalent Pages", Value: `${formComplexity.equivalentPages} ${formComplexity.equivalentPages === 1 ? "Page" : "Pages"}` },
      { Metric: "Total Field Weight", Value: `${formComplexity.totalWeight} pts` },
      { Metric: "Total Data Capture Fields", Value: formComplexity.totalDataFields },
      { Metric: "Datagrid Containers", Value: `${formComplexity.datagrids?.length || 0} grid(s)` },
      { Metric: "Content Sections", Value: `${formComplexity.contentSectionsCount || 0} section(s)` },
      { Metric: "", Value: "" },
      { Metric: "--- Field Complexity Breakdown ---", Value: "" },
    ];

    (formComplexity.breakdown || []).forEach((item) => {
      summaryRows.push({
        Metric: item.name,
        Value: `Count: ${item.count} | Weight: ${item.unitWeightLabel} | Total: ${item.totalWeight} pts`,
      });
    });

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary["!cols"] = [{ wch: 45 }, { wch: 45 }];

    // Style summary headers
    if (wsSummary["A1"]) {
      wsSummary["A1"].s = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1B365D" } },
      };
    }
    if (wsSummary["A2"]) {
      wsSummary["A2"].s = {
        font: { bold: true, color: { rgb: "0D6EFD" } },
        fill: { fgColor: { rgb: "E7F1FF" } },
      };
    }

    XLSX.utils.book_append_sheet(wb, wsSummary, "Estimation Summary");
  }

  const exportData = data
    .filter((entry) => !hiddenTypes.includes(entry.type))
    .map((entry) => {
      let optionLabels = "";
      let optionValues = "";

      // Logic for Select and Radio components
      if (entry.type === "select" || entry.type === "radio") {
        const source = entry.type === "select" ? selectValues : radioValues;
        const found = source.find((v) => v.key === entry.key);

        if (found && found.values) {
          optionLabels = found.values
            .map((opt) => opt.label || opt.value)
            .join(" || ");
          
          optionValues = found.values
            .map((opt) => opt.value || opt.label)
            .join(" || ");
        }
      }

      let displayType = entry.type;
      if (entry.type === "select") {
        displayType = entry.multiple === true ? "multiselect" : "select";
      }

      return {
        Label: entry.type === "panel" ? entry.title : entry.label,
        Key: entry.key || "",
        KeyLength: entry.key ? entry.key.length : 0,
        Type: displayType,
        Required: entry.required ? "YES" : "NO",
        "Parent Grid": entry.insideGrid ? (entry.gridLabel || entry.gridKey || "Datagrid") : "-",
        Format: entry.format || "",
        "Option Labels": optionLabels,
        "Option Values": optionValues,
      };
    });

  const ws = XLSX.utils.json_to_sheet(exportData);

  const colKeys = Object.keys(exportData[0] || {});

  // 1. Style Header Row (Row 1)
  colKeys.forEach((_, c) => {
    const colLetter = XLSX.utils.encode_col(c);
    const headerRef = `${colLetter}1`;
    if (ws[headerRef]) {
      ws[headerRef].s = {
        fill: { fgColor: { rgb: "1B365D" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        alignment: { vertical: "center", horizontal: "left" },
      };
    }
  });

  // 2. Apply vibrant yellow fill highlight to all datagrid internal field rows
  const filteredList = data.filter((entry) => !hiddenTypes.includes(entry.type));
  filteredList.forEach((entry, rowIdx) => {
    if (entry.insideGrid) {
      const excelRow = rowIdx + 2; // 1-based index (row 1 is header)
      colKeys.forEach((_, c) => {
        const colLetter = XLSX.utils.encode_col(c);
        const cellRef = `${colLetter}${excelRow}`;
        if (ws[cellRef]) {
          ws[cellRef].s = {
            fill: {
              patternType: "solid",
              fgColor: { rgb: "FFF59D" }, // Vibrant soft yellow
            },
            font: {
              bold: true,
              color: { rgb: "423000" }, // Readable dark brown/gold
            },
            border: {
              top: { style: "thin", color: { rgb: "E6D56A" } },
              bottom: { style: "thin", color: { rgb: "E6D56A" } },
              left: { style: "thin", color: { rgb: "E6D56A" } },
              right: { style: "thin", color: { rgb: "E6D56A" } },
            },
          };
        }
      });
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, "Labels");
  
  // Auto-size columns slightly for better readability
  const max_width = exportData.reduce((w, r) => Math.max(w, r.Label ? String(r.Label).length : 0), 10);
  ws["!cols"] = [
    { wch: max_width },
    { wch: 22 },
    { wch: 10 },
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 40 },
    { wch: 40 },
  ];

  XLSX.writeFile(wb, `form-mapping-${new Date().toISOString().split("T")[0]}.xlsx`);
};

  export const exportJsonData = (data, jsonStats, searchResults, hiddenTypes) => {
    const exportData = {
      extractedLabels: data,
      jsonStatistics: jsonStats,
      searchResults: searchResults,
      metadata: {
        extractedAt: new Date().toISOString(),
        totalItems: data.length,
        hiddenTypes: hiddenTypes,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `json-extractor-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

export const exportBulkQcToExcel = (bulkResults, filename = null) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Form QC Summary
  const summaryRows = (bulkResults.forms || []).map((form) => ({
    "Form ID": form.id,
    "Form Name": form.name,
    "QC Status": form.status.toUpperCase(),
    "Health Score (%)": `${form.healthScore}%`,
    "Critical Errors": form.errorCount,
    "Warnings": form.warningCount,
    "Total Fields": form.totalComponents,
  }));
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary["!cols"] = [
    { wch: 12 },
    { wch: 45 },
    { wch: 15 },
    { wch: 18 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, "QC Summary");

  // Sheet 2: All QC Issues
  const issueRows = [];
  (bulkResults.forms || []).forEach((form) => {
    (form.validationIssues || []).forEach((issue) => {
      issueRows.push({
        "Form ID": form.id,
        "Form Name": form.name,
        "Severity": (issue.severity || "info").toUpperCase(),
        "Issue Category": issue.type || "General",
        "Field Label": issue.field || "",
        "Current Key": issue.key || "",
        "Expected Key": issue.expected || "",
        "Message": issue.message || "",
      });
    });
  });
  const wsIssues = XLSX.utils.json_to_sheet(issueRows.length > 0 ? issueRows : [{ Note: "No QC issues found" }]);
  if (issueRows.length > 0) {
    wsIssues["!cols"] = [
      { wch: 12 },
      { wch: 35 },
      { wch: 12 },
      { wch: 25 },
      { wch: 30 },
      { wch: 25 },
      { wch: 25 },
      { wch: 60 },
    ];
  }
  XLSX.utils.book_append_sheet(wb, wsIssues, "All QC Issues");

  // Sheet 3: Master Field Catalog
  const catalogRows = [];
  (bulkResults.forms || []).forEach((form) => {
    (form.labels || []).forEach((entry) => {
      let optionLabels = "";
      let optionValues = "";

      if (entry.type === "select" || entry.type === "radio") {
        const source = entry.type === "select" ? (form.selectValues || []) : (form.radioValues || []);
        const found = source.find((v) => v.key === entry.key);
        if (found && found.values) {
          optionLabels = found.values.map((opt) => opt.label || opt.value).join(" || ");
          optionValues = found.values.map((opt) => opt.value || opt.label).join(" || ");
        }
      }

      catalogRows.push({
        "Form ID": form.id,
        "Form Name": form.name,
        "Field Label": entry.type === "panel" ? entry.title : entry.label,
        "Field Key": entry.key || "",
        "Key Length": entry.key ? entry.key.length : 0,
        "Field Type": entry.type === "select" && entry.multiple ? "multiselect" : entry.type,
        "Format": entry.format || "",
        "Option Labels": optionLabels,
        "Option Values": optionValues,
      });
    });
  });
  const wsCatalog = XLSX.utils.json_to_sheet(catalogRows.length > 0 ? catalogRows : [{ Note: "No fields extracted" }]);
  if (catalogRows.length > 0) {
    wsCatalog["!cols"] = [
      { wch: 12 },
      { wch: 35 },
      { wch: 35 },
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 35 },
    ];
  }
  XLSX.utils.book_append_sheet(wb, wsCatalog, "Field Catalog");

  const exportFilename = filename || `bulk-qc-report-${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, exportFilename);
};