import * as XLSX from "xlsx";

/**
 * Regex patterns for format validation
 */
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  url: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
  date: /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$|^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/,
};

/**
 * Parse an uploaded file (.csv, .xlsx, .xls, .json) into rows and columns
 */
export async function parseDataFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (file.name.endsWith(".json")) {
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const rows = Array.isArray(parsed)
            ? parsed
            : parsed.data && Array.isArray(parsed.data)
            ? parsed.data
            : [parsed];

          if (rows.length === 0) {
            throw new Error("JSON file contains no rows");
          }

          const columnSet = new Set();
          rows.forEach((r) => {
            if (r && typeof r === "object") {
              Object.keys(r).forEach((k) => columnSet.add(k));
            }
          });

          const columns = Array.from(columnSet);
          resolve({
            rows,
            columns,
            fileName: file.name,
            totalRows: rows.length,
            totalCols: columns.length,
          });
        } catch (err) {
          reject(new Error("Failed to parse JSON file: " + err.message));
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

          if (rows.length === 0) {
            throw new Error("Uploaded spreadsheet contains no data rows");
          }

          const columns = Object.keys(rows[0] || {});
          resolve({
            rows,
            columns,
            fileName: file.name,
            totalRows: rows.length,
            totalCols: columns.length,
          });
        } catch (err) {
          reject(new Error("Failed to parse Excel/CSV file: " + err.message));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

/**
 * Auto-detect data type for a list of values in a column
 */
export function detectColumnType(values) {
  const nonNulls = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");

  if (nonNulls.length === 0) {
    return { inferredType: "string", isMistypedNumber: false, typeCounts: {} };
  }

  const typeCounts = {
    number: 0,
    boolean: 0,
    date: 0,
    email: 0,
    phone: 0,
    url: 0,
    string: 0,
  };

  let stringAsNumberCount = 0;

  nonNulls.forEach((v) => {
    const str = String(v).trim();

    if (typeof v === "boolean" || str.toLowerCase() === "true" || str.toLowerCase() === "false") {
      typeCounts.boolean++;
    } else if (PATTERNS.email.test(str)) {
      typeCounts.email++;
    } else if (PATTERNS.url.test(str)) {
      typeCounts.url++;
    } else if (PATTERNS.phone.test(str)) {
      typeCounts.phone++;
    } else if (typeof v === "number" || (!isNaN(Number(str)) && str !== "")) {
      typeCounts.number++;
      if (typeof v === "string") {
        stringAsNumberCount++;
      }
    } else if (!isNaN(Date.parse(str)) && PATTERNS.date.test(str)) {
      typeCounts.date++;
    } else {
      typeCounts.string++;
    }
  });

  const total = nonNulls.length;
  let inferredType = "string";
  let maxCount = 0;

  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      inferredType = type;
    }
  });

  const isMistypedNumber = inferredType === "number" && stringAsNumberCount / total > 0.5;

  return {
    inferredType,
    isMistypedNumber,
    typeCounts,
    totalNonNulls: total,
  };
}

/**
 * Calculate column statistics and profiling data
 */
