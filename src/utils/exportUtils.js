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

      return {
        Label: entry.type === "panel" ? entry.title : entry.label,
        Key: entry.key || "",
        KeyLength: entry.key ? entry.key.length : 0,
        Type: entry.type,
        Format: entry.format || "",
        "Option Labels": optionLabels, // Human-readable
        "Option Values": optionValues, // Data values
      };
    });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Labels");
  
  // Auto-size columns slightly for better readability
  const max_width = exportData.reduce((w, r) => Math.max(w, r.Label.length), 10);
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