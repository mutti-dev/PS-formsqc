import {
  extractFormJson,
  deepParse,
  removeSubmitButtonsOutsideContainer,
} from "./jsonUtils";
import {
  extractLabelsFromJSON,
  extractSelectValues,
  extractRadioValues,
  extractSurveyValues,
  extractConditions,
  convertLabelToKey,
  updateConditionReferencesInJson,
} from "./utils";
import { checkReservedColumnMatch } from "../config/reservedColumns";
import { parseBulkFormInput } from "./bulkJsonParser";

/**
 * Validate form structure for a single form config.
 */
export const validateFormStructure = (
  labels = [],
  selectValues = [],
  radioValues = [],
  formConfig = {},
  formType = "Form",
  keyLengthThreshold = 110
) => {
  const issues = [];

  (labels || []).forEach((entry) => {
    if (entry.type === "content" || entry.type === "columns") return;
    const fieldLabel = entry.type === "panel" ? entry.title : entry.label;
    const fieldKey = entry.key;

    // Check Container Key Rule
    if (
      entry.type === "container" ||
      (fieldLabel === "Container" && typeof fieldKey === "string" && fieldKey.toLowerCase() === "container")
    ) {
      if (fieldKey !== "Container") {
        issues.push({
          type: "container_key_invalid",
          severity: "error",
          field: fieldLabel || "Container",
          key: fieldKey,
          expected: "Container",
          path: entry.path,
          labelField: "label",
          message: `Container field key must be "Container", not "${fieldKey}"`,
        });
      }
      return;
    }

    // Label / Key Mismatch
    if (fieldLabel && fieldKey && typeof fieldKey === "string") {
      const expectedKey = convertLabelToKey(fieldLabel);
      if (expectedKey && fieldKey !== expectedKey) {
        issues.push({
          type: "label_key_mismatch",
          severity: "warning",
          field: fieldLabel,
          key: fieldKey,
          expected: expectedKey,
          path: entry.path,
          labelField: entry.type === "panel" ? "title" : "label",
          message: `Label and Key mismatch: "${fieldLabel}" should have key "${expectedKey}", not "${fieldKey}"`,
        });
      }
    }

    // Key Length Limit
    if (fieldKey && typeof fieldKey === "string" && keyLengthThreshold && fieldKey.length > keyLengthThreshold) {
      let expectedKey = convertLabelToKey(fieldLabel) || fieldKey;
      if (expectedKey.length > keyLengthThreshold) {
        expectedKey = expectedKey.substring(0, keyLengthThreshold);
      }
      issues.push({
        type: "key_length_exceeded",
        severity: "error",
        field: fieldLabel,
        key: fieldKey,
        expected: expectedKey,
        path: entry.path,
        message: `Field key "${fieldKey}" length (${fieldKey.length}) exceeds maximum limit of ${keyLengthThreshold} characters`,
      });
    }

    // Datagrid / Editgrid Keyword Rule
    if (entry.type === "datagrid" || entry.type === "editgrid") {
      const hasGridKeyword =
        fieldKey &&
        typeof fieldKey === "string" &&
        (fieldKey.includes("Data_Grid") ||
          fieldKey.includes("Grid") ||
          fieldKey.toLowerCase().includes("data_grid") ||
          fieldKey.toLowerCase().includes("grid"));
      if (!hasGridKeyword) {
        issues.push({
          type: "grid_key_missing_keyword",
          severity: "error",
          field: fieldLabel,
          key: fieldKey,
          message: `${entry.type === "datagrid" ? "Datagrid" : "Editgrid"} field key "${fieldKey}" must contain keyword "Data_Grid" or "Grid"`,
        });
      }
    }

    // Reserved Column Conflicts
    const reservedMatch = checkReservedColumnMatch(fieldKey, formType, entry.insideGrid);
    if (reservedMatch) {
      issues.push({
        type: "reserved_column",
        severity: "error",
        field: fieldLabel,
        key: fieldKey,
        message: `Field key "${fieldKey}" conflicts with reserved database column "${reservedMatch}"`,
      });
    }
  });

  // Duplicate Select Options
  (selectValues || []).forEach((entry) => {
    const opts = entry.values || entry.options;
    if (!opts || !Array.isArray(opts)) return;
    const duplicateOptions = {};
    opts.forEach((option) => {
      const key = `${option.label}|${option.value}`;
      duplicateOptions[key] = duplicateOptions[key]
        ? { ...duplicateOptions[key], count: duplicateOptions[key].count + 1 }
        : { count: 1, label: option.label, value: option.value };
    });
    Object.values(duplicateOptions).forEach((opt) => {
      if (opt.count > 1) {
        issues.push({
          type: "duplicate_select_option",
          severity: "warning",
          field: entry.label,
          message: `Select field "${entry.label}" has duplicate option: label="${opt.label}", value="${opt.value}"`,
        });
      }
    });
  });

  // Duplicate Radio Options
  (radioValues || []).forEach((entry) => {
    const opts = entry.values || entry.options;
    if (!opts || !Array.isArray(opts)) return;
    const duplicateOptions = {};
    opts.forEach((option) => {
      const key = `${option.label}|${option.value}`;
      duplicateOptions[key] = duplicateOptions[key]
        ? { ...duplicateOptions[key], count: duplicateOptions[key].count + 1 }
        : { count: 1, label: option.label, value: option.value };
    });
    Object.values(duplicateOptions).forEach((opt) => {
      if (opt.count > 1) {
        issues.push({
          type: "duplicate_radio_option",
          severity: "warning",
          field: entry.label,
          message: `Radio field "${entry.label}" has duplicate option: label="${opt.label}", value="${opt.value}"`,
        });
      }
    });
  });

  return issues;
};

