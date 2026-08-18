// ============================================================
// Label → Key conversion (shared convention)
// ============================================================
export const convertLabelToKey = (label) => {
  if (!label) return "";
  return label
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
};

// ============================================================
// extractLabelsFromJSON
// ============================================================
export function extractLabelsFromJSON(json, currentPath = [], results = []) {
  if (json && typeof json === "object") {
    if (json.label && json.type) {
      const entry = {
        label: json.label,
        key: json.key,
        type: json.type,
        path: [...currentPath],
      };
      if (json.multiple !== undefined) {
        entry.multiple = json.multiple;
      }
      if (json.type === "datetime" && json.format) {
        entry.format = json.format;
      }
      if (json.title) {
        entry.title = json.title;
      }
      results.push(entry);
    }

    Object.keys(json).forEach((key) => {
      const prop = json[key];
      if (Array.isArray(prop)) {
        prop.forEach((item, idx) => {
          extractLabelsFromJSON(item, [...currentPath, key, idx], results);
        });
      } else if (typeof prop === "object") {
        extractLabelsFromJSON(prop, [...currentPath, key], results);
      }
    });
  }
  return results;
}

// ============================================================
// extractConditions
// ============================================================
export function extractConditions(json) {
  const results = [];

  function traverse(obj, path = []) {
    if (obj && typeof obj === "object") {
      if (
        obj.conditional &&
        typeof obj.conditional === "object" &&
        obj.conditional.when
      ) {
        const { show, when, eq } = obj.conditional;
        results.push({
          key: obj.key || "unknown",
          label: obj.label || obj.title || "Unnamed",
          path: [...path],
          conditions: [{ type: "simpleConditional", show, when, eq }],
          affectedFields: [when],
        });
      }

      Object.keys(obj).forEach((key) => {
        const prop = obj[key];
        if (Array.isArray(prop)) {
          prop.forEach((item, idx) => traverse(item, [...path, key, idx]));
        } else if (typeof prop === "object" && prop !== null) {
          traverse(prop, [...path, key]);
        }
      });
    }
  }

  traverse(json);
  return results;
}

const updateConditionReferenceValue = (value, oldValue, newValue) => {
  if (typeof value !== "string") return value;

  if (value === oldValue) return newValue;

  const pathSegments = value.split(".");
  if (pathSegments[pathSegments.length - 1] === oldValue) {
    pathSegments[pathSegments.length - 1] = newValue;
    return pathSegments.join(".");
  }

  const escapedOldValue = oldValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pathPattern = new RegExp(`(^|\\.)${escapedOldValue}(\\.|$)`);
  if (pathPattern.test(value)) {
    return value.replace(pathPattern, `$1${newValue}$2`);
  }

  return value;
};

const matchesConditionalReference = (value, referenceKey) => {
  if (typeof value !== "string" || !referenceKey) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const segments = trimmed.split(".");
  return trimmed === referenceKey || segments.includes(referenceKey);
};

export const updateConditionReferencesInJson = (
  obj,
  oldValue,
  newValue,
  fields = ["when"],
  patches = [],
  options = {}
) => {
  if (!obj || typeof obj !== "object") {
    return { updated: obj, patches };
  }

  if (Array.isArray(obj)) {
    const updatedArr = obj.map((item) => {
      const res = updateConditionReferencesInJson(item, oldValue, newValue, fields, patches, options);
      return res.updated;
    });
    return { updated: updatedArr, patches };
  }

  const result = {};
  let changed = false;

  for (const [key, value] of Object.entries(obj)) {
    if (key === "conditional" && value && typeof value === "object") {
      const nextConditional = { ...value };
      const shouldUpdateThisCondition = !options.referenceKey || matchesConditionalReference(nextConditional.when, options.referenceKey);

      if (fields.includes("when") && shouldUpdateThisCondition) {
        const updatedWhen = updateConditionReferenceValue(nextConditional.when, oldValue, newValue);
        if (updatedWhen !== nextConditional.when) {
          nextConditional.when = updatedWhen;
          changed = true;
        }
      }
      if (fields.includes("eq") && shouldUpdateThisCondition) {
        if (nextConditional.eq === oldValue) {
          nextConditional.eq = newValue;
          changed = true;
        }
      }
      result[key] = nextConditional;
    } else if (value && typeof value === "object") {
      const res = updateConditionReferencesInJson(value, oldValue, newValue, fields, patches, options);
      result[key] = res.updated;
    } else {
      result[key] = value;
    }
  }

  if (changed) {
    patches.push({
      fieldKey: obj.key || "unknown",
      fieldLabel: obj.label || obj.title || "Unnamed",
      oldWhen: fields.includes("when") ? oldValue : undefined,
      newWhen: fields.includes("when") ? newValue : undefined,
      oldEq: fields.includes("eq") ? oldValue : undefined,
      newEq: fields.includes("eq") ? newValue : undefined,
    });
  }

  return { updated: result, patches };
};

