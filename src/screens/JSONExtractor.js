import React, { useState, useMemo, useEffect } from "react";
import {
  extractLabelsFromJSON,
  extractSelectValues,
  extractSurveyValues,
  extractRadioValues,
  extractConditions,
  convertLabelToKey,
  updateConditionReferencesInJson,
} from "../utils/utils";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  ProgressBar,
  Badge,
  InputGroup,
} from "react-bootstrap";
import {
  extractFormJson,
  deepParse,
  isValidJson,
  extractJsonKeys,
  countJsonElements,
  searchKeysInObject,
  formatJsonString,
  removeSubmitButtonsOutsideContainer,
} from "../utils/jsonUtils";

import { exportToExcel } from "../utils/exportUtils";
import { importFromExcel } from "../utils/importutils";

import {
  DuplicateLabelsSection,
  DuplicateAPISection,
  DuplicateValuesSection,
  SelectComponentsSection,
  SurveyComponentsSection,
  KeyLengthWarningsSection,
  DuplicateSurveyValuesSection,
  TypeFilterSection,
  JsonStatsSection,
  RadioComponentsSection,
  DuplicateRadioValuesSection,
  ConditionsSection,
} from "../common/sections";

import { checkReservedColumnMatch } from "../config/reservedColumns";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const validateFormStructure = (labels = [], selectValues = [], radioValues = [], formConfig = {}, formType = "Form") => {
  const issues = [];

  (labels || []).forEach((entry) => {
    if (entry.type === "content" || entry.type === "columns") return;
    const fieldLabel = entry.type === "panel" ? entry.title : entry.label;
    const fieldKey = entry.key;

    if (fieldLabel && fieldKey && typeof fieldKey === "string") {
      const expectedKey = convertLabelToKey(fieldLabel);
      if (expectedKey && fieldKey !== expectedKey) {
        issues.push({
          type: "label_key_mismatch",
          severity: "warning",
          field: fieldLabel,
          key: fieldKey,
          expected: expectedKey,
          message: `Label and Key mismatch: "${fieldLabel}" should have key "${expectedKey}", not "${fieldKey}"`,
        });
      }
    }

    if (entry.type === "datagrid" || entry.type === "editgrid") {
      const hasGridKeyword = fieldKey && typeof fieldKey === "string" && (fieldKey.includes("Data_Grid") || fieldKey.includes("Grid") || fieldKey.toLowerCase().includes("data_grid") || fieldKey.toLowerCase().includes("grid"));
      if (!hasGridKeyword) {
        issues.push({
          type: "grid_key_missing_keyword",
          severity: "error",
          field: fieldLabel,
          key: fieldKey,
          message: `${entry.type === "datagrid" ? "Datagrid" : "Editgrid"} field key "${fieldKey}" must contain the keyword "Data_Grid" or "Grid"`,
        });
      }
    }

    const reservedMatch = checkReservedColumnMatch(fieldKey, formType);
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

// ─────────────────────────────────────────────────────────────
// Deep path helpers
// ─────────────────────────────────────────────────────────────

/** Read a value from a nested object using a path array */
const getByPath = (obj, path) => {
  let cur = obj;
  for (const seg of path) {
    if (cur == null) return undefined;
    cur = cur[seg];
  }
  return cur;
};

/** Immutably set a value in a nested object using a path array */
const setByPath = (obj, path, value) => {
  if (path.length === 0) return value;
  const [head, ...tail] = path;
  if (Array.isArray(obj)) {
    const copy = [...obj];
    copy[head] = setByPath(copy[head], tail, value);
    return copy;
  }
  return { ...obj, [head]: setByPath(obj[head], tail, value) };
};

/**
 * Walk every node in the JSON tree and update condition references.
 * When a field key changes, update conditional.when references.
 * When a select/radio option value changes, update conditional.eq references.
 */
const updateConditionalsInJson = (obj, oldValue, newValue, fields = ["when"], patches = [], options = {}) => {
  return updateConditionReferencesInJson(obj, oldValue, newValue, fields, patches, options);
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function JSONExtractor() {
  const [jsonInput, setJsonInput] = useState("");
  const [searchKeys, setSearchKeys] = useState("");
  const [keyLengthThreshold, setKeyLengthThreshold] = useState(110);
  const [formType, setFormType] = useState("Form");
  const [hiddenTypes, setHiddenTypes] = useState([
    "columns","content","container","panel","button",
  ]);

  const STORAGE_KEY = "JSONExtractorDraft";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setJsonInput(saved);
    } catch (err) {
      console.warn("Unable to load extractor draft", err);
    }
  }, []);

  useEffect(() => {
    try {
      if (jsonInput) {
        localStorage.setItem(STORAGE_KEY, jsonInput);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn("Unable to save extractor draft", err);
    }
  }, [jsonInput]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsingSteps, setParsingSteps] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const [showValidationIssues, setShowValidationIssues] = useState(true);

  const [importWarnings, setImportWarnings] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const importFileRef    = React.useRef(null);
  // Stores the extracted formConfig object so all path-based edits
  // are relative to it, not to the raw fullParsedJson wrapper.
  const formConfigRef    = React.useRef(null);
  // Stores the path from fullParsedJson root → formConfig node,
  // so we can write the updated formConfig back into the wrapper.
  const formConfigPathRef = React.useRef([]);

  const [extractedData, setExtractedData] = useState(null);
  const [fullParsedJson, setFullParsedJson] = useState(null);
  const [validationIssues, setValidationIssues] = useState([]);
  // Tracks which conditional.when fields were auto-patched in the last key fix
  const [conditionalPatches, setConditionalPatches] = useState([]);

  const addStep = (step, success = true, details = "") => {
    setParsingSteps((prev) => [
      ...prev,
      { step, success, details, timestamp: new Date().toISOString() },
    ]);
  };

  const resetResults = () => {
    setExtractedData(null);
    setFullParsedJson(null);
    setError("");
    setParsingSteps([]);
    setValidationIssues([]);
  };

  // ── Import from Excel ────────────────────────────────────
  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportWarnings([]);
    setIsImporting(true);
    resetResults();
    try {
      const { formJson, warnings } = await importFromExcel(file);
      setJsonInput(JSON.stringify(formJson, null, 2));
      if (warnings.length > 0) setImportWarnings(warnings);
    } catch (err) {
      setError("Import failed: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  // ── Extract ──────────────────────────────────────────────
  const handleExtract = async () => {
    if (!jsonInput.trim()) {
      setError("Please paste your JSON data first.");
      return;
    }
    resetResults();
    setIsLoading(true);

    try {
      addStep("Starting extraction process");

      if (!isValidJson(jsonInput)) {
        throw new Error("Invalid JSON syntax. Check for missing commas, brackets, or quotes.");
      }
      addStep("JSON syntax validation", true, "Valid JSON format");

      addStep("Locating form configuration");
      const parsedInput = JSON.parse(jsonInput);
      const formConfig = extractFormJson(parsedInput);

      if (!formConfig) {
        throw new Error(
          "Could not find form configuration. Common causes:\n" +
          "• JSON is wrapped in { config: \"...escaped JSON...\" }\n" +
          "• It's inside a 'display' or 'submission' object\n" +
          "• The key is not 'components'"
        );
      }
      if (!formConfig.components || !Array.isArray(formConfig.components)) {
        throw new Error("Form configuration found but missing 'components' array.");
      }

      const initialCompCount = formConfig.components.length;
      formConfig.components = removeSubmitButtonsOutsideContainer(formConfig.components) || [];
      const removedSubmitCount = initialCompCount - formConfig.components.length;
      if (removedSubmitCount > 0) {
        addStep("Submit button cleanup", true, `Removed ${removedSubmitCount} submit button(s) outside of container`);
      }

      addStep("Form configuration located", true, `${formConfig.components.length} top-level components found`);

      addStep("Validating container structure");
      const containers = findComponentsByType(formConfig, "container");
      const containerErrors = [];
      if (containers.length !== 1) {
        containerErrors.push(`Expected exactly 1 container, found ${containers.length}`);
      } else {
        const mainContainer = containers[0];
        if (mainContainer.label !== "Container" || mainContainer.key !== "Container") {
          containerErrors.push(
            `Container must have label/key = 'Container'. Got: label="${mainContainer.label}", key="${mainContainer.key}"`
          );
        }
        if (formConfig !== mainContainer) {
          containerErrors.push("The root object should be the Container itself");
        }
      }
      if (containerErrors.length > 0) {
        addStep("Container validation", false, containerErrors.join("; "));
      } else {
        addStep("Container validation", true, "Single valid container found");
      }

      addStep("Checking for disallowed components");
      const surveys = findComponentsByType(formConfig, "survey");
      const editgrids = findComponentsByType(formConfig, "editgrid");
      const disallowedErrors = [];
      if (surveys.length > 0) disallowedErrors.push(`${surveys.length} survey component(s)`);
      if (editgrids.length > 0) disallowedErrors.push(`${editgrids.length} editgrid(s)`);
      if (disallowedErrors.length > 0) {
        addStep("Disallowed components check", false, `Found: ${disallowedErrors.join(", ")}`);
      } else {
        addStep("Disallowed components check", true, "No disallowed components found");
      }

      addStep("Extracting field labels and keys");
      const labels = extractLabelsFromJSON(formConfig, [], []);
      addStep("Label extraction", true, `${labels.length} fields extracted`);

      addStep("Checking Datagrid and Editgrid keys for keyword");
      const gridFields = labels.filter((l) => l.type === "datagrid" || l.type === "editgrid");
      const invalidGridFields = gridFields.filter(
        (g) =>
          !g.key ||
          (!g.key.includes("Data_Grid") &&
            !g.key.includes("Grid") &&
            !g.key.toLowerCase().includes("data_grid") &&
            !g.key.toLowerCase().includes("grid"))
      );
      if (invalidGridFields.length > 0) {
        addStep(
          "Datagrid/Editgrid key keyword check",
          false,
          `Found ${invalidGridFields.length} grid(s) missing 'Data_Grid' or 'Grid' in key`
        );
      } else {
        addStep(
          "Datagrid/Editgrid key keyword check",
          true,
          gridFields.length > 0
            ? `All ${gridFields.length} grid key(s) valid`
            : "No datagrid/editgrid components found"
        );
      }

      addStep("Parsing full JSON for analysis");
      const parsedFull = parsedInput;
      setFullParsedJson(parsedFull);
      const depth = Math.max(1, ...Object.values(parsedFull).map((v) => calculateDepth(v, 1)));

      // Keep the form config tied to the same object instance as the live JSON tree
      formConfigRef.current     = formConfig;
      formConfigPathRef.current = findPathToFormConfig(parsedFull, formConfig);

      addStep("Extracting dropdown/radio/survey options");
      const selectValues = extractSelectValues(formConfig);
      const radioValues = extractRadioValues(formConfig);
      const surveyValues = extractSurveyValues(formConfig);
      addStep(
        "Options extraction",
        true,
        `${selectValues.length} select, ${radioValues.length} radio, ${surveyValues.length} survey fields`
      );

      addStep("Analyzing conditions and logic");
      const conditions = extractConditions(formConfig);
      addStep("Conditions analysis", true, `${conditions.length} conditional components found`);

      let searchResults = [];
      if (searchKeys.trim()) {
        addStep("Searching for specified keys");
        const keys = searchKeys.split(",").map((k) => k.trim()).filter(Boolean);
        searchResults = searchKeysInObject(parsedFull, keys);
        addStep(
          "Key search completed",
          true,
          `${searchResults.filter((r) => r.found).length}/${keys.length} keys found`
        );
      }

      addStep("Validating form structure and field integrity");
      const issues = validateFormStructure(labels, selectValues, radioValues, formConfig, formType);
      const errorIssues = issues.filter((i) => i.severity === "error");
      addStep(
        "Form structure validation",
        errorIssues.length === 0,
        errorIssues.length > 0
          ? `Found ${errorIssues.length} critical issue(s)`
          : issues.length > 0
          ? `Found ${issues.length} warning(s)`
          : "No issues found"
      );
      setValidationIssues(issues);

      if (errorIssues.length > 0) {
        addStep("Extraction completed with errors", false, `Found ${errorIssues.length} critical issue(s)`);
      } else {
        addStep("Extraction completed!", true, "Results ready below");
      }

      setExtractedData({
        labels,
        selectValues,
        radioValues,
        surveyValues,
        conditions,
        searchResults,
        jsonStats: {
          totalElements: countJsonElements(parsedFull),
          uniqueKeys: extractJsonKeys(parsedFull).length,
          depth,
          isArray: Array.isArray(parsedFull),
          formElements: labels.length,
        },
      });
    } catch (err) {
      console.error("Critical extraction failure:", err);
      addStep("Extraction failed critically", false, err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const findComponentsByType = (obj, type, results = []) => {
    if (obj.type === type) results.push(obj);
    if (obj.components)
      obj.components.forEach((comp) => findComponentsByType(comp, type, results));
    if (obj.columns)
      obj.columns.forEach(
        (col) => col.components && col.components.forEach((comp) => findComponentsByType(comp, type, results))
      );
    return results;
  };

  /**
   * Walk parsedFull to find the path array that leads to the formConfig node.
   * Uses reference equality — formConfig must be the exact object from parsedFull.
   * Returns [] if formConfig IS parsedFull (no wrapping).
   */
  const findPathToFormConfig = (root, target) => {
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

  const calculateDepth = (obj, current = 0) => {
    if (!obj || typeof obj !== "object") return current;
    if (Array.isArray(obj))
      return obj.length > 0
        ? Math.max(...obj.map((item) => calculateDepth(item, current + 1)))
        : current;
    return Object.values(obj).length > 0
      ? Math.max(...Object.values(obj).map((v) => calculateDepth(v, current + 1)))
      : current;
  };

  // ─────────────────────────────────────────────────────────
  // Central JSON update — rebuilds fullParsedJson, jsonInput,
  // extractedData after any edit.
  // ─────────────────────────────────────────────────────────
  /**
   * updatedFormConfig — the already-modified formConfig node.
   * Writes it back into fullParsedJson at formConfigPathRef, then
   * refreshes all derived state.
   */
  const applyJsonUpdate = (updatedFormConfig, patches = []) => {
    formConfigRef.current = updatedFormConfig;

    // Write the updated formConfig back into the full JSON wrapper
    const cfgPath   = formConfigPathRef.current;
    const newFull   = cfgPath.length === 0
      ? updatedFormConfig
      : setByPath(fullParsedJson, cfgPath, updatedFormConfig);

    setFullParsedJson(newFull);
    setJsonInput(formatJsonString(newFull));
    setConditionalPatches(patches);

    const newLabels     = extractLabelsFromJSON(updatedFormConfig, [], []);
    const newSelect     = extractSelectValues(updatedFormConfig);
    const newRadio      = extractRadioValues(updatedFormConfig);
    const newSurvey     = extractSurveyValues(updatedFormConfig);
    const newConditions = extractConditions(updatedFormConfig);

    setExtractedData((prev) => ({
      ...prev,
      labels:       newLabels,
      selectValues: newSelect,
      radioValues:  newRadio,
      surveyValues: newSurvey,
      conditions:   newConditions,
    }));
  };

  // ── Update a field's label or key ────────────────────────
  // Also auto-updates conditional.when when the key changes.
  const updateJsonField = (path, field, newValue) => {
    const base = formConfigRef.current;
    let updated = setByPath(base, [...path, field], newValue);
    let patches = [];

    if (field === "key") {
      const oldKey = getByPath(base, [...path, "key"]);
      if (oldKey && oldKey !== newValue) {
        const res = updateConditionalsInJson(updated, oldKey, newValue, ["when"], [], { referenceKey: oldKey });
        updated = res.updated;
        patches = res.patches;
      }
    }

    applyJsonUpdate(updated, patches);
  };

  // ── Update a select/radio option's label or value ────────
  // path     = path to the component (e.g. ["components", 0, ...])
  // optIdx   = index inside data.values (select) or values (radio)
  // field    = "label" | "value"
  // newValue = new string
  // kind     = "select" | "radio"
  const updateOptionField = (path, optIdx, field, newValue, kind) => {
    const base      = formConfigRef.current;
    const valuesKey = kind === "select" ? ["data", "values"] : ["values"];
    const optPath   = [...path, ...valuesKey, optIdx, field];

    let updated = setByPath(base, optPath, newValue);
    let patches = [];

    if (field === "value") {
      const oldValue = getByPath(base, [...path, ...valuesKey, optIdx, "value"]);
      const sourceComponent = getByPath(base, path);
      if (oldValue && oldValue !== newValue) {
        const res = updateConditionalsInJson(updated, oldValue, newValue, ["eq"], [], { referenceKey: sourceComponent?.key });
        updated = res.updated;
        patches = res.patches;
      }
    }

    applyJsonUpdate(updated, patches);
  };

  // ── Fix-key button for a field ───────────────────────────
  const fixFieldKey = (path, labelField) => {
    const node     = getByPath(formConfigRef.current, path);
    const label    = node?.[labelField] || "";
    const fixedKey = convertLabelToKey(label);
    if (!fixedKey) return;
    updateJsonField(path, "key", fixedKey);
  };

  // ── Fix-key button for a select/radio option ─────────────
  const fixOptionKey = (path, optIdx, kind) => {
    const valuesKey = kind === "select" ? ["data", "values"] : ["values"];
    const optPath   = [...path, ...valuesKey, optIdx];
    const option    = getByPath(formConfigRef.current, optPath);
    if (!option) return;
    const fixedValue = convertLabelToKey(option.label);
    if (!fixedValue) return;
    updateOptionField(path, optIdx, "value", fixedValue, kind);
  };

  // ── Format / clear ───────────────────────────────────────
  const handleFormat = () => {
    if (!isValidJson(jsonInput)) {
      setError("Cannot format: Invalid JSON syntax");
      return;
    }
    try {
      const parsed = deepParse(JSON.parse(jsonInput));
      setJsonInput(formatJsonString(parsed));
      setError("");
    } catch (err) {
      setError("Formatting failed: " + err.message);
    }
  };

  const clearAll = () => {
    setJsonInput("");
    setSearchKeys("");
    resetResults();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Unable to clear extractor draft", err);
    }
  };

  const toggleType = (type) => {
    setHiddenTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const {
    labels       = [],
    selectValues = [],
    radioValues  = [],
    surveyValues = [],
    conditions   = [],
    searchResults = [],
    jsonStats    = {},
  } = extractedData || {};

  const filteredLabels = useMemo(() => {
    return labels.filter((entry) => {
      if (hiddenTypes.includes(entry.type)) return false;
      const term = searchKeys.toLowerCase();
      return (
        entry.label?.toLowerCase().includes(term) ||
        entry.key?.toLowerCase().includes(term) ||
        entry.type?.toLowerCase().includes(term) ||
        (entry.type === "panel" && entry.title?.toLowerCase().includes(term))
      );
    });
  }, [labels, hiddenTypes, searchKeys]);

  const longKeys = useMemo(
    () => labels.filter((e) => e.key && e.key.length > keyLengthThreshold),
    [labels, keyLengthThreshold]
  );

  const duplicateLabels = useMemo(() => {
    const map = {};
    labels.forEach((entry) => {
      if (entry.type === "content" || entry.type === "columns") return;
      const label = entry.type === "panel" ? entry.title : entry.label;
      if (label?.trim()) map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .filter(([_, count]) => count > 1)
      .map(([label, count]) => ({ label, count }));
  }, [labels]);

  const duplicateKeys = useMemo(() => {
    const map = {};
    labels.forEach((entry) => {
      if (entry.type === "content" || entry.type === "columns") return;
      if (entry.key?.trim()) map[entry.key] = (map[entry.key] || 0) + 1;
    });
    return Object.entries(map)
      .filter(([_, count]) => count > 1)
      .map(([key, count]) => ({ key, count }));
  }, [labels]);

  const uniqueTypes = [...new Set(labels.map((e) => e.type))];

  // ── TanStack table ───────────────────────────────────────
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnSizing, setColumnSizing] = useState({});

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        enableResizing: false,
        size: 40,
      },
      {
        accessorFn: (row) => (row.type === "panel" ? row.title : row.label),
        id: "label",
        header: "Label",
        enableSorting: true,
        enableResizing: true,
        size: 220,
      },
      {
        accessorKey: "key",
        id: "key",
        header: "Key",
        enableSorting: true,
        enableResizing: true,
        size: 220,
      },
      {
        accessorFn: (row) => row.key?.length || 0,
        id: "length",
        header: "Key Length",
        enableSorting: true,
        enableResizing: true,
        size: 100,
      },
      {
        accessorFn: (row) =>
          row.type === "select"
            ? row.multiple === true
              ? "multiselect"
              : "select"
            : row.type,
        id: "type",
        header: "Type",
        enableSorting: true,
        enableResizing: true,
        size: 110,
      },
      {
        accessorFn: (row) => row.format || "-",
        id: "format",
        header: "Format",
        enableSorting: false,
        enableResizing: true,
        size: 100,
      },
      {
        id: "actions",
        header: "Fix Key",
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => {
          const entry     = row.original;
          const labelField = entry.type === "panel" ? "title" : "label";
          const label     = entry[labelField] || "";
          const expected  = convertLabelToKey(label);
          const isMismatch = expected && entry.key !== expected;
          if (!isMismatch) return null;
          return (
            <Button
              size="sm"
              variant="outline-warning"
              title={`Fix to: ${expected}`}
              onClick={(e) => {
                e.stopPropagation();
                fixFieldKey(entry.path, labelField);
              }}
            >
              Fix → <code className="ms-1">{expected}</code>
            </Button>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullParsedJson, keyLengthThreshold]
  );

  const table = useReactTable({
    data: filteredLabels,
    columns,
    state: { globalFilter, columnSizing },
    onGlobalFilterChange: setGlobalFilter,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: true,
  });

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <Container fluid className="min-vh-100">
      <Row className="justify-content-center">
        <Col>
          {/* ── Input card ── */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="py-4">
              <h1 className="display-5 fw-bold text-center text-primary mb-0">
                Analyze Form JSON
              </h1>
            </Card.Header>

            <Card.Body className="p-4">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Paste Form JSON</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste your Form.io JSON here..."
                  className="font-monospace"
                  style={{ resize: "vertical" }}
                />
                <div className="mt-2 text-muted small">
                  Characters: {jsonInput.length} | Lines: {jsonInput.split("\n").length}
                </div>
              </Form.Group>

              <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                <Form.Select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  style={{ width: "120px" }}
                  size="sm"
                >
                  <option value="Form">Form</option>
                  <option value="Intake">Intake</option>
                </Form.Select>

                <Button onClick={handleExtract} disabled={isLoading || !jsonInput.trim()}>
                  {isLoading ? (
                    <><Spinner size="sm" className="me-2" />Extracting...</>
                  ) : (
                    "Extract & Validate"
                  )}
                </Button>

                <Button variant="outline-primary" onClick={handleFormat} disabled={!jsonInput.trim()}>
                  Format JSON
                </Button>

                <Button variant="outline-secondary" onClick={clearAll}>
                  Clear All
                </Button>

                <input
                  type="file"
                  accept=".xlsx"
                  ref={importFileRef}
                  style={{ display: "none" }}
                  onChange={handleImportExcel}
                />
                <Button
                  variant="outline-info"
                  onClick={() => importFileRef.current?.click()}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <><Spinner size="sm" className="me-2" />Importing...</>
                  ) : (
                    "Import from Excel"
                  )}
                </Button>

                <Form.Control
                  type="number"
                  min="50"
                  max="200"
                  value={keyLengthThreshold}
                  onChange={(e) => setKeyLengthThreshold(Number(e.target.value))}
                  style={{ width: "120px" }}
                  className="ms-auto"
                />
                <Form.Label className="mb-0 text-nowrap">Key Limit</Form.Label>
              </div>

              {/* Parsing steps */}
              {parsingSteps.length > 0 && (
                <Card className="mb-3 border">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-semibold">Validation Steps</span>
                      {validationIssues.length > 0 && (
                        <Badge
                          bg={
                            validationIssues.filter((i) => i.severity === "error").length > 0
                              ? "danger"
                              : "warning"
                          }
                        >
                          {validationIssues.filter((i) => i.severity === "error").length > 0
                            ? `${validationIssues.filter((i) => i.severity === "error").length} Error(s)`
                            : `${validationIssues.length} Warning(s)`}
                        </Badge>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      {validationIssues.length > 0 && (
                        <Button
                          variant="link"
                          
                          size="sm"
                          onClick={() => setShowValidationIssues(!showValidationIssues)}
                        >
                          {showValidationIssues ? "Hide" : "Show"} Issues
                        </Button>
                      )}
                      <Button
                        variant="link"
                        
                        size="sm"
                        onClick={() => setShowDebug(!showDebug)}
                      >
                        {showDebug ? "Hide" : "Show"} Details
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <ProgressBar
                      now={
                        parsingSteps.length > 0
                          ? (parsingSteps.filter((s) => s.success).length / parsingSteps.length) * 100
                          : 0
                      }
                      variant={
                        validationIssues.some((i) => i.severity === "error") || parsingSteps.some((s) => !s.success)
                          ? "danger"
                          : validationIssues.some((i) => i.severity === "warning")
                          ? "warning"
                          : "success"
                      }
                      className="mb-3"
                    />

                    {showValidationIssues && validationIssues.length > 0 && (
                      <div className="mb-3 pb-3 border-bottom">
                        {validationIssues.filter((i) => i.severity === "error").length > 0 && (
                          <div className="mb-3">
                            <h6 className="text-danger fw-bold mb-2">
                              Errors ({validationIssues.filter((i) => i.severity === "error").length})
                            </h6>
                            <div className="list-group">
                              {validationIssues
                                .filter((i) => i.severity === "error")
                                .map((issue, idx) => (
                                  <div key={idx} className="list-group-item bg-danger bg-opacity-10 py-2">
                                    <div className="fw-bold text-danger small">{issue.message}</div>
                                    {issue.field && (
                                      <div className="small text-muted mt-1">Field: {issue.field}</div>
                                    )}
                                    {issue.key && (
                                      <div className="small text-muted">
                                        Key: <code>{issue.key}</code>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                        {validationIssues.filter((i) => i.severity === "warning").length > 0 && (
                          <div>
                            <h6 className="text-warning fw-bold mb-2">
                              Warnings ({validationIssues.filter((i) => i.severity === "warning").length})
                            </h6>
                            <div className="list-group">
                              {validationIssues
                                .filter((i) => i.severity === "warning")
                                .map((issue, idx) => (
                                  <div key={idx} className="list-group-item bg-warning bg-opacity-10 py-2">
                                    <div className="fw-bold text-warning small">{issue.message}</div>
                                    {issue.field && (
                                      <div className="small text-muted mt-1">Field: {issue.field}</div>
                                    )}
                                    {issue.expected && (
                                      <div className="small text-muted">
                                        Expected: <code>{issue.expected}</code>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {showDebug &&
                      parsingSteps.map((step, i) => (
                        <div
                          key={i}
                          className={`small ${step.success ? "text-success" : "text-danger"}`}
                        >
                          <strong>
                            {step.success ? "✓" : "✗"} {step.step}
                          </strong>
                          {step.details && (
                            <span className="ms-2 text-muted">— {step.details}</span>
                          )}
                        </div>
                      ))}
                  </Card.Body>
                </Card>
              )}

              {importWarnings.length > 0 && (
                <Alert variant="warning" dismissible onClose={() => setImportWarnings([])}>
                  <Alert.Heading>Import completed with warnings</Alert.Heading>
                  <ul className="mb-0">
                    {importWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {error && <Alert variant="danger">{error}</Alert>}
            </Card.Body>
          </Card>

          {/* ── Results ── */}
          {extractedData && (
            <>
              <div className="d-flex justify-content-end mb-3">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() =>
                    exportToExcel(labels, hiddenTypes, selectValues, radioValues)
                  }
                >
                  Export to Excel
                </Button>
              </div>

              <Row>
                <Col>
                  <JsonStatsSection
                    jsonStats={jsonStats}
                    searchResults={searchResults.length > 0 ? searchResults : null}
                  />

                  <DuplicateLabelsSection duplicateLabels={duplicateLabels} />
                  <DuplicateAPISection duplicateKeys={duplicateKeys} />
                  <KeyLengthWarningsSection longKeys={longKeys} threshold={keyLengthThreshold} />
                  <DuplicateValuesSection selectValues={selectValues} />
                  <DuplicateRadioValuesSection radioValues={radioValues} />
                  <DuplicateSurveyValuesSection surveyValues={surveyValues} />

                  {/* Select with inline editing + fix-key */}
                  <SelectComponentsSection
                    selectValues={selectValues}
                    onUpdateOption={(path, optIdx, field, value) =>
                      updateOptionField(path, optIdx, field, value, "select")
                    }
                    onFixOptionKey={(path, optIdx) => fixOptionKey(path, optIdx, "select")}
                  />

                  {/* Radio with inline editing + fix-key */}
                  <RadioComponentsSection
                    radioValues={radioValues}
                    onUpdateOption={(path, optIdx, field, value) =>
                      updateOptionField(path, optIdx, field, value, "radio")
                    }
                    onFixOptionKey={(path, optIdx) => fixOptionKey(path, optIdx, "radio")}
                  />

                  <SurveyComponentsSection surveyValues={surveyValues} />
                  <ConditionsSection conditions={conditions} conditionalPatches={conditionalPatches} />
                  <TypeFilterSection
                    uniqueTypes={uniqueTypes}
                    hiddenTypes={hiddenTypes}
                    onToggle={toggleType}
                  />

                  {/* ── Fields table ── */}
                  <Card className="mt-4">
                    <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <span className="fw-semibold">
                          Extracted Fields ({table.getRowModel().rows.length} shown /{" "}
                          {labels.length} total)
                        </span>
                        {table.getSelectedRowModel().rows.length > 0 && (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => {
                              const selected = table
                                .getSelectedRowModel()
                                .rows.map((r) => r.original);
                              const json = JSON.stringify(
                                selected.map((r) => {
                                  const item = {
                                    label: r.type === "panel" ? r.title : r.label,
                                    key: r.key,
                                    type: r.type,
                                  };
                                  if (r.type === "select") {
                                    item.multiple = r.multiple === true;
                                  }
                                  return item;
                                }),
                                null,
                                2
                              );
                              navigator.clipboard.writeText(json);
                              alert(`Copied ${selected.length} selected rows as JSON!`);
                            }}
                          >
                            Copy {table.getSelectedRowModel().rows.length} Selected
                          </Button>
                        )}
                      </div>

                      <InputGroup style={{ width: "320px" }}>
                        <InputGroup.Text>🔍</InputGroup.Text>
                        <Form.Control
                          value={globalFilter ?? ""}
                          onChange={(e) => setGlobalFilter(e.target.value)}
                          placeholder="Search all columns..."
                        />
                        {globalFilter && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => setGlobalFilter("")}
                          >
                            ×
                          </Button>
                        )}
                      </InputGroup>
                    </Card.Header>

                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0 align-middle">
                          <thead className="table-dark">
                            {table.getHeaderGroups().map((headerGroup) => (
                              <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                  <th
                                    key={header.id}
                                    style={{
                                      width: header.getSize(),
                                      minWidth: header.getSize(),
                                      maxWidth: header.getSize(),
                                      position: "relative",
                                      cursor: header.column.getCanSort() ? "pointer" : "default",
                                      userSelect: "none",
                                    }}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    <div className="d-flex justify-content-between align-items-center">
                                      {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                      {header.column.getIsSorted() && (
                                        <span>
                                          {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                                        </span>
                                      )}
                                    </div>
                                    {header.column.id !== "select" &&
                                      header.column.id !== "actions" && (
                                        <Button
                                          size="sm"
                                          variant="outline-light"
                                          className="mt-2 w-100"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const values = table
                                              .getRowModel()
                                              .rows.map((row) => {
                                                if (header.column.id === "label")
                                                  return row.original.type === "panel"
                                                    ? row.original.title
                                                    : row.original.label;
                                                return row.getValue(header.column.id);
                                              })
                                              .filter((v) => v != null && v !== "")
                                              .join("\n");
                                            navigator.clipboard.writeText(values);
                                            alert(
                                              `Copied all "${header.column.columnDef.header}" values!`
                                            );
                                          }}
                                        >
                                          Copy
                                        </Button>
                                      )}

                                    {/* Drag handle for column resizing */}
                                    {header.column.getCanResize() && (
                                      <div
                                        onMouseDown={header.getResizeHandler()}
                                        onTouchStart={header.getResizeHandler()}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          position: "absolute",
                                          right: 0,
                                          top: 0,
                                          height: "100%",
                                          width: "5px",
                                          cursor: "col-resize",
                                          background: header.column.getIsResizing()
                                            ? "rgba(255,255,255,0.5)"
                                            : "transparent",
                                          userSelect: "none",
                                          touchAction: "none",
                                        }}
                                        title="Drag to resize column"
                                      />
                                    )}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={columns.length}
                                  className="text-center py-4 text-muted"
                                >
                                  No fields match your search
                                </td>
                              </tr>
                            ) : (
                              table.getRowModel().rows.map((row) => (
                                <tr
                                  key={row.id}
                                  className={row.getIsSelected() ? "table-primary" : ""}
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <td
                                      key={cell.id}
                                      onClick={() => {
                                        if (
                                          cell.column.id === "select" ||
                                          cell.column.id === "actions"
                                        )
                                          return;
                                        const value = cell.getValue();
                                        const text =
                                          typeof value === "string"
                                            ? value
                                            : String(value || "");
                                        if (text && text !== "-") {
                                          navigator.clipboard.writeText(text);
                                          alert(`Copied: ${text}`);
                                        }
                                      }}
                                      style={{ cursor: "pointer" }}
                                      title={
                                        cell.column.id !== "select" &&
                                        cell.column.id !== "actions"
                                          ? "Click to copy"
                                          : undefined
                                      }
                                    >
                                      {cell.column.id === "label" ? (
                                        <Form.Control
                                          value={
                                            row.original.type === "panel"
                                              ? row.original.title
                                              : row.original.label
                                          }
                                          onChange={(e) =>
                                            updateJsonField(
                                              row.original.path,
                                              row.original.type === "panel" ? "title" : "label",
                                              e.target.value
                                            )
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      ) : cell.column.id === "key" ? (
                                        <Form.Control
                                          value={row.original.key || ""}
                                          onChange={(e) =>
                                            updateJsonField(
                                              row.original.path,
                                              "key",
                                              e.target.value
                                            )
                                          }
                                          className="font-monospace small"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      ) : cell.column.id === "length" ? (
                                        <Badge
                                          bg={
                                            row.original.key?.length > keyLengthThreshold
                                              ? "danger"
                                              : "success"
                                          }
                                        >
                                          {row.original.key?.length || 0}
                                          {row.original.key?.length > keyLengthThreshold &&
                                            " ⚠️"}
                                        </Badge>
                                      ) : cell.column.id === "type" ? (
                                        <Badge bg="info">{cell.getValue()}</Badge>
                                      ) : (
                                        flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext()
                                        )
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}