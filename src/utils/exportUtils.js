import * as XLSX from "xlsx";



// export const exportToExcel = (data, hiddenTypes) => {
//     const exportData = data
//       .filter((entry) => !hiddenTypes.includes(entry.type))
//       .map((entry) => ({
//         Label: entry.type === "panel" ? entry.title : entry.label,
//         Key: entry.key || "",
//         KeyLength: entry.key ? entry.key.length : 0,
//         Type: entry.type,
//         Format: entry.format || "",
//       }));

//     const ws = XLSX.utils.json_to_sheet(exportData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Labels");
//     XLSX.writeFile(wb, `labels-${new Date().toISOString().split("T")[0]}.xlsx`);
//   };

export const exportToExcel = (data, hiddenTypes, selectValues = [], radioValues = []) => {
  const exportData = data
    .filter((entry) => !hiddenTypes.includes(entry.type))
    .map((entry) => {
      let optionLabels = "";
      let optionValues = "";

      // Logic for Select and Radio components
      if (entry.type === "select" || entry.type === "radio") {
        // Find matching source (selectValues or radioValues) based on key
        const source = entry.type === "select" ? selectValues : radioValues;
        const found = source.find((v) => v.key === entry.key);

        if (found && found.values) {
          // Extract Labels (e.g., "Male", "Female")
          optionLabels = found.values
            .map((opt) => opt.label || opt.value)
            .join(" || ");
          
          // Extract Values (e.g., "m", "f")
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
        Format: entry.format || "",
        "Option Labels": optionLabels, // Human-readable
        "Option Values": optionValues, // Data values
      };
    });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Labels");
  
  // Auto-size columns slightly for better readability
  const max_width = exportData.reduce((w, r) => Math.max(w, r.Label ? String(r.Label).length : 0), 10);
  ws["!cols"] = [{ wch: max_width }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 40 }];

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