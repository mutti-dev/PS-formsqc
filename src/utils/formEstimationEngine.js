/**
 * formEstimationEngine.js
 *
 * Implements the "Form Complexity and Estimation Standard For Internal Use"
 * Field-Based Complexity Model & Form-to-Page Mapping.
 */

// Layout / non-data capture types excluded from field complexity
export const EXCLUDED_LAYOUT_TYPES = new Set([
  "columns",
  "column",
  "panel",
  "container",
  "well",
  "fieldset",
  "table",
  "tabs",
  "button",
  "submit",
  "reset",
]);

// Content types tracked separately for page estimation
export const CONTENT_TYPES = new Set([
  "content",
  "htmlelement",
  "html",
]);

// Base standard weights for standalone data capture fields
export const STANDARD_FIELD_WEIGHTS = {
  textfield: 1,
  phoneNumber: 1,
  currency: 1,
  url: 1,
  number: 1,
  email: 1,
  signature: 1,
  datetime: 1,
  date: 1,
  time: 1,
  day: 1,
  select: 1,
  selectboxes: 1,
  radio: 1,
  checkbox: 1,
  textarea: 1,
  file: 2,
  fileUpload: 2,
  upload: 2,
  datagrid: 2,
  editgrid: 2,
  calculated: 3,
  autopopulation: 1,
};

/**
 * Checks if a component is a calculated field
 */
export const isCalculatedField = (component) => {
  if (!component || typeof component !== "object") return false;
  if (component.type === "calculated") return true;
  if (
    typeof component.calculateValue === "string" &&
    component.calculateValue.trim().length > 0
  ) {
    return true;
  }
  if (
    typeof component.calculateServer === "boolean" &&
    component.calculateServer &&
    typeof component.calculateValue === "string"
  ) {
    return true;
  }
  return false;
};

/**
 * Checks if a component has auto-population logic
 */
export const isAutoPopulationField = (component) => {
  if (!component || typeof component !== "object") return false;
  if (component.type === "autopopulation") return true;
  if (component.autoPopulate === true) return true;
  if (Array.isArray(component.logic)) {
    const hasPopulateLogic = component.logic.some((l) => {
      const name = (l.name || "").toLowerCase();
      const triggerEvent = (l.trigger?.event || "").toLowerCase();
      const actionName = (l.actions?.[0]?.name || "").toLowerCase();
      return (
        name.includes("populate") ||
        triggerEvent.includes("populate") ||
        actionName.includes("populate")
      );
    });
    if (hasPopulateLogic) return true;
  }
  return false;
};

/**
 * Normalizes component type into standardized category key and display name
 */
export const categorizeFieldType = (component) => {
  if (!component || !component.type) return { key: "unknown", name: "Other Field", weight: 1 };

  const rawType = String(component.type).trim();
  const lowerType = rawType.toLowerCase();

  // 1. Calculated Field Check (Weight 3)
  if (isCalculatedField(component)) {
    return { key: "calculated", name: "Calculated Field", weight: 3 };
  }

  // 2. Auto-population Field Check (Weight 1)
  if (isAutoPopulationField(component)) {
    return { key: "autopopulation", name: "Auto-population Field", weight: 1 };
  }

  // 3. Specific Standard Types
  switch (lowerType) {
    case "textfield":
    case "phonenumber":
    case "currency":
    case "url":
      return { key: "textfield", name: "Text Field", weight: 1 };

    case "number":
      return { key: "number", name: "Number Field", weight: 1 };

    case "email":
      return { key: "email", name: "Email Field", weight: 1 };

    case "signature":
      return { key: "signature", name: "Signature", weight: 1 };

    case "datetime":
    case "date":
    case "time":
    case "day":
      return { key: "datetime", name: "Date / Time", weight: 1 };

    case "select":
    case "selectboxes":
      return { key: "select", name: "Select Dropdown", weight: 1 };

    case "radio":
      return { key: "radio", name: "Radio Button", weight: 1 };

    case "checkbox":
      return { key: "checkbox", name: "Checkbox", weight: 1 };

    case "textarea":
      return { key: "textarea", name: "Text Area", weight: 1 };

    case "file":
    case "fileupload":
    case "upload":
      return { key: "file", name: "File Upload", weight: 2 };

    case "datagrid":
    case "editgrid":
      return { key: "datagrid", name: "Datagrid", weight: 2 };

    default:
      return { key: lowerType, name: rawType, weight: 1 };
  }
};

/**
 * Calculates page count from total weight based on the 10-point standard brackets
 */
export const calculateEquivalentPages = (totalWeight) => {
  if (!totalWeight || totalWeight <= 0) return 0;
  return Math.ceil(totalWeight / 10);
};

