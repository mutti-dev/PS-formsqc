/**
 * importUtils.js
 *
 * Converts an Excel file into a valid Form.io container JSON.
 *
 * Expected Excel columns (case-insensitive):
 *   Label | Key | KeyLength | Type | Format | Option Labels | Option Values | Parent
 *
 * The "Parent" column holds the Key of the parent panel or datagrid.
 * Leave it blank for root-level components (panels, content, button).
 *
 * Hierarchy rules:
 *   - panel / datagrid rows with no Parent → placed at root
 *   - Any field row with a Parent key → nested inside that panel/datagrid
 *   - Regular fields inside a panel are automatically wrapped in a
 *     2-column layout (6 + 6 width) matching the PlanStreet Form.io style
 *   - Fields inside a datagrid are placed directly (no column wrapper)
 *
 * Output structure:
 * {
 *   label: "Container", key: "Container", type: "container",
 *   input: true,
 *   components: [
 *     { type: "panel", components: [
 *         { type: "columns", columns: [
 *             { components: [field1], width:6, ... },
 *             { components: [field2], width:6, ... }
 *         ]},
 *         ...
 *     ]},
 *     { type: "datagrid", components: [field1, field2, ...] }
 *   ]
 * }
 */

import * as XLSX from "xlsx";
import { buildComponent, buildColumnsWrapper } from "../config/componentTemplates";

// ---------------------------------------------------------------------------
// Column name normalisation
// ---------------------------------------------------------------------------

const COLUMN_MAP = {
  label:          "label",
  key:            "key",
  keylength:      "keyLength",
  type:           "type",
  format:         "format",
  "option labels":"optionLabels",
  "option values":"optionValues",
  parent:         "parent",
};

const normaliseHeader = (header) =>
  COLUMN_MAP[String(header).toLowerCase().trim()] ?? String(header).toLowerCase().trim();

// ---------------------------------------------------------------------------
// Row → field descriptor
// ---------------------------------------------------------------------------