export function profileColumn(columnName, rows) {
  const values = rows.map((r) => (r ? r[columnName] : null));
  const totalRows = values.length;

  const nullValues = values.filter((v) => v === null || v === undefined || String(v).trim() === "");
  const nullCount = nullValues.length;
  const nullPercentage = totalRows > 0 ? (nullCount / totalRows) * 100 : 0;

  const nonNullValues = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
  const uniqueSet = new Set(nonNullValues.map((v) => String(v).trim()));
  const uniqueCount = uniqueSet.size;
  const uniquePercentage = nonNullValues.length > 0 ? (uniqueCount / nonNullValues.length) * 100 : 0;

  const typeInfo = detectColumnType(values);

  // Frequency analysis (top 5 frequent values)
  const frequencyMap = {};
  nonNullValues.forEach((v) => {
    const key = String(v);
    frequencyMap[key] = (frequencyMap[key] || 0) + 1;
  });

  const topValues = Object.entries(frequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([value, count]) => ({
      value,
      count,
      percentage: ((count / totalRows) * 100).toFixed(1),
    }));

  // Numeric statistics if applicable
  let numericStats = null;
  if (typeInfo.inferredType === "number") {
    const numValues = nonNullValues.map((v) => Number(v)).filter((n) => !isNaN(n));
    if (numValues.length > 0) {
      numValues.sort((a, b) => a - b);
      const sum = numValues.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / numValues.length;
      const min = numValues[0];
      const max = numValues[numValues.length - 1];
      const median =
        numValues.length % 2 === 0
          ? (numValues[numValues.length / 2 - 1] + numValues[numValues.length / 2]) / 2
          : numValues[Math.floor(numValues.length / 2)];

      numericStats = {
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
      };
    }
  }

  return {
    columnName,
    inferredType: typeInfo.inferredType,
    isMistypedNumber: typeInfo.isMistypedNumber,
    nullCount,
    nullPercentage: Number(nullPercentage.toFixed(1)),
    uniqueCount,
    uniquePercentage: Number(uniquePercentage.toFixed(1)),
    topValues,
    numericStats,
  };
}

/**
 * Evaluate Data Quality across Completeness, Validity, Uniqueness, and Consistency
 */