/**
 * Deep path setter helper
 */
export const setByPath = (obj, path, value) => {
  if (!path || path.length === 0) return value;
  const [head, ...tail] = path;
  if (Array.isArray(obj)) {
    const copy = [...obj];
    copy[head] = setByPath(copy[head], tail, value);
    return copy;
  }
  return { ...obj, [head]: setByPath(obj[head], tail, value) };
};

/**
 * Deep path getter helper
 */
export const getByPath = (obj, path) => {
  let cur = obj;
  for (const seg of path || []) {
    if (cur == null) return undefined;
    cur = cur[seg];
  }
  return cur;
};

/**
 * Find path to formConfig in a root parsed wrapper
 */
export const findPathToFormConfig = (root, target) => {
  if (root === target) return [];
  const search = (obj, path) => {
    if (!obj || typeof obj !== "object") return null;
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (obj[i] === target) return [...path, i];
        const found = search(obj[i], [...path, i]);
        if (found) return found;
      }
    } else {
      for (const [k, v] of Object.entries(obj)) {
        if (v === target) return [...path, k];
        const found = search(v, [...path, k]);
        if (found) return found;
      }
    }
    return null;
  };
  return search(root, []) || [];
};

/**
 * Validate a single form record.
 */
export function validateSingleForm(formRecord, options = {}) {
  const { formType = "Form", keyLengthThreshold = 110 } = options;
  const { id, name, rawContent, rowIndex } = formRecord;

  const parsingSteps = [];
  const addStep = (step, success = true, details = "") => {
    parsingSteps.push({ step, success, details, timestamp: new Date().toISOString() });
  };

  addStep("Validating row payload");

  if (!rawContent || !rawContent.trim()) {
    return {
      id,
      name,
      rowIndex,
      rawContent,
      status: "critical",
      errorCount: 1,
      warningCount: 0,
      healthScore: 0,
      totalComponents: 0,
      validationIssues: [
        {
          type: "empty_payload",
          severity: "error",
          field: name,
          message: "Form content is empty",
        },
      ],
      parsingSteps,
      parsedConfig: null,
      fullParsedJson: null,
      labels: [],
      selectValues: [],
      radioValues: [],
      surveyValues: [],
      conditions: [],
    };
  }

  let cleaned = rawContent.trim();

  // If wrapped in outer quotes (e.g. from TSV/Excel copy paste)
  if (cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.length >= 2) {
    if (cleaned.includes('""')) {
      cleaned = cleaned.slice(1, -1).replace(/""/g, '"');
    } else {
      try {
        const unescaped = JSON.parse(cleaned);
        if (typeof unescaped === "string") {
          cleaned = unescaped;
        } else if (typeof unescaped === "object" && unescaped !== null) {
          cleaned = JSON.stringify(unescaped);
        }
      } catch {
        const stripped = cleaned.slice(1, -1).trim();
        if (stripped.startsWith("{") || stripped.startsWith("[")) {
          cleaned = stripped;
        }
      }
    }
  }

  let fullParsedJson = null;
  let formConfig = null;

  try {
    formConfig = extractFormJson(cleaned);
    if (!formConfig || !formConfig.components || !Array.isArray(formConfig.components)) {
      throw new Error("Could not find components array in form configuration");
    }
    try {
      fullParsedJson = deepParse(JSON.parse(cleaned));
    } catch {
      fullParsedJson = formConfig;
    }
    addStep("JSON syntax validation", true, "Valid JSON format");
  } catch (err) {
    try {
      const unescaped = cleaned.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      formConfig = extractFormJson(unescaped);
      if (!formConfig || !formConfig.components || !Array.isArray(formConfig.components)) {
        throw new Error("Could not find components array in unescaped configuration");
      }
      try {
        fullParsedJson = deepParse(JSON.parse(unescaped));
      } catch {
        fullParsedJson = formConfig;
      }
      addStep("JSON syntax validation", true, "Valid JSON format (auto-recovered)");
    } catch (fallbackErr) {
      addStep("JSON syntax validation", false, err.message);
      return {
        id,
        name,
        rowIndex,
        rawContent,
        status: "critical",
        errorCount: 1,
        warningCount: 0,
        healthScore: 0,
        totalComponents: 0,
        validationIssues: [
          {
            type: "json_syntax_error",
            severity: "error",
            field: name,
            message: `Invalid JSON syntax: ${err.message}`,
          },
        ],
        parsingSteps,
        parsedConfig: null,
        fullParsedJson: null,
        labels: [],
        selectValues: [],
        radioValues: [],
        surveyValues: [],
        conditions: [],
      };
    }
  }

  addStep("Locating form components", true, `${formConfig.components.length} top-level components found`);

  // Strip trailing submit buttons outside of container
  const initialCompCount = formConfig.components.length;
  formConfig.components = removeSubmitButtonsOutsideContainer(formConfig.components) || [];
  const removedSubmitCount = initialCompCount - formConfig.components.length;
  if (removedSubmitCount > 0) {
    addStep("Submit button cleanup", true, `Removed ${removedSubmitCount} submit button(s) outside of container`);
  }

  // Component extractions
  const labels = extractLabelsFromJSON(formConfig, [], []);
  const selectValues = extractSelectValues(formConfig);
  const radioValues = extractRadioValues(formConfig);
  const surveyValues = extractSurveyValues(formConfig);
  const conditions = extractConditions(formConfig);

  // Validate form structure
  const issues = validateFormStructure(labels, selectValues, radioValues, formConfig, formType, keyLengthThreshold);

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const healthScore = Math.max(0, 100 - (errorCount * 25 + warningCount * 5));

  let status = "clean";
  if (errorCount > 0) {
    status = "critical";
  } else if (warningCount > 0) {
    status = "warning";
  }

  addStep(
    "Quality verification complete",
    errorCount === 0,
    `${errorCount} critical errors, ${warningCount} warnings found`
  );

  return {
    id,
    name,
    rowIndex,
    rawContent,
    status,
    errorCount,
    warningCount,
    healthScore,
    totalComponents: labels.length,
    validationIssues: issues,
    parsingSteps,
    parsedConfig: formConfig,
    fullParsedJson,
    labels,
    selectValues,
    radioValues,
    surveyValues,
    conditions,
  };
}

