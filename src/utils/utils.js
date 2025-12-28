
export function extractLabelsFromJSON(json) {
  let result = [];

  function traverse(obj) {
    if (obj && typeof obj === "object") {
      // If the current object has both "label" and "type", add it.
      if (obj.label && obj.type) {
        const entry = {
          label: obj.label,
          key: obj.key,
          type: obj.type,
        };

        // Add optional fields
        if (obj.type === "datetime" && obj.format) {
          entry.format = obj.format;
        }

        if (obj.title) {
          entry.title = obj.title;
        }

        result.push(entry);
      }

      // Traverse arrays and nested objects
      Object.keys(obj).forEach((key) => {
        const prop = obj[key];
        if (Array.isArray(prop)) {
          prop.forEach((item) => traverse(item));
        } else if (typeof prop === "object") {
          traverse(prop);
        }
      });
    }
  }

  traverse(json);
  return result;
}

// ======================

const findDuplicateValues = (values) => {
  const valueMap = {};
  values.forEach(({ label, value }) => {
    if (!valueMap[value]) valueMap[value] = [];
    valueMap[value].push(label);
  });

  // Collect only those values that have multiple labels
  return Object.entries(valueMap)
    .filter(([_, labels]) => labels.length > 1)
    .map(([value, labels]) => ({ value, labels }));
};



export const extractSelectValues = (jsonData) => {
  const selectItems = [];

  const traverse = (obj) => {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach(traverse);
      } else {
        if (obj.type === "select" && obj.data?.values) {
          const values = obj.data.values.map((v) => ({
            label: v.label,
            value: v.value,
          }));

          const duplicates = findDuplicateValues(values);

          selectItems.push({
            label: obj.label || "Unknown",
            key: obj.key || "Unknown",
            values,
            duplicateValues: duplicates.length ? duplicates : null,
          });
        }

        Object.values(obj).forEach(traverse);
      }
    }
  };

  try {
    const parsed =
      typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    traverse(parsed);
  } catch (e) {
    console.error("Error parsing JSON for select values:", e);
  }

  return selectItems;
};

// 🟢 Main: Extract SURVEY components and detect duplicate values
export const extractSurveyValues = (jsonData) => {
  const surveyItems = [];

  const traverse = (obj) => {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach(traverse);
      } else {
        if (obj.type === "survey" && Array.isArray(obj.questions)) {
          const values = obj.questions.map((q) => ({
            label: q.label,
            value: q.value,
          }));

          const duplicates = findDuplicateValues(values);

          surveyItems.push({
            label: obj.label || "Unknown",
            key: obj.key || "Unknown",
            questions: values,
            duplicateValues: duplicates.length ? duplicates : null,
          });
        }

        Object.values(obj).forEach(traverse);
      }
    }
  };

  try {
    const parsed =
      typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    traverse(parsed);
  } catch (e) {
    console.error("Error parsing JSON for survey values:", e);
  }

  return surveyItems;
};



// Extract RADIO components and detect duplicate values
export const extractRadioValues = (jsonData) => {
  const radioItems = [];

  const findDuplicateValues = (values) => {
    const valueMap = {};
    values.forEach(({ label, value }) => {
      if (!valueMap[value]) valueMap[value] = [];
      valueMap[value].push(label);
    });

    return Object.entries(valueMap)
      .filter(([_, labels]) => labels.length > 1)
      .map(([value, labels]) => ({ value, labels }));
  };

  const traverse = (obj) => {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach(traverse);
      } else {
        if (obj.type === "radio" && Array.isArray(obj.values)) {
          const values = obj.values.map((v) => ({
            label: v.label,
            value: v.value || v.label, // fallback if value missing
          }));

          const duplicates = findDuplicateValues(values);

          radioItems.push({
            label: obj.label || "Unknown Radio",
            key: obj.key || "unknown_key",
            values,
            duplicateValues: duplicates.length ? duplicates : null,
          });
        }

        Object.values(obj).forEach(traverse);
      }
    }
  };

  try {
    const parsed = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    traverse(parsed);
  } catch (e) {
    console.error("Error parsing JSON for radio values:", e);
  }

  return radioItems;
};

// Deep compare two arrays of extracted entries (by label) and return report differences.
export function deepCompareJSON(data1, data2) {
  let report = [];
  const map1 = {};
  data1.forEach((item) => (map1[item.label] = item.type));
  const map2 = {};
  data2.forEach((item) => (map2[item.label] = item.type));

  // Find keys in data1 missing or different in data2
  Object.keys(map1).forEach((key) => {
    if (!(key in map2)) {
      report.push({ issue: "Missing in JSON 2", details: key });
    } else if (map1[key] !== map2[key]) {
      report.push({
        issue: "Type mismatch for key: " + key,
        details: `JSON1: ${map1[key]}, JSON2: ${map2[key]}`,
      });
    }
  });

  // Find keys in data2 that are missing in JSON1
  Object.keys(map2).forEach((key) => {
    if (!(key in map1)) {
      report.push({ issue: "Missing in JSON 1", details: key });
    }
  });

  return report;
}

// utils/textUtils.js

// ✅ Copy text to clipboard (with fallback)
export const copyToClipboard = (text) => {
  if (!text) return;
  try {
    navigator.clipboard.writeText(text);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }
};

// ✅ Standard conversion
export const convertText = (input) => {
  if (!input) return "";
  return input
    .replace(/[^a-zA-Z0-9]+/g, "_") // replace non-alphanumeric with "_"
    .replace(/^(\d+)/, ""); // remove leading numbers
};

// ✅ Limited characters conversion (with trimming & length limit)
export const limitText = (input, maxLength = 110) => {
  let converted = convertText(input);

  // Remove leading/trailing underscores
  converted = converted.replace(/^_+|_+$/g, "");

  // Limit to maxLength characters
  return converted.slice(0, maxLength);
};