/**
 * Generates page bracket mapping reference
 */
export const getPageBracketInfo = (totalWeight) => {
  const currentPages = calculateEquivalentPages(totalWeight);
  const maxBracket = Math.max(4, currentPages + 1);
  const brackets = [];

  for (let i = 1; i <= maxBracket; i++) {
    const minWeight = (i - 1) * 10 + 1;
    const maxWeight = i * 10;
    brackets.push({
      pages: i,
      pageLabel: i === 1 ? "1 Page" : `${i} Pages`,
      rangeLabel: `${minWeight} – ${maxWeight}`,
      minWeight,
      maxWeight,
      isCurrent: totalWeight >= minWeight && totalWeight <= maxWeight,
    });
  }

  return {
    currentPages,
    brackets,
  };
};

/**
 * Main form complexity and page estimation calculator
 *
 * @param {object} formConfig - The root Form.io configuration object
 * @param {object} customWeights - Optional overrides for field type weights
 * @returns {object} Form estimation metrics and itemized breakdown
 */
export function calculateFormComplexity(formConfig, customWeights = {}) {
  if (!formConfig || typeof formConfig !== "object") {
    return {
      totalWeight: 0,
      equivalentPages: 0,
      totalDataFields: 0,
      contentSectionsCount: 0,
      estimatedContentPages: 0,
      totalEstimatedPages: 0,
      breakdown: [],
      datagrids: [],
      contentSections: [],
      pageBrackets: getPageBracketInfo(0),
    };
  }

  const weightsConfig = { ...STANDARD_FIELD_WEIGHTS, ...customWeights };

  // Track counts per standard category
  const regularFieldGroups = {};
  const datagridList = [];
  const contentList = [];
  let totalDataFieldsCount = 0;

  /**
   * Helper to collect data capture fields inside a datagrid
   */
  const collectDatagridInternalFields = (gridComp, gridPath = []) => {
    const internalFields = [];

    const traverseGrid = (node, path = []) => {
      if (!node || typeof node !== "object") return;

      const type = (node.type || "").toLowerCase().trim();

      if (type && !EXCLUDED_LAYOUT_TYPES.has(type) && !CONTENT_TYPES.has(type)) {
        internalFields.push({
          label: node.label || node.title || node.key || "Unnamed Field",
          key: node.key || "",
          type: node.type,
          path: [...path],
        });
      }

      if (Array.isArray(node.components)) {
        node.components.forEach((child, idx) =>
          traverseGrid(child, [...path, "components", idx])
        );
      }
      if (Array.isArray(node.columns)) {
        node.columns.forEach((col, cIdx) => {
          if (Array.isArray(col.components)) {
            col.components.forEach((child, idx) =>
              traverseGrid(child, [...path, "columns", cIdx, "components", idx])
            );
          }
        });
      }
    };

    if (Array.isArray(gridComp.components)) {
      gridComp.components.forEach((child, idx) =>
        traverseGrid(child, [...gridPath, "components", idx])
      );
    }
    if (Array.isArray(gridComp.columns)) {
      gridComp.columns.forEach((col, cIdx) => {
        if (Array.isArray(col.components)) {
          col.components.forEach((child, idx) =>
            traverseGrid(child, [...gridPath, "columns", cIdx, "components", idx])
          );
        }
      });
    }

    return internalFields;
  };

  /**
   * Main recursive tree traversal
   */
  const traverse = (node, path = []) => {
    if (!node || typeof node !== "object") return;

    const rawType = (node.type || "").toLowerCase().trim();

    // Check if it's a datagrid / editgrid
    if (rawType === "datagrid" || rawType === "editgrid") {
      const internalFields = collectDatagridInternalFields(node, path);
      const internalCount = internalFields.length;
      // Per spec: "Fields inside a datagrid are multiplied by a weight of 2.
      // For example, if a datagrid contains 4 fields, its total weight contribution is 8."
      // If empty datagrid with 0 internal fields, default weight is 2.
      const gridMultiplier = weightsConfig.datagrid || 2;
      const datagridWeight = internalCount > 0 ? internalCount * gridMultiplier : gridMultiplier;

      datagridList.push({
        label: node.label || node.title || node.key || "Datagrid",
        key: node.key || "",
        type: node.type,
        internalFields,
        internalCount,
        multiplier: gridMultiplier,
        totalWeight: datagridWeight,
        path: [...path],
      });

      totalDataFieldsCount += internalCount > 0 ? internalCount : 1;
      // Do not traverse children normally since we collected them inside the datagrid
      return;
    }

    // Check if it's a content component
    if (CONTENT_TYPES.has(rawType)) {
      const htmlLength = (node.html || node.label || "").length;
      contentList.push({
        label: node.label || "Content Section",
        key: node.key || "",
        htmlLength,
        path: [...path],
      });
      // Content sections are not included in field complexity calculation
      // but estimated separately.
      return;
    }

    // Check if it's a layout wrapper (excluded from field complexity)
    if (EXCLUDED_LAYOUT_TYPES.has(rawType)) {
      // Continue traversing children
      if (Array.isArray(node.components)) {
        node.components.forEach((child, idx) =>
          traverse(child, [...path, "components", idx])
        );
      }
      if (Array.isArray(node.columns)) {
        node.columns.forEach((col, cIdx) => {
          if (Array.isArray(col.components)) {
            col.components.forEach((child, idx) =>
              traverse(child, [...path, "columns", cIdx, "components", idx])
            );
          }
        });
      }
      return;
    }

    // It's a standard data capture field!
    const { key, name, weight } = categorizeFieldType(node);
    const resolvedWeight = weightsConfig[key] !== undefined ? weightsConfig[key] : weight;

    if (!regularFieldGroups[key]) {
      regularFieldGroups[key] = {
        key,
        name,
        count: 0,
        unitWeight: resolvedWeight,
        totalWeight: 0,
        fields: [],
      };
    }

    regularFieldGroups[key].count += 1;
    regularFieldGroups[key].totalWeight += resolvedWeight;
    regularFieldGroups[key].fields.push({
      label: node.label || node.title || node.key || "Unnamed",
      key: node.key || "",
      type: node.type,
      path: [...path],
    });

    totalDataFieldsCount += 1;

    // Traverse any nested components (e.g. if field has subcomponents)
    if (Array.isArray(node.components)) {
      node.components.forEach((child, idx) =>
        traverse(child, [...path, "components", idx])
      );
    }
    if (Array.isArray(node.columns)) {
      node.columns.forEach((col, cIdx) => {
        if (Array.isArray(col.components)) {
          col.components.forEach((child, idx) =>
            traverse(child, [...path, "columns", cIdx, "components", idx])
          );
        }
      });
    }
  };

  // Start traversal from root formConfig
  if (Array.isArray(formConfig)) {
    formConfig.forEach((item, idx) => traverse(item, [idx]));
  } else if (Array.isArray(formConfig.components)) {
    formConfig.components.forEach((item, idx) =>
      traverse(item, ["components", idx])
    );
  } else {
    traverse(formConfig, []);
  }

  // Construct Breakdown rows
  const breakdown = [];
  let totalFieldWeight = 0;

  // 1. Add regular field groups
  Object.values(regularFieldGroups).forEach((group) => {
    breakdown.push({
      key: group.key,
      name: group.name,
      count: group.count,
      unitWeightLabel: String(group.unitWeight),
      unitWeight: group.unitWeight,
      totalWeight: group.totalWeight,
      fields: group.fields,
      isDatagrid: false,
    });
    totalFieldWeight += group.totalWeight;
  });

  // 2. Add Datagrids
  datagridList.forEach((grid, idx) => {
    const gridName =
      grid.internalCount > 0
        ? `${grid.label} (${grid.internalCount} internal fields)`
        : `${grid.label} (Empty Grid)`;

    const weightFormulaLabel =
      grid.internalCount > 0
        ? `${grid.internalCount} × ${grid.multiplier}`
        : `${grid.multiplier}`;

    breakdown.push({
      key: `datagrid_${grid.key || idx}`,
      name: gridName,
      count: 1,
      internalCount: grid.internalCount,
      multiplier: grid.multiplier,
      unitWeightLabel: weightFormulaLabel,
      unitWeight: grid.totalWeight,
      totalWeight: grid.totalWeight,
      fields: grid.internalFields,
      isDatagrid: true,
      datagridKey: grid.key,
    });
    totalFieldWeight += grid.totalWeight;
  });

  // Sort breakdown by totalWeight descending
  breakdown.sort((a, b) => b.totalWeight - a.totalWeight);

  // Content estimation: per standard, content that spans one page is counted as one page
  const contentSectionsCount = contentList.length;
  // Baseline assumption: each content section is counted as 1 page if present or 0
  const estimatedContentPages = contentSectionsCount;

  const equivalentPages = calculateEquivalentPages(totalFieldWeight);
  const totalEstimatedPages = equivalentPages + estimatedContentPages;

  return {
    totalWeight: totalFieldWeight,
    equivalentPages,
    totalEstimatedPages,
    totalDataFields: totalDataFieldsCount,
    contentSectionsCount,
    estimatedContentPages,
    breakdown,
    datagrids: datagridList,
    contentSections: contentList,
    pageBrackets: getPageBracketInfo(totalFieldWeight),
  };
}