/**
 * Run bulk analysis across raw input string.
 */
export function analyzeBulkForms(rawInput, options = {}) {
  const formRecords = parseBulkFormInput(rawInput);
  const results = formRecords.map((rec) => validateSingleForm(rec, options));

  // Compute aggregated statistics
  let totalCriticalErrors = 0;
  let totalWarnings = 0;
  let cleanFormsCount = 0;
  let warningFormsCount = 0;
  let errorFormsCount = 0;
  let totalHealth = 0;
  const categoryCounts = {};

  results.forEach((form) => {
    totalCriticalErrors += form.errorCount;
    totalWarnings += form.warningCount;
    totalHealth += form.healthScore;

    if (form.status === "critical") {
      errorFormsCount++;
    } else if (form.status === "warning") {
      warningFormsCount++;
    } else {
      cleanFormsCount++;
    }

    (form.validationIssues || []).forEach((issue) => {
      const type = issue.type || "general";
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    });
  });

  const totalForms = results.length;
  const avgHealthScore = totalForms > 0 ? Math.round(totalHealth / totalForms) : 100;

  return {
    forms: results,
    stats: {
      totalForms,
      cleanFormsCount,
      warningFormsCount,
      errorFormsCount,
      totalCriticalErrors,
      totalWarnings,
      avgHealthScore,
      categoryCounts,
    },
  };
}