const rowToField = (rawRow) => {
  const row = {};
  Object.entries(rawRow).forEach(([k, v]) => {
    row[normaliseHeader(k)] = v ?? "";
  });

  return {
    label:        String(row.label        || "").trim(),
    key:          String(row.key          || "").trim(),
    type:         String(row.type         || "textfield").trim().toLowerCase(),
    format:       String(row.format       || "").trim(),
    optionLabels: String(row.optionLabels || "").trim(),
    optionValues: String(row.optionValues || "").trim(),
    parent:       String(row.parent       || "").trim(),
  };
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const validateField = (field, rowIndex) => {
  const errors = [];
  const prefix = `Row ${rowIndex + 2}`;

  if (!field.label) errors.push(`${prefix}: "Label" column is empty`);
  if (!field.key)   errors.push(`${prefix}: "Key" column is empty`);
  if (!field.type)  errors.push(`${prefix}: "Type" column is empty`);

  return errors;
};

// ---------------------------------------------------------------------------
// Types that act as containers (can be parents)
// ---------------------------------------------------------------------------
const CONTAINER_TYPES = new Set(["panel", "datagrid"]);

// Types that go directly at root without needing a parent
// const ROOT_TYPES = new Set(["panel", "datagrid", "content", "button"]);

// ---------------------------------------------------------------------------
// Columns wrapper key generator
// Generates a unique key for each columns wrapper inside a panel
// ---------------------------------------------------------------------------
let columnsCounter = 0;
const nextColumnsKey = () => {
  columnsCounter++;
  return columnsCounter === 1 ? "Columns" : `Columns${columnsCounter}`;
};

// ---------------------------------------------------------------------------
// Build hierarchy from flat field list
// ---------------------------------------------------------------------------

/**
 * Takes a flat array of field descriptors and returns a nested
 * Form.io component tree.
 *
 * Strategy:
 *  1. Build all components individually.
 *  2. Index panels and datagrids by key so children can find them.
 *  3. For fields inside a panel: group consecutive fields into columns
 *     wrappers (2 fields per columns row, each in a 6-wide slot).
 *  4. For fields inside a datagrid: push directly into datagrid.components.
 *  5. Root-level components go straight into the top-level array.
 */
const buildHierarchy = (fields, warnings) => {
  columnsCounter = 0;

  // Map key → built component (for panels and datagrids only)
  const containerMap = {};

  // Accumulates components in insertion order for root level
  const rootComponents = [];

  // Accumulates raw fields waiting to be flushed into a columns wrapper
  // keyed by parent panel key
  const pendingPanelFields = {};

  // Pass 1: build container skeletons so children can reference them
  fields.forEach((field) => {
    if (CONTAINER_TYPES.has(field.type)) {
      const comp = buildComponent(field);
      containerMap[field.key] = comp;
    }
  });

  // Helper: flush pending fields for a panel into a columns wrapper
  const flushPendingFields = (panelKey) => {
    const pending = pendingPanelFields[panelKey];
    if (!pending || pending.length === 0) return;

    const panel = containerMap[panelKey];
    if (!panel) return;

    // Group pairs of fields into a columns wrapper
    for (let i = 0; i < pending.length; i += 2) {
      const leftField  = pending[i];
      const rightField = pending[i + 1] || null;

      const leftSlot = {
        components: [leftField],
        width: 6, offset: 0, push: 0, pull: 0, size: "md", currentWidth: 6,
      };
      const rightSlot = {
        components: rightField ? [rightField] : [],
        width: 6, offset: 0, push: 0, pull: 0, size: "md", currentWidth: 6,
      };

      const wrapper = buildColumnsWrapper(nextColumnsKey(), [leftSlot, rightSlot]);
      panel.components.push(wrapper);
    }

    pendingPanelFields[panelKey] = [];
  };

  // Pass 2: place each field
  fields.forEach((field) => {
    const { type, key, parent } = field;

    if (CONTAINER_TYPES.has(type)) {
      // Container (panel / datagrid) — flush any pending before placing
      if (parent && containerMap[parent]) {
        flushPendingFields(parent);
        containerMap[parent].components.push(containerMap[key]);
      } else {
        rootComponents.push(containerMap[key]);
      }
      return;
    }

    const component = buildComponent(field);

    if (!parent) {
      // Root-level non-container (content, button, orphan fields)
      rootComponents.push(component);
      return;
    }

    const parentComp = containerMap[parent];
    if (!parentComp) {
      warnings.push(
        `Warning: field "${field.label}" (key="${key}") has Parent="${parent}" but no panel/datagrid with that key was found. Placed at root.`
      );
      rootComponents.push(component);
      return;
    }

    if (parentComp.type === "datagrid") {
      // Datagrid children go directly — no columns wrapper
      parentComp.components.push(component);
    } else {
      // Panel children accumulate and get wrapped in columns
      if (!pendingPanelFields[parent]) pendingPanelFields[parent] = [];
      pendingPanelFields[parent].push(component);
    }
  });

  // Final flush: flush any remaining pending fields for all panels
  Object.keys(pendingPanelFields).forEach(flushPendingFields);

  return rootComponents;
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Reads an .xlsx File object and resolves with the imported form JSON
 * and any warnings/errors collected during the process.
 *
 * @param {File} file - The .xlsx file selected by the user
 * @returns {Promise<{ formJson: object, warnings: string[], errors: string[] }>}
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error("The Excel file contains no sheets.");
        }

        const sheet = workbook.Sheets[sheetName];
        const rows  = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (rows.length === 0) {
          throw new Error(`Sheet "${sheetName}" is empty — no rows to import.`);
        }

        const warnings = [];
        const errors   = [];
        const validFields = [];

        rows.forEach((rawRow, idx) => {
          const field     = rowToField(rawRow);
          const rowErrors = validateField(field, idx);

          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
          } else {
            validFields.push(field);
          }
        });

        if (validFields.length === 0 && errors.length > 0) {
          reject(new Error("Import failed: all rows had validation errors.\n" + errors.join("\n")));
          return;
        }

        if (errors.length > 0) {
          warnings.push(
            `${errors.length} row(s) were skipped due to validation errors:`,
            ...errors
          );
        }

        const components = buildHierarchy(validFields, warnings);

        const formJson = {
          label: "Container",
          tableView: false,
          key: "Container",
          type: "container",
          input: true,
          components,
        };

        resolve({ formJson, warnings, errors });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsArrayBuffer(file);
  });
};