export function evaluateDataQuality(rows, columns, options = {}) {
  const { requiredColumns = [], keyColumns = [] } = options;

  const totalRows = rows.length;
  const profiles = columns.map((col) => profileColumn(col, rows));

  const issues = [];
  let issueIdCounter = 1;

  // 1. Completeness Checks (Nulls)
  profiles.forEach((p) => {
    const isRequired = requiredColumns.includes(p.columnName);

    if (p.nullCount > 0) {
      rows.forEach((r, idx) => {
        const val = r[p.columnName];
        if (val === null || val === undefined || String(val).trim() === "") {
          issues.push({
            id: issueIdCounter++,
            rowIndex: idx + 1,
            columnName: p.columnName,
            dimension: "Completeness",
            issueType: isRequired ? "missing_required_field" : "null_value",
            severity: isRequired ? "error" : "warning",
            message: isRequired
              ? `Required column "${p.columnName}" is missing a value at row ${idx + 1}`
              : `Column "${p.columnName}" has a missing/null value at row ${idx + 1}`,
            value: "NULL",
          });
        }
      });
    }
  });

  // 2. Validity Checks (Format & Pattern matching)
  profiles.forEach((p) => {
    if (["email", "phone", "url", "date"].includes(p.inferredType)) {
      const pattern = PATTERNS[p.inferredType];
      rows.forEach((r, idx) => {
        const val = r[p.columnName];
        if (val !== null && val !== undefined && String(val).trim() !== "") {
          const strVal = String(val).trim();
          let isValid = true;

          if (p.inferredType === "date") {
            isValid = !isNaN(Date.parse(strVal)) && pattern.test(strVal);
          } else {
            isValid = pattern.test(strVal);
          }

          if (!isValid) {
            issues.push({
              id: issueIdCounter++,
              rowIndex: idx + 1,
              columnName: p.columnName,
              dimension: "Validity",
              issueType: "invalid_format",
              severity: "warning",
              message: `Value "${strVal}" in column "${p.columnName}" does not match expected format (${p.inferredType})`,
              value: strVal,
            });
          }
        }
      });
    }
  });

  // 3. Uniqueness Checks (Duplicate Rows & Keys)
  // 3a. Full Duplicate Rows
  const rowStringMap = {};
  rows.forEach((r, idx) => {
    const rowKey = JSON.stringify(r);
    rowStringMap[rowKey] = rowStringMap[rowKey] || [];
    rowStringMap[rowKey].push(idx + 1);
  });

  Object.values(rowStringMap).forEach((dupIndices) => {
    if (dupIndices.length > 1) {
      dupIndices.slice(1).forEach((rowNum) => {
        issues.push({
          id: issueIdCounter++,
          rowIndex: rowNum,
          columnName: "Entire Row",
          dimension: "Uniqueness",
          issueType: "duplicate_row",
          severity: "warning",
          message: `Row ${rowNum} is an exact duplicate of row ${dupIndices[0]}`,
          value: `Duplicate of Row ${dupIndices[0]}`,
        });
      });
    }
  });

  // 3b. Key Column Duplicates (if keyColumns specified)
  if (keyColumns.length > 0) {
    const keyMap = {};
    rows.forEach((r, idx) => {
      const keyVal = keyColumns.map((col) => String(r[col] || "")).join(" | ");
      keyMap[keyVal] = keyMap[keyVal] || [];
      keyMap[keyVal].push(idx + 1);
    });

    Object.entries(keyMap).forEach(([keyVal, dupIndices]) => {
      if (dupIndices.length > 1) {
        dupIndices.slice(1).forEach((rowNum) => {
          issues.push({
            id: issueIdCounter++,
            rowIndex: rowNum,
            columnName: keyColumns.join(", "),
            dimension: "Uniqueness",
            issueType: "duplicate_key",
            severity: "error",
            message: `Selected key (${keyColumns.join(", ")}) value "${keyVal}" duplicated at row ${rowNum}`,
            value: keyVal,
          });
        });
      }
    });
  }

  // 4. Consistency Checks (Mistyped columns)
  profiles.forEach((p) => {
    if (p.isMistypedNumber) {
      issues.push({
        id: issueIdCounter++,
        rowIndex: 0, // Summary issue
        columnName: p.columnName,
        dimension: "Consistency",
        issueType: "mistyped_column",
        severity: "warning",
        message: `Column "${p.columnName}" contains numbers stored as text strings`,
        value: "String -> Number",
      });
    }
  });

  // Calculate Overall & Dimension Quality Scores
  const totalCells = totalRows * columns.length;
  const completenessFailures = issues.filter((i) => i.dimension === "Completeness").length;
  const validityFailures = issues.filter((i) => i.dimension === "Validity").length;
  const uniquenessFailures = issues.filter((i) => i.dimension === "Uniqueness").length;
  const consistencyFailures = issues.filter((i) => i.dimension === "Consistency").length;

  const completenessScore = Math.max(0, Math.round(100 - (completenessFailures / (totalCells || 1)) * 100));
  const validityScore = Math.max(0, Math.round(100 - (validityFailures / (totalCells || 1)) * 100));
  const uniquenessScore = Math.max(0, Math.round(100 - (uniquenessFailures / (totalRows || 1)) * 100));
  const consistencyScore = Math.max(0, Math.round(100 - consistencyFailures * 10));

  const overallScore = Math.round(
    completenessScore * 0.35 +
    validityScore * 0.35 +
    uniquenessScore * 0.2 +
    consistencyScore * 0.1
  );

  return {
    profiles,
    issues,
    scores: {
      overall: overallScore,
      completeness: completenessScore,
      validity: validityScore,
      uniqueness: uniquenessScore,
      consistency: consistencyScore,
    },
  };
}

/**
 * Export flagged issues to a downloadable CSV/Excel report file
 */
export function exportIssueReport(issues, fileName = "data_quality_issues.csv") {
  if (!issues || issues.length === 0) return;

  const exportData = issues.map((i) => ({
    "Issue ID": i.id,
    "Row Number": i.rowIndex > 0 ? i.rowIndex : "N/A (Summary)",
    "Column Name": i.columnName,
    "Quality Dimension": i.dimension,
    "Issue Type": i.issueType,
    Severity: i.severity.toUpperCase(),
    Description: i.message,
    "Problematic Value": i.value,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Quality Issues");
  XLSX.writeFile(workbook, fileName);
}