/**
 * Auto-fix all fixable issues in a single form result.
 */
export function autoFixSingleForm(formResult, options = {}) {
  const { parsedConfig, fullParsedJson, validationIssues, id, name, rowIndex } = formResult;
  if (!parsedConfig || !validationIssues) return formResult;

  const fixable = validationIssues.filter(
    (i) =>
      (i.type === "label_key_mismatch" ||
        i.type === "key_length_exceeded" ||
        i.type === "container_key_invalid") &&
      i.path &&
      i.expected
  );

  if (fixable.length === 0) return formResult;

  let currentConfig = parsedConfig;
  let patches = [];

  fixable.forEach((issue) => {
    const oldKey = getByPath(currentConfig, [...issue.path, "key"]);
    let updated = setByPath(currentConfig, [...issue.path, "key"], issue.expected);

    if (oldKey && oldKey !== issue.expected) {
      const res = updateConditionReferencesInJson(
        updated,
        oldKey,
        issue.expected,
        ["when"],
        patches,
        { referenceKey: oldKey }
      );
      updated = res.updated;
      patches = res.patches;
    }
    currentConfig = updated;
  });

  // Re-serialize back to rawContent
  const configPath = findPathToFormConfig(fullParsedJson, parsedConfig);
  const newFull = configPath.length === 0 ? currentConfig : setByPath(fullParsedJson, configPath, currentConfig);
  const newRawContent = JSON.stringify(newFull);

  return validateSingleForm(
    {
      id,
      name,
      rawContent: newRawContent,
      rowIndex,
    },
    options
  );
}

/**
 * Auto-fix all forms in bulk batch.
 */
export function autoFixBulkForms(bulkResults, options = {}) {
  const fixedForms = (bulkResults.forms || []).map((form) => autoFixSingleForm(form, options));

  // Recalculate stats
  let totalCriticalErrors = 0;
  let totalWarnings = 0;
  let cleanFormsCount = 0;
  let warningFormsCount = 0;
  let errorFormsCount = 0;
  let totalHealth = 0;
  const categoryCounts = {};

  fixedForms.forEach((form) => {
    totalCriticalErrors += form.errorCount;
    totalWarnings += form.warningCount;
    totalHealth += form.healthScore;

    if (form.status === "critical") {
      errorFormsCount++;
    } else if (form.status === "warning") {
      warningFormsCount++;
    } else {
      cleanFormsCount++;
    }

    (form.validationIssues || []).forEach((issue) => {
      const type = issue.type || "general";
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    });
  });

  const totalForms = fixedForms.length;
  const avgHealthScore = totalForms > 0 ? Math.round(totalHealth / totalForms) : 100;

  return {
    forms: fixedForms,
    stats: {
      totalForms,
      cleanFormsCount,
      warningFormsCount,
      errorFormsCount,
      totalCriticalErrors,
      totalWarnings,
      avgHealthScore,
      categoryCounts,
    },
  };
}

/**
 * Format bulk results back into a TSV string (FormId\tCaption\tDescription)
 */
export function exportBulkResultsToTSV(bulkResults) {
  const header = "FormId\tCaption\tDescription";
  const rows = (bulkResults.forms || []).map((f) => {
    const id = f.id || "";
    const name = f.name || "";
    const content = typeof f.fullParsedJson === "object" && f.fullParsedJson !== null
      ? JSON.stringify(f.fullParsedJson)
      : f.rawContent || "";
    return `${id}\t${name}\t${content}`;
  });

  return [header, ...rows].join("\n");
}
