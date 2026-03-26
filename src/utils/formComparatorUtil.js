
// Deep comparison of two JSON objects
export const deepCompare = (obj1, obj2, path = "") => {
  const differences = [];

  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(obj1 || {}),
    ...Object.keys(obj2 || {}),
  ]);

  allKeys.forEach((key) => {
    const newPath = path ? `${path}.${key}` : key;
    const val1 = obj1?.[key];
    const val2 = obj2?.[key];

    if (val1 === undefined) {
      differences.push({
        path: newPath,
        type: "added",
        value: val2,
        oldValue: undefined,
      });
    } else if (val2 === undefined) {
      differences.push({
        path: newPath,
        type: "removed",
        value: undefined,
        oldValue: val1,
      });
    } else if (
      typeof val1 === "object" &&
      typeof val2 === "object" &&
      val1 !== null &&
      val2 !== null
    ) {
      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          differences.push({
            path: newPath,
            type: "modified",
            value: val2,
            oldValue: val1,
          });
        }
      } else {
        differences.push(...deepCompare(val1, val2, newPath));
      }
    } else if (val1 !== val2) {
      differences.push({
        path: newPath,
        type: "modified",
        value: val2,
        oldValue: val1,
      });
    }
  });

  return differences;
};

// Generate formatted JSON with line numbers
export const formatJsonWithLines = (obj) => {
  const jsonString = JSON.stringify(obj, null, 2);
  return jsonString.split("\n").map((line, index) => ({
    lineNum: index + 1,
    content: line,
  }));
};

// Find differences in formatted JSON
export const getJsonDiff = (json1, json2) => {
  const lines1 = formatJsonWithLines(json1).map((l) => l.content);
  const lines2 = formatJsonWithLines(json2).map((l) => l.content);

  const diffLines = [];
  const maxLen = Math.max(lines1.length, lines2.length);

  for (let i = 0; i < maxLen; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];

    if (line1 === undefined) {
      diffLines.push({
        lineNum: i + 1,
        type: "added",
        content: line2,
        oldContent: undefined,
      });
    } else if (line2 === undefined) {
      diffLines.push({
        lineNum: i + 1,
        type: "removed",
        content: undefined,
        oldContent: line1,
      });
    } else if (line1 !== line2) {
      diffLines.push({
        lineNum: i + 1,
        type: "modified",
        content: line2,
        oldContent: line1,
      });
    } else {
      diffLines.push({
        lineNum: i + 1,
        type: "same",
        content: line1,
        oldContent: undefined,
      });
    }
  }

  return diffLines;
};

// Get summary statistics
export const getComparisonSummary = (differences) => {
  return {
    added: differences.filter((d) => d.type === "added").length,
    removed: differences.filter((d) => d.type === "removed").length,
    modified: differences.filter((d) => d.type === "modified").length,
    total: differences.length,
  };
};

export const extractFields = (components, fields = {}) => {
  const ignoreTypes = ["container", "columns", "content"];

  components.forEach((comp) => {
    if (!ignoreTypes.includes(comp.type)) {
      if (comp.key) {
        fields[comp.key] = comp.label || "";
      }
    }

    if (comp.components) {
      extractFields(comp.components, fields);
    }

    if (comp.columns) {
      comp.columns.forEach((col) =>
        extractFields(col.components || [], fields)
      );
    }
  });

  return fields;
};

export const compareFormsData = (sandboxObj, prodObj) => {
  const sandboxFields = extractFields(
    sandboxObj.components || sandboxObj
  );
  const prodFields = extractFields(
    prodObj.components || prodObj
  );

  const similar = [];
  const missing = [];
  const warnings = [];

  Object.keys(prodFields).forEach((key) => {
    if (sandboxFields[key]) {
      if (prodFields[key] !== sandboxFields[key]) {
        warnings.push({
          key,
          prodLabel: prodFields[key],
          sandboxLabel: sandboxFields[key],
        });
      } else {
        similar.push({ key, label: prodFields[key] });
      }
    } else {
      missing.push({
        key,
        label: prodFields[key],
        type: "Missing in Sandbox",
      });
    }
  });

  Object.keys(sandboxFields).forEach((key) => {
    if (!prodFields[key]) {
      missing.push({
        key,
        label: sandboxFields[key],
        type: "Missing in Prod",
      });
    }
  });

  return { similar, missing, warnings };
};
