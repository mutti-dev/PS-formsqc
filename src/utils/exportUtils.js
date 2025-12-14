import * as XLSX from "xlsx";



export const exportToExcel = (data, hiddenTypes) => {
    const exportData = data
      .filter((entry) => !hiddenTypes.includes(entry.type))
      .map((entry) => ({
        Label: entry.type === "panel" ? entry.title : entry.label,
        Key: entry.key || "",
        KeyLength: entry.key ? entry.key.length : 0,
        Type: entry.type,
        Format: entry.format || "",
      }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Labels");
    XLSX.writeFile(wb, `labels-${new Date().toISOString().split("T")[0]}.xlsx`);
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