// ============================================================
// findDuplicateValues (internal helper)
// ============================================================
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

// ============================================================
// Mismatch detection for select / radio option values
// Checks: convertLabelToKey(option.label) !== option.value
// ============================================================
const findOptionMismatches = (values) => {
  return values
    .filter((v) => {
      const expected = convertLabelToKey(v.label);
      return expected && v.value !== expected;
    })
    .map((v) => ({
      label: v.label,
      value: v.value,
      expected: convertLabelToKey(v.label),
    }));
};

// ============================================================
// extractSelectValues
// ============================================================
export const extractSelectValues = (jsonData) => {
  const selectItems = [];

  const traverse = (obj, path = []) => {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => traverse(item, [...path, idx]));
      } else {
        if (obj.type === "select" && obj.data?.values) {
          const values = obj.data.values.map((v) => ({
            label: v.label,
            value: v.value,
          }));
          selectItems.push({
            label: obj.label || "Unknown",
            key: obj.key || "Unknown",
            path: [...path],         // path to the select component itself
            values,
            duplicateValues: findDuplicateValues(values) || null,
            mismatchedValues: findOptionMismatches(values),
          });
        }
        Object.entries(obj).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            v.forEach((item, idx) => traverse(item, [...path, k, idx]));
          } else if (v && typeof v === "object") {
            traverse(v, [...path, k]);
          }
        });
      }
    }
  };

  try {
    const parsed = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    traverse(parsed);
  } catch (e) {
    console.error("Error parsing JSON for select values:", e);
  }

  return selectItems;
};

// ============================================================
// extractSurveyValues
// ============================================================
export const extractSurveyValues = (jsonData) => {
  const surveyItems = [];

  const traverse = (obj) => {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach(traverse);
      } else {
        if (obj.type === "survey") {
          const questions = Array.isArray(obj.questions)
            ? obj.questions.map((q) => ({ label: q.label, value: q.value }))
            : [];
          const ratingValues = Array.isArray(obj.values)
            ? obj.values.map((v) => ({ label: v.label, value: v.value }))
            : [];
          const duplicates = findDuplicateValues(ratingValues);
          surveyItems.push({
            label: obj.label || "Unknown",
            key: obj.key || "Unknown",
            questions,
            values: ratingValues,
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
    console.error("Error parsing JSON for survey values:", e);
  }

  return surveyItems;
};

// ============================================================
// extractRadioValues
// ============================================================
export const extractRadioValues = (jsonData) => {
  const radioItems = [];

  const traverse = (obj, path = []) => {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => traverse(item, [...path, idx]));
      } else {
        if (obj.type === "radio" && Array.isArray(obj.values)) {
          const values = obj.values.map((v) => ({
            label: v.label,
            value: v.value || v.label,
          }));
          radioItems.push({
            label: obj.label || "Unknown Radio",
            key: obj.key || "unknown_key",
            path: [...path],         // path to the radio component itself
            values,
            duplicateValues: findDuplicateValues(values) || null,
            mismatchedValues: findOptionMismatches(values),
          });
        }
        Object.entries(obj).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            v.forEach((item, idx) => traverse(item, [...path, k, idx]));
          } else if (v && typeof v === "object") {
            traverse(v, [...path, k]);
          }
        });
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

// ============================================================
// deepCompareJSON
// ============================================================
export function deepCompareJSON(data1, data2) {
  let report = [];
  const map1 = {};
  data1.forEach((item) => (map1[item.label] = item.type));
  const map2 = {};
  data2.forEach((item) => (map2[item.label] = item.type));

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

  Object.keys(map2).forEach((key) => {
    if (!(key in map1)) {
      report.push({ issue: "Missing in JSON 1", details: key });
    }
  });

  return report;
}

// ============================================================
// copyToClipboard
// ============================================================
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

export const convertText = (input) => {
  if (!input) return "";
  return input
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^(\d+)/, "");
};

export const limitText = (input, maxLength = 110) => {
  let converted = convertText(input);
  converted = converted.replace(/^_+|_+$/g, "");
  return converted.slice(0, maxLength);
